import type { HttpErrorResponse } from "@angular/common/http";
import { Injectable, inject, signal } from "@angular/core";
import { catchError, map, type Observable, of, tap } from "rxjs";
import { AlertService, extractErrorMessage } from "../../../core/services/alert.service";
import type { ServicoCreateDTO } from "../models/servico-create.dto";
import type { ServicoResponseDTO } from "../models/servico-response.dto";
import type { ServicoUpdateDTO } from "../models/servico-update.dto";
import { ServicoService } from "./servico.service";

/**
 * Loja reativa dos serviços, servida pela API.
 *
 * Mantém a lista em um signal e delega toda leitura e escrita ao `ServicoService`. O signal
 * só muda depois que a resposta HTTP chega, então uma recusa do backend deixa a lista
 * intacta e mostra a mensagem original em um diálogo.
 */
@Injectable({
    providedIn: "root",
})
export class ServicoStore {
    /** Serviço HTTP de serviços. */
    private readonly service = inject(ServicoService);

    /** Superfície de diálogos usada para reportar as recusas do backend. */
    private readonly alertService = inject(AlertService);

    /** Lista interna de serviços, substituída por inteiro a cada alteração. */
    private readonly state = signal<ServicoResponseDTO[]>([]);

    /** Lista somente leitura dos serviços atuais. */
    readonly servicos = this.state.asReadonly();

    constructor() {
        this.service.findAll().subscribe({
            next: (servicos) => this.state.set(servicos),
            error: () => {},
        });
    }

    /**
     * Cria um novo serviço na API e o acrescenta à lista.
     *
     * @param request - Dados do serviço a ser criado.
     * @returns O serviço criado, ou `null` quando o backend recusa a criação.
     * @example
     * ```ts
     * servicoStore.add({ nome: "Corte", valor: 40, duracao: 30 }).subscribe();
     * ```
     */
    add(request: ServicoCreateDTO): Observable<ServicoResponseDTO | null> {
        return this.service.create(request).pipe(
            tap((servico) => this.state.update((servicos) => [...servicos, servico])),
            catchError((err: HttpErrorResponse) => {
                this.alertService.error(extractErrorMessage(err, "Não foi possível criar o serviço."));
                return of(null);
            }),
        );
    }

    /**
     * Atualiza um serviço na API e substitui a entrada correspondente na lista.
     *
     * @param id - Identificador do serviço.
     * @param request - Campos a serem atualizados.
     * @returns O serviço atualizado, ou `null` quando o backend recusa a alteração.
     * @example
     * ```ts
     * servicoStore.update(1, { valor: 45 }).subscribe();
     * ```
     */
    update(id: number, request: ServicoUpdateDTO): Observable<ServicoResponseDTO | null> {
        return this.service.update(id, request).pipe(
            tap((atualizado) =>
                this.state.update((servicos) => servicos.map((servico) => (servico.id === id ? atualizado : servico))),
            ),
            catchError((err: HttpErrorResponse) => {
                this.alertService.error(extractErrorMessage(err, "Não foi possível atualizar o serviço."));
                return of(null);
            }),
        );
    }

    /**
     * Busca um serviço pelo seu identificador na lista atual.
     *
     * @param id - Identificador do serviço.
     * @returns O serviço encontrado, ou `undefined` quando não existe.
     */
    findById(id: number): ServicoResponseDTO | undefined {
        return this.state().find((servico) => servico.id === id);
    }

    /**
     * Remove o serviço com o identificador informado na API e o tira da lista.
     *
     * @param id - Identificador do serviço.
     * @returns `true` quando a remoção é concluída, `false` quando o backend a recusa.
     * @example
     * ```ts
     * servicoStore.remove(1).subscribe();
     * ```
     */
    remove(id: number): Observable<boolean> {
        return this.service.deleteById(id).pipe(
            tap(() => this.state.update((servicos) => servicos.filter((servico) => servico.id !== id))),
            map(() => true),
            catchError((err: HttpErrorResponse) => {
                this.alertService.error(extractErrorMessage(err, "Não foi possível remover o serviço."));
                return of(false);
            }),
        );
    }
}
