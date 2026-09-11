import type { HttpErrorResponse } from "@angular/common/http";
import { Injectable, inject, signal } from "@angular/core";
import { catchError, map, type Observable, of, tap } from "rxjs";

import type { DisponibilidadeCreateDTO } from "../../models/disponibilidade/disponibilidade-create.dto";
import type { DisponibilidadeResponseDTO } from "../../models/disponibilidade/disponibilidade-response.dto";
import type { DisponibilidadeUpdateDTO } from "../../models/disponibilidade/disponibilidade-update.dto";
import { AlertService, extractErrorMessage } from "../alert.service";
import { DisponibilidadeService } from "./disponibilidade.service";

/**
 * Loja reativa das disponibilidades, servida pela API.
 *
 * Mantém a lista em um signal e delega toda leitura e escrita ao `DisponibilidadeService`. O
 * signal só muda depois que a resposta HTTP chega, então uma recusa do backend deixa a lista
 * intacta e mostra a mensagem original em um diálogo.
 */
@Injectable({
    providedIn: "root",
})
export class DisponibilidadeStore {
    /** Serviço HTTP de disponibilidades. */
    private readonly service = inject(DisponibilidadeService);

    /** Superfície de diálogos usada para reportar as recusas do backend. */
    private readonly alertService = inject(AlertService);

    /** Lista interna de disponibilidades, substituída por inteiro a cada alteração. */
    private readonly state = signal<DisponibilidadeResponseDTO[]>([]);

    /** Lista somente leitura das disponibilidades atuais. */
    readonly disponibilidades = this.state.asReadonly();

    constructor() {
        this.service.findAll().subscribe({
            next: (disponibilidades) => this.state.set(disponibilidades),
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
     * disponibilidadeStore.add({ diaSemana: DiaSemana.SEGUNDA, horaInicio: "09:00", horaFim: "18:00" }).subscribe();
     * ```
     */
    add(request: DisponibilidadeCreateDTO): Observable<DisponibilidadeResponseDTO | null> {
        return this.service.create(request).pipe(
            tap((disponibilidade) => this.state.update((disponibilidades) => [...disponibilidades, disponibilidade])),
            catchError((err: HttpErrorResponse) => {
                this.alertService.error(extractErrorMessage(err, "Não foi possível criar a disponibilidade."));
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
                this.state.update((disponibilidades) =>
                    disponibilidades.map((disponibilidade) =>
                        disponibilidade.id === id ? atualizada : disponibilidade,
                    ),
                ),
            ),
            catchError((err: HttpErrorResponse) => {
                this.alertService.error(extractErrorMessage(err, "Não foi possível atualizar a disponibilidade."));
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
        return this.state().find((disponibilidade) => disponibilidade.id === id);
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
                this.state.update((disponibilidades) =>
                    disponibilidades.filter((disponibilidade) => disponibilidade.id !== id),
                ),
            ),
            map(() => true),
            catchError((err: HttpErrorResponse) => {
                this.alertService.error(extractErrorMessage(err, "Não foi possível remover a disponibilidade."));
                return of(false);
            }),
        );
    }
}
