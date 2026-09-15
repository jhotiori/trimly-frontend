import { Component, computed, inject } from "@angular/core";
import { AgendamentoListComponent } from "../agendamentos/components/agendamento-list/agendamento-list.component";
import { AgendamentoStatus } from "../agendamentos/models/agendamento-status.enum";
import { AgendamentoStore } from "../agendamentos/services/agendamento.store";
import { AuthStore } from "../auth/services/auth.store";
import { DisponibilidadeListComponent } from "../disponibilidades/components/disponibilidade-list/disponibilidade-list.component";
import { DisponibilidadeStore } from "../disponibilidades/services/disponibilidade.store";

/** Quantidade de dias da semana corrente, de segunda a domingo. */
const DIAS_NA_SEMANA = 7;

/**
 * Tela de boas-vindas do painel: a saudação, os agendamentos da semana corrente e as
 * disponibilidades da barbearia.
 */
@Component({
    selector: "app-dashboard",
    imports: [AgendamentoListComponent, DisponibilidadeListComponent],
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
     * Loja reativa das disponibilidades.
     * @see {@link DisponibilidadeStore}
     */
    private readonly disponibilidadeStore = inject(DisponibilidadeStore);

    /**
     * Sessão do usuário, origem do nome exibido na saudação.
     * @see {@link AuthStore}
     */
    readonly authStore = inject(AuthStore);

    /** Disponibilidades exibidas. */
    readonly disponibilidades = this.disponibilidadeStore.disponibilidades;

    /**
     * Agendamentos visíveis para quem está na sessão, na semana corrente.
     *
     * Mostra apenas os `AGENDADO` entre a segunda e o domingo atuais, calculados no
     * navegador; um cliente vê só os seus, um gestor vê os de todos.
     */
    readonly agendamentosVisiveis = computed(() => {
        const inicio = new Date();
        inicio.setHours(0, 0, 0, 0);
        // `getDay()` começa no domingo; o deslocamento leva qualquer dia de volta à segunda.
        inicio.setDate(inicio.getDate() - ((inicio.getDay() + 6) % DIAS_NA_SEMANA));

        const fim = new Date(inicio);
        fim.setDate(inicio.getDate() + DIAS_NA_SEMANA);

        const agendados = this.agendamentoStore.agendamentos().filter((agendamento) => {
            const data = new Date(agendamento.data);

            return agendamento.status === AgendamentoStatus.AGENDADO && data >= inicio && data < fim;
        });

        if (this.authStore.isGestor()) {
            return agendados;
        }

        const usuarioId = this.authStore.usuarioAtual()?.id;

        return agendados.filter((agendamento) => agendamento.usuarioId === usuarioId);
    });
}
