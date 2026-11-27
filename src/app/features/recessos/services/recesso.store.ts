/*
    Estado reativo dos recessos, recarregado a cada sessão.
*/

import type { HttpErrorResponse } from "@angular/common/http";
import { effect, Injectable, inject, signal, untracked } from "@angular/core";
import { catchError, map, type Observable, of, tap } from "rxjs";
import { ErrorMessages } from "../../../infra/config/messages.config";
import { AlertService, extractErrorMessage } from "../../../infra/services/alert.service";
import { AuthStore } from "../../auth/services/auth.store";
import type { RecessoCreateDTO } from "../models/recesso-create.dto";
import type { RecessoResponseDTO } from "../models/recesso-response.dto";
import type { RecessoUpdateDTO } from "../models/recesso-update.dto";
import { RecessoService } from "./recesso.service";

@Injectable({
    providedIn: "root",
})
export class RecessoStore {
    /** Serviço HTTP de recessos. */
    private readonly service = inject(RecessoService);

    /**
     * Sessão do usuário, cuja abertura recarrega a lista e cujo encerramento a esvazia.
     * {@link AuthStore}
     */
    private readonly authStore = inject(AuthStore);

    /** Superfície de diálogos usada para reportar as recusas do backend. */
    private readonly alertService = inject(AlertService);

    /** Lista interna de recessos, substituída por inteiro a cada alteração. */
    private readonly recessosState = signal<RecessoResponseDTO[]>([]);

    /** Lista somente leitura dos recessos atuais. */
    readonly recessos = this.recessosState.asReadonly();

    constructor() {
        // Cada sessão recarrega a lista, e o logout a esvazia para o próximo usuário.
        effect(() => {
            if (this.authStore.token()) {
                untracked(() => this.load());
            } else {
                this.recessosState.set([]);
            }
        });
    }

    /**
     * Recarrega a lista a partir da API. Uma falha mantém a lista atual.
     */
    load(): void {
        this.service.findAll().subscribe({
            next: (recessos) => this.recessosState.set(recessos),
            error: () => {},
        });
    }

    /**
     * Cria um novo recesso na API e o acrescenta à lista.
     *
     * @param request - Dados do recesso a ser criado.
     * @returns O recesso criado, ou `null` quando o backend recusa a criação.
     * @example
     * ```ts
     * recessoStore.add({ descricao: "Férias da Barbearia", dataInicio: "2026-12-01", dataFim: "2026-12-17" }).subscribe();
     * ```
     */
    add(request: RecessoCreateDTO): Observable<RecessoResponseDTO | null> {
        return this.service.create(request).pipe(
            tap((recesso) => this.recessosState.update((recessos) => [...recessos, recesso])),
            catchError((err: HttpErrorResponse) => {
                this.alertService.error(extractErrorMessage(err, ErrorMessages.RECESSO_CREATE));
                return of(null);
            }),
        );
    }

    /**
     * Atualiza um recesso na API e substitui a entrada correspondente na lista.
     *
     * @param id - Identificador do recesso.
     * @param request - Campos a serem atualizados.
     * @returns O recesso atualizado, ou `null` quando o backend recusa a alteração.
     * @example
     * ```ts
     * recessoStore.update(1, { dataFim: "2026-12-20" }).subscribe();
     * ```
     */
    update(id: number, request: RecessoUpdateDTO): Observable<RecessoResponseDTO | null> {
        return this.service.update(id, request).pipe(
            tap((atualizado) =>
                this.recessosState.update((recessos) =>
                    recessos.map((recesso) => (recesso.id === id ? atualizado : recesso)),
                ),
            ),
            catchError((err: HttpErrorResponse) => {
                this.alertService.error(extractErrorMessage(err, ErrorMessages.RECESSO_UPDATE));
                return of(null);
            }),
        );
    }

    /**
     * Remove o recesso com o identificador informado na API e o tira da lista.
     *
     * @param id - Identificador do recesso.
     * @returns `true` quando a remoção é concluída, `false` quando o backend a recusa.
     * @example
     * ```ts
     * recessoStore.remove(1).subscribe();
     * ```
     */
    remove(id: number): Observable<boolean> {
        return this.service.deleteById(id).pipe(
            tap(() => this.recessosState.update((recessos) => recessos.filter((recesso) => recesso.id !== id))),
            map(() => true),
            catchError((err: HttpErrorResponse) => {
                this.alertService.error(extractErrorMessage(err, ErrorMessages.RECESSO_REMOVE));
                return of(false);
            }),
        );
    }
}
