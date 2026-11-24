/*
    Componente de layout do painel, com a barra lateral e a área de conteúdo roteada.
    @author jhotiori
*/

import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { SidebarComponent } from "../sidebar/sidebar.component";

@Component({
    selector: "app-dashboard-layout",
    imports: [RouterOutlet, SidebarComponent],
    templateUrl: "./dashboard-layout.component.html",
    styleUrl: "./dashboard-layout.component.scss",
})
export class DashboardLayoutComponent {}
