import { Component, computed, inject } from "@angular/core";

import { AgendamentoStatus } from "../../models/agendamento/agendamento-status.enum";
import { AgendamentoStore } from "../../services/agendamento/agendamento.store";
import { AuthStore } from "../../services/auth/auth.store";
import { DisponibilidadeStore } from "../../services/disponibilidade/disponibilidade.store";
import { ServicoStore } from "../../services/servico/servico.store";
import { AgendamentoListComponent } from "../agendamentos/agendamento-list/agendamento-list.component";
import { DisponibilidadeListComponent } from "../disponibilidades/disponibilidade-list/disponibilidade-list.component";
import { ServicoListComponent } from "../servicos/servico-list/servico-list.component";

/**
 * Conteúdo do painel: a saudação personalizada e as listas de agendamentos, serviços e
 * disponibilidades.
 */
@Component({
    selector: "app-dashboard",
    imports: [AgendamentoListComponent, DisponibilidadeListComponent, ServicoListComponent],
    templateUrl: "./dashboard.component.html",
    styleUrl: "./dashboard.component.scss",
})
export class DashboardComponent {
    /**
     * Loja reativa dos agendamentos.
     * @see {@link AgendamentoStore}
     */
    private readonly agendamentoStore = inject(AgendamentoStore);

    /**
     * Loja reativa dos serviços.
     * @see {@link ServicoStore}
     */
    private readonly servicoStore = inject(ServicoStore);

    /**
     * Loja reativa das disponibilidades.
     * @see {@link DisponibilidadeStore}
     */
    private readonly disponibilidadeStore = inject(DisponibilidadeStore);

    /**
     * Sessão do usuário, origem do nome exibido na saudação.
     * @see {@link AuthStore}
     */
    readonly authStore = inject(AuthStore);

    /** Serviços exibidos. */
    readonly servicos = this.servicoStore.servicos;

    /** Disponibilidades exibidas. */
    readonly disponibilidades = this.disponibilidadeStore.disponibilidades;

    /**
     * Agendamentos visíveis para quem está na sessão.
     *
     * Mostra apenas os `AGENDADO`; um cliente vê só os seus, um gestor vê os de todos.
     */
    readonly agendamentosVisiveis = computed(() => {
        const agendados = this.agendamentoStore
            .agendamentos()
            .filter((agendamento) => agendamento.status === AgendamentoStatus.AGENDADO);

        if (this.authStore.ehGestor()) {
            return agendados;
        }

        const usuarioId = this.authStore.usuarioAtual()?.id;

        return agendados.filter((agendamento) => agendamento.usuarioId === usuarioId);
    });
}
