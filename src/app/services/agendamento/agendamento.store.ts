import type { HttpErrorResponse } from "@angular/common/http";
import { computed, Injectable, inject, signal } from "@angular/core";
import { catchError, map, type Observable, of, tap } from "rxjs";

import type { AgendamentoCreateDTO } from "../../models/agendamento/agendamento-create.dto";
import type { AgendamentoResponseDTO } from "../../models/agendamento/agendamento-response.dto";
import type { AgendamentoUpdateDTO } from "../../models/agendamento/agendamento-update.dto";
import { AlertService, extractErrorMessage } from "../alert.service";
import { ServicoStore } from "../servico/servico.store";
import { UsuarioStore } from "../usuario/usuario.store";
import { AgendamentoService } from "./agendamento.service";

/**
 * Agendamento acrescido dos dados de serviço e cliente necessários para exibi-lo em tela.
 *
 * Compõe o DTO de resposta em vez de substituí-lo, então qualquer mudança no contrato da
 * API aparece como erro de compilação aqui.
 */
export type AgendamentoView = AgendamentoResponseDTO & {
    servicoNome: string;
    servicoPreco: number;
    usuarioNome: string;
};

/** Texto exibido quando o serviço de um agendamento não está mais na lista. */
const SERVICO_REMOVIDO = "Serviço removido";

/** Texto exibido quando o cliente de um agendamento não está mais na lista. */
const CLIENTE_REMOVIDO = "Cliente removido";

/**
 * Loja reativa dos agendamentos, servida pela API.
 *
 * Mantém a lista em um signal, resolve serviço e cliente de cada agendamento para exibição
 * e delega toda leitura e escrita ao `AgendamentoService`. O signal só muda depois que a
 * resposta HTTP chega, então uma recusa do backend deixa a lista intacta e mostra a
 * mensagem original em um diálogo. A duração vem sempre da resposta do backend.
 */
@Injectable({
    providedIn: "root",
})
export class AgendamentoStore {
    /** Serviço HTTP de agendamentos. */
    private readonly service = inject(AgendamentoService);

    /**
     * Loja de serviços usada para resolver nome e preço de cada agendamento.
     * @see {@link ServicoStore}
     */
    private readonly servicoStore = inject(ServicoStore);

    /**
     * Diretório de usuários usado para resolver o nome do cliente de cada agendamento.
     * @see {@link UsuarioStore}
     */
    private readonly usuarioStore = inject(UsuarioStore);

    /** Superfície de diálogos usada para reportar as recusas do backend. */
    private readonly alertService = inject(AlertService);

    /** Lista interna de agendamentos, substituída por inteiro a cada alteração. */
    private readonly state = signal<AgendamentoResponseDTO[]>([]);

    /** Lista somente leitura dos agendamentos atuais, já com serviço e cliente resolvidos. */
    readonly agendamentos = computed<AgendamentoView[]>(() => {
        const usuarios = this.usuarioStore.usuarios();

        return this.state().map((agendamento) => {
            const servico = this.servicoStore.findById(agendamento.servicoId);
            const usuario = usuarios.find((candidato) => candidato.id === agendamento.usuarioId);

            return {
                ...agendamento,
                servicoNome: servico?.nome ?? SERVICO_REMOVIDO,
                servicoPreco: servico?.valor ?? 0,
                usuarioNome: usuario?.nome ?? CLIENTE_REMOVIDO,
            };
        });
    });

    constructor() {
        this.service.findAll().subscribe({
            next: (agendamentos) => this.state.set(agendamentos),
            error: () => {},
        });
    }

    /**
     * Cria um novo agendamento na API e o acrescenta à lista.
     *
     * O status e a duração vêm da resposta do backend, que é a autoridade sobre ambos.
     *
     * @param request - Dados do agendamento a ser criado.
     * @returns O agendamento criado, ou `null` quando o backend recusa a criação.
     * @example
     * ```ts
     * agendamentoStore.add({ data: "2026-09-20", horario: "10:00", usuarioId: 1, servicoId: 2 }).subscribe();
     * ```
     */
    add(request: AgendamentoCreateDTO): Observable<AgendamentoResponseDTO | null> {
        return this.service.create(request).pipe(
            tap((agendamento) => this.state.update((agendamentos) => [...agendamentos, agendamento])),
            catchError((err: HttpErrorResponse) => {
                this.alertService.error(extractErrorMessage(err, "Não foi possível criar o agendamento."));
                return of(null);
            }),
        );
    }

    /**
     * Atualiza um agendamento na API e substitui a entrada correspondente na lista.
     *
     * @param id - Identificador do agendamento.
     * @param request - Campos a serem atualizados.
     * @returns O agendamento atualizado, ou `null` quando o backend recusa a alteração.
     * @example
     * ```ts
     * agendamentoStore.update(1, { status: AgendamentoStatus.CANCELADO }).subscribe();
     * ```
     */
    update(id: number, request: AgendamentoUpdateDTO): Observable<AgendamentoResponseDTO | null> {
        return this.service.update(id, request).pipe(
            tap((atualizado) =>
                this.state.update((agendamentos) =>
                    agendamentos.map((agendamento) => (agendamento.id === id ? atualizado : agendamento)),
                ),
            ),
            catchError((err: HttpErrorResponse) => {
                this.alertService.error(extractErrorMessage(err, "Não foi possível atualizar o agendamento."));
                return of(null);
            }),
        );
    }

    /**
     * Remove o agendamento com o identificador informado na API e o tira da lista.
     *
     * @param id - Identificador do agendamento.
     * @returns `true` quando a remoção é concluída, `false` quando o backend a recusa.
     * @example
     * ```ts
     * agendamentoStore.remove(1).subscribe();
     * ```
     */
    remove(id: number): Observable<boolean> {
        return this.service.deleteById(id).pipe(
            tap(() => this.state.update((agendamentos) => agendamentos.filter((agendamento) => agendamento.id !== id))),
            map(() => true),
            catchError((err: HttpErrorResponse) => {
                this.alertService.error(extractErrorMessage(err, "Não foi possível remover o agendamento."));
                return of(false);
            }),
        );
    }
}
