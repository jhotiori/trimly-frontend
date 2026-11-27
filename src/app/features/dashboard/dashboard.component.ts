/*
    Visão geral do painel: resumo da semana corrente a partir das lojas de agendamentos e serviços.
*/

import { Component, computed, inject, type OnInit } from "@angular/core";
import { todayIso } from "../../infra/utils/date.util";
import { AgendamentoListComponent } from "../agendamentos/components/agendamento-list/agendamento-list.component";
import { AgendamentoStatus } from "../agendamentos/models/agendamento-status.enum";
import { AgendamentoStore } from "../agendamentos/services/agendamento.store";
import { AuthStore } from "../auth/services/auth.store";
import { DisponibilidadeListComponent } from "../disponibilidades/components/disponibilidade-list/disponibilidade-list.component";
import { DisponibilidadeStore } from "../disponibilidades/services/disponibilidade.store";
import { FeriadoListComponent } from "../feriados/components/feriado-list/feriado-list.component";
import { FeriadoStore } from "../feriados/services/feriado.store";
import { RecessoListComponent } from "../recessos/components/recesso-list/recesso-list.component";
import { RecessoStore } from "../recessos/services/recesso.store";

/** Quantidade de dias da semana corrente, de segunda a domingo. */
const DIAS_NA_SEMANA = 7;

/** Ano corrente, o mesmo que o backend usa para listar os feriados. */
const ANO_ATUAL = new Date().getFullYear();

@Component({
    selector: "app-dashboard",
    imports: [AgendamentoListComponent, DisponibilidadeListComponent, FeriadoListComponent, RecessoListComponent],
    templateUrl: "./dashboard.component.html",
    styleUrl: "./dashboard.component.scss",
})
export class DashboardComponent implements OnInit {
    /**
     * Loja reativa dos agendamentos.
     * {@link AgendamentoStore}
     */
    private readonly agendamentoStore = inject(AgendamentoStore);

    /**
     * Loja reativa das disponibilidades.
     * {@link DisponibilidadeStore}
     */
    private readonly disponibilidadeStore = inject(DisponibilidadeStore);

    /**
     * Loja reativa dos recessos.
     * {@link RecessoStore}
     */
    private readonly recessoStore = inject(RecessoStore);

    /**
     * Loja reativa dos feriados nacionais do ano.
     * {@link FeriadoStore}
     */
    private readonly feriadoStore = inject(FeriadoStore);

    /**
     * Sessão do usuário, origem do nome exibido na saudação.
     * {@link AuthStore}
     */
    readonly authStore = inject(AuthStore);

    /** Disponibilidades exibidas. */
    readonly disponibilidades = this.disponibilidadeStore.disponibilidades;

    /** Recessos em andamento ou futuros, do mais próximo ao mais distante. */
    readonly recessosAtivos = computed(() => {
        const hoje = todayIso();

        return this.recessoStore
            .recessos()
            .filter((recesso) => recesso.dataFim >= hoje)
            .sort((a, b) => a.dataInicio.localeCompare(b.dataInicio));
    });

    /** Feriados nacionais exibidos. */
    readonly feriados = this.feriadoStore.feriados;

    /** Ano exibido no título da seção de feriados. */
    readonly ano = ANO_ATUAL;

    /**
     * Agendamentos visíveis para quem está na sessão, na semana corrente.
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

    /**
     * Recarrega os agendamentos, as disponibilidades, os recessos e os feriados a cada entrada no painel.
     */
    ngOnInit(): void {
        this.agendamentoStore.load();
        this.disponibilidadeStore.load();
        this.recessoStore.load();
        this.feriadoStore.load();
    }
}
