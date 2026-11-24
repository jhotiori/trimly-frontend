/*
    Barra lateral do painel: navegação, recolhimento, tema, logout e criação de disponibilidade.
*/

import { Component, inject, signal } from "@angular/core";
import { Router, RouterLink, RouterLinkActive } from "@angular/router";
import { MdbModalModule, MdbModalService } from "mdb-angular-ui-kit/modal";
import { AuthStore } from "../../../features/auth/services/auth.store";
import { DisponibilidadeFormComponent } from "../../../features/disponibilidades/components/disponibilidade-form/disponibilidade-form.component";
import { RoutePaths } from "../../config/route-paths.config";
import { UiConfig } from "../../config/ui.config";
import { ThemeService } from "../../services/theme.service";

@Component({
    selector: "app-sidebar",
    imports: [MdbModalModule, RouterLink, RouterLinkActive],
    templateUrl: "./sidebar.component.html",
    styleUrl: "./sidebar.component.scss",
})
export class SidebarComponent {
    /**
     * Serviço de modais do MDB.
     * {@link MdbModalService}
     */
    private readonly modalService = inject(MdbModalService);

    /** Roteador usado para voltar à tela de login após o logout. */
    private readonly router = inject(Router);

    /**
     * Sessão do usuário, que define a visibilidade das entradas de gestão e é encerrada pelo logout.
     * {@link AuthStore}
     */
    readonly authStore = inject(AuthStore);

    /**
     * Tema em vigor, alternado pela entrada Tema do menu.
     * {@link ThemeService}
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
        this.modalService.open(DisponibilidadeFormComponent, UiConfig.MODAL);
    }

    /**
     * Encerra a sessão e volta para a tela de login.
     */
    logout(): void {
        this.authStore.logout();
        this.router.navigate([RoutePaths.LOGIN_ROUTE]);
    }
}
