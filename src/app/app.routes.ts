import type { Routes } from "@angular/router";
import { authGuard } from "./core/guards/auth.guard";
import { DashboardLayoutComponent } from "./core/layout/dashboard-layout/dashboard-layout.component";
import { AgendamentoScreenComponent } from "./features/agendamentos/components/agendamento-screen/agendamento-screen.component";
import { AuthComponent } from "./features/auth/components/auth.component";
import { ConfiguracoesComponent } from "./features/configuracoes/configuracoes.component";
import { DashboardComponent } from "./features/dashboard/dashboard.component";
import { ServicoScreenComponent } from "./features/servicos/components/servico-screen/servico-screen.component";

export const routes: Routes = [
    {
        path: "",
        redirectTo: "login",
        pathMatch: "full",
    },
    {
        path: "login",
        component: AuthComponent,
    },
    {
        path: "dashboard",
        component: DashboardLayoutComponent,
        canActivate: [authGuard],
        children: [
            {
                path: "",
                redirectTo: "view",
                pathMatch: "full",
            },
            {
                path: "view",
                component: DashboardComponent,
            },
            {
                path: "agendamentos",
                component: AgendamentoScreenComponent,
            },
            {
                path: "servicos",
                component: ServicoScreenComponent,
            },
            {
                path: "configuracoes",
                component: ConfiguracoesComponent,
            },
        ],
    },
];
