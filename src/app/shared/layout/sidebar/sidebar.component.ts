import { Component, inject, signal } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { MdbModalModule, MdbModalService } from "mdb-angular-ui-kit/modal";

import { AgendamentoFormComponent } from "../../../components/agendamentos/agendamento-form/agendamento-form.component";
import { DisponibilidadeFormComponent } from "../../../components/disponibilidades/disponibilidade-form/disponibilidade-form.component";
import { ServicoFormComponent } from "../../../components/servicos/servico-form/servico-form.component";
import { AuthStore } from "../../../services/auth/auth.store";

/** Configuração aplicada aos modais abertos pela barra lateral. */
const CONFIG_MODAL = { modalClass: "modal-dialog-centered" };

/**
 * Barra lateral de navegação do painel, com recolhimento e ações de criação.
 *
 * Dashboard e Configurações navegam por rota; Agendamentos, Serviços e Disponibilidades
 * abrem os formulários de criação em um modal, sem sair da página atual.
 */
@Component({
    selector: "app-sidebar",
    imports: [MdbModalModule, RouterLink, RouterLinkActive],
    templateUrl: "./sidebar.component.html",
    styleUrl: "./sidebar.component.scss",
})
export class SidebarComponent {
    /**
     * Serviço de modais do MDB.
     * @see {@link MdbModalService}
     */
    private readonly modalService = inject(MdbModalService);

    /**
     * Sessão do usuário, que define a visibilidade das entradas de gestão.
     * @see {@link AuthStore}
     */
    readonly authStore = inject(AuthStore);

    /** Indica se a barra está recolhida, exibindo apenas os ícones. */
    readonly collapsed = signal(false);

    /**
     * Alterna entre a barra expandida e a recolhida.
     */
    toggle(): void {
        this.collapsed.update((recolhida) => !recolhida);
    }

    /**
     * Abre o modal de criação de agendamento.
     */
    openAgendamentoForm(): void {
        this.modalService.open(AgendamentoFormComponent, CONFIG_MODAL);
    }

    /**
     * Abre o modal de criação de serviço.
     */
    openServicoForm(): void {
        this.modalService.open(ServicoFormComponent, CONFIG_MODAL);
    }

    /**
     * Abre o modal de criação de disponibilidade.
     */
    openDisponibilidadeForm(): void {
        this.modalService.open(DisponibilidadeFormComponent, CONFIG_MODAL);
    }
}
