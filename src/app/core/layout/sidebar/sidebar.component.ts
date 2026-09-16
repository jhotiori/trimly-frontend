import { Component, inject, signal } from "@angular/core";
import { Router, RouterLink, RouterLinkActive } from "@angular/router";
import { MdbModalModule, MdbModalService } from "mdb-angular-ui-kit/modal";

import { AuthStore } from "../../../features/auth/services/auth.store";
import { DisponibilidadeFormComponent } from "../../../features/disponibilidades/components/disponibilidade-form/disponibilidade-form.component";
import { RoutePaths } from "../../config/route-paths.config";
import { ThemeService } from "../../services/theme.service";

/** Configuração aplicada ao modal aberto pela barra lateral. */
const CONFIG_MODAL = { modalClass: "modal-dialog-centered" };

/**
 * Barra lateral de navegação do painel, com recolhimento e a criação de disponibilidades.
 *
 * Dashboard, Agendamentos e Serviços navegam por rota; Disponibilidades abre o formulário de
 * criação em um modal, sem sair da página atual, e Tema alterna entre o tema escuro e o claro.
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

    /** Roteador usado para voltar à tela de login após o logout. */
    private readonly router = inject(Router);

    /**
     * Sessão do usuário, que define a visibilidade das entradas de gestão e é encerrada pelo logout.
     * @see {@link AuthStore}
     */
    readonly authStore = inject(AuthStore);

    /**
     * Tema em vigor, alternado pela entrada Tema do menu.
     * @see {@link ThemeService}
     */
    readonly themeService = inject(ThemeService);

    /** Caminhos de navegação consumidos pelos links do template. */
    protected readonly routePaths = RoutePaths;

    /** Indica se a barra está recolhida, exibindo apenas os ícones. */
    readonly collapsed = signal(false);

    /**
     * Alterna entre a barra expandida e a recolhida.
     */
    toggle(): void {
        this.collapsed.update((recolhida) => !recolhida);
    }

    /**
     * Abre o modal de criação de disponibilidade.
     */
    openDisponibilidadeForm(): void {
        this.modalService.open(DisponibilidadeFormComponent, CONFIG_MODAL);
    }

    /**
     * Encerra a sessão e volta para a tela de login.
     */
    logout(): void {
        this.authStore.logout();
        this.router.navigate([RoutePaths.LOGIN_ROUTE]);
    }
}
