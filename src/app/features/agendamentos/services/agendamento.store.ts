/*
    Estado reativo dos agendamentos e a visão que resolve o nome do serviço e do cliente de cada um.
*/

import type { HttpErrorResponse } from "@angular/common/http";
import { computed, effect, Injectable, inject, signal, untracked } from "@angular/core";
import { catchError, map, type Observable, of, tap } from "rxjs";
import { ErrorMessages } from "../../../infra/config/messages.config";
import { AlertService, extractErrorMessage } from "../../../infra/services/alert.service";
import { AuthStore } from "../../auth/services/auth.store";
import { ServicoStore } from "../../servicos/services/servico.store";
import { UsuarioStore } from "../../usuarios/services/usuario.store";
import type { AgendamentoCreateDTO } from "../models/agendamento-create.dto";
import type { AgendamentoResponseDTO } from "../models/agendamento-response.dto";
import type { AgendamentoUpdateDTO } from "../models/agendamento-update.dto";
import { AgendamentoService } from "./agendamento.service";

/** Nome exibido quando o serviço ou o usuário do agendamento não existe mais. */
const REMOVIDO = "[removido]";

/**
 * Agendamento acrescido dos dados de serviço e cliente necessários para exibi-lo em tela.
 * Compõe o DTO de resposta em vez de substituí-lo, então qualquer mudança no contrato da
 * API aparece como erro de compilação aqui.
 */
export type AgendamentoView = AgendamentoResponseDTO & {
    servicoNome: string;
    servicoPreco: number;
    usuarioNome: string;
};

@Injectable({
    providedIn: "root",
})
export class AgendamentoStore {
    /** Serviço HTTP de agendamentos. */
    private readonly service = inject(AgendamentoService);

    /**
     * Sessão do usuário, cuja abertura recarrega a lista e cujo encerramento a esvazia.
     * {@link AuthStore}
     */
    private readonly authStore = inject(AuthStore);

    /**
     * Loja de serviços usada para resolver nome e preço de cada agendamento.
     * {@link ServicoStore}
     */
    private readonly servicoStore = inject(ServicoStore);

    /**
     * Diretório de usuários usado para resolver o nome do cliente de cada agendamento.
     * {@link UsuarioStore}
     */
    private readonly usuarioStore = inject(UsuarioStore);

    /** Superfície de diálogos usada para reportar as recusas do backend. */
    private readonly alertService = inject(AlertService);

    /** Lista interna de agendamentos, substituída por inteiro a cada alteração. */
    private readonly agendamentosState = signal<AgendamentoResponseDTO[]>([]);

    /** Lista somente leitura dos agendamentos atuais, já com serviço e cliente resolvidos. */
    readonly agendamentos = computed<AgendamentoView[]>(() => {
        const servicos = new Map(this.servicoStore.servicos().map((servico) => [servico.id, servico]));
        const usuarios = new Map(this.usuarioStore.usuarios().map((usuario) => [usuario.id, usuario]));

        return this.agendamentosState().map((agendamento) => {
            const servico = servicos.get(agendamento.servicoId);
            const usuario = usuarios.get(agendamento.usuarioId);

            return {
                ...agendamento,
                servicoNome: servico?.nome ?? REMOVIDO,
                servicoPreco: servico?.valor ?? 0,
                usuarioNome: usuario?.nome ?? REMOVIDO,
            };
        });
    });

    constructor() {
        // Cada sessão recarrega a lista, e o logout a esvazia para o próximo usuário.
        effect(() => {
            if (this.authStore.token()) {
                untracked(() => this.load());
            } else {
                this.agendamentosState.set([]);
            }
        });
    }

    /**
     * Recarrega a lista a partir da API. Uma falha, como o `403` de um `CLIENTE`, mantém a lista atual.
     */
    load(): void {
        this.service.findAll().subscribe({
            next: (agendamentos) => this.agendamentosState.set(agendamentos),
            error: () => {},
        });
    }

    /**
     * Cria um novo agendamento na API e o acrescenta à lista.
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
            tap((agendamento) => this.agendamentosState.update((agendamentos) => [...agendamentos, agendamento])),
            catchError((err: HttpErrorResponse) => {
                this.alertService.error(extractErrorMessage(err, ErrorMessages.AGENDAMENTO_CREATE));
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
                this.agendamentosState.update((agendamentos) =>
                    agendamentos.map((agendamento) => (agendamento.id === id ? atualizado : agendamento)),
                ),
            ),
            catchError((err: HttpErrorResponse) => {
                this.alertService.error(extractErrorMessage(err, ErrorMessages.AGENDAMENTO_UPDATE));
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
            tap(() =>
                this.agendamentosState.update((agendamentos) =>
                    agendamentos.filter((agendamento) => agendamento.id !== id),
                ),
            ),
            map(() => true),
            catchError((err: HttpErrorResponse) => {
                this.alertService.error(extractErrorMessage(err, ErrorMessages.AGENDAMENTO_REMOVE));
                return of(false);
            }),
        );
    }
}
