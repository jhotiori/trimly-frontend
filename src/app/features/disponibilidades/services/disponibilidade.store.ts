/*
    Estado reativo das disponibilidades, recarregado a cada sessão.
*/

import type { HttpErrorResponse } from "@angular/common/http";
import { effect, Injectable, inject, signal, untracked } from "@angular/core";
import { catchError, map, type Observable, of, tap } from "rxjs";
import { ErrorMessages } from "../../../infra/config/messages.config";
import { AlertService, extractErrorMessage } from "../../../infra/services/alert.service";
import { AuthStore } from "../../auth/services/auth.store";
import type { DisponibilidadeCreateDTO } from "../models/disponibilidade-create.dto";
import type { DisponibilidadeResponseDTO } from "../models/disponibilidade-response.dto";
import type { DisponibilidadeUpdateDTO } from "../models/disponibilidade-update.dto";
import { DisponibilidadeService } from "./disponibilidade.service";

@Injectable({
    providedIn: "root",
})
export class DisponibilidadeStore {
    /** Serviço HTTP de disponibilidades. */
    private readonly service = inject(DisponibilidadeService);

    /**
     * Sessão do usuário, cuja abertura recarrega a lista e cujo encerramento a esvazia.
     * {@link AuthStore}
     */
    private readonly authStore = inject(AuthStore);

    /** Superfície de diálogos usada para reportar as recusas do backend. */
    private readonly alertService = inject(AlertService);

    /** Lista interna de disponibilidades, substituída por inteiro a cada alteração. */
    private readonly disponibilidadesState = signal<DisponibilidadeResponseDTO[]>([]);

    /** Lista somente leitura das disponibilidades atuais. */
    readonly disponibilidades = this.disponibilidadesState.asReadonly();

    constructor() {
        // Cada sessão recarrega a lista, e o logout a esvazia para o próximo usuário.
        effect(() => {
            if (this.authStore.token()) {
                untracked(() => this.load());
            } else {
                this.disponibilidadesState.set([]);
            }
        });
    }

    /**
     * Recarrega a lista a partir da API. Uma falha, como o `403` de um `CLIENTE`, mantém a lista atual.
     */
    load(): void {
        this.service.findAll().subscribe({
            next: (disponibilidades) => this.disponibilidadesState.set(disponibilidades),
            error: () => {},
        });
    }

    /**
     * Cria uma nova disponibilidade na API e a acrescenta à lista.
     *
     * @param request - Dados da disponibilidade a ser criada.
     * @returns A disponibilidade criada, ou `null` quando o backend recusa a criação.
     * @example
     * ```ts
     * disponibilidadeStore.add({ diaSemana: DisponibilidadeDiaSemana.SEGUNDA, horaInicio: "09:00", horaFim: "18:00" }).subscribe();
     * ```
     */
    add(request: DisponibilidadeCreateDTO): Observable<DisponibilidadeResponseDTO | null> {
        return this.service.create(request).pipe(
            tap((disponibilidade) =>
                this.disponibilidadesState.update((disponibilidades) => [...disponibilidades, disponibilidade]),
            ),
            catchError((err: HttpErrorResponse) => {
                this.alertService.error(extractErrorMessage(err, ErrorMessages.DISPONIBILIDADE_CREATE));
                return of(null);
            }),
        );
    }

    /**
     * Atualiza uma disponibilidade na API e substitui a entrada correspondente na lista.
     *
     * @param id - Identificador da disponibilidade.
     * @param request - Campos a serem atualizados.
     * @returns A disponibilidade atualizada, ou `null` quando o backend recusa a alteração.
     * @example
     * ```ts
     * disponibilidadeStore.update(1, { horaFim: "20:00" }).subscribe();
     * ```
     */
    update(id: number, request: DisponibilidadeUpdateDTO): Observable<DisponibilidadeResponseDTO | null> {
        return this.service.update(id, request).pipe(
            tap((atualizada) =>
                this.disponibilidadesState.update((disponibilidades) =>
                    disponibilidades.map((disponibilidade) =>
                        disponibilidade.id === id ? atualizada : disponibilidade,
                    ),
                ),
            ),
            catchError((err: HttpErrorResponse) => {
                this.alertService.error(extractErrorMessage(err, ErrorMessages.DISPONIBILIDADE_UPDATE));
                return of(null);
            }),
        );
    }

    /**
     * Busca uma disponibilidade pelo seu identificador na lista atual.
     *
     * @param id - Identificador da disponibilidade.
     * @returns A disponibilidade encontrada, ou `undefined` quando não existe.
     */
    findById(id: number): DisponibilidadeResponseDTO | undefined {
        return this.disponibilidadesState().find((disponibilidade) => disponibilidade.id === id);
    }

    /**
     * Remove a disponibilidade com o identificador informado na API e a tira da lista.
     *
     * @param id - Identificador da disponibilidade.
     * @returns `true` quando a remoção é concluída, `false` quando o backend a recusa.
     * @example
     * ```ts
     * disponibilidadeStore.remove(1).subscribe();
     * ```
     */
    remove(id: number): Observable<boolean> {
        return this.service.deleteById(id).pipe(
            tap(() =>
                this.disponibilidadesState.update((disponibilidades) =>
                    disponibilidades.filter((disponibilidade) => disponibilidade.id !== id),
                ),
            ),
            map(() => true),
            catchError((err: HttpErrorResponse) => {
                this.alertService.error(extractErrorMessage(err, ErrorMessages.DISPONIBILIDADE_REMOVE));
                return of(false);
            }),
        );
    }
}
