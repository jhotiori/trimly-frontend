/*
    Tabela de rotas: login e cadastro públicos e o painel protegido pelo `authGuard`, com uma rota por seção.
*/

import type { Routes } from "@angular/router";
import { AgendamentoScreenComponent } from "./features/agendamentos/components/agendamento-screen/agendamento-screen.component";
import { AuthComponent } from "./features/auth/components/auth.component";
import { DashboardComponent } from "./features/dashboard/dashboard.component";
import { ServicoScreenComponent } from "./features/servicos/components/servico-screen/servico-screen.component";
import { authGuard } from "./infra/guards/auth.guard";
import { DashboardLayoutComponent } from "./infra/layout/dashboard-layout/dashboard-layout.component";

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
        ],
    },
];
