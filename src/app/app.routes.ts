/*
    Tabela de rotas: login e cadastro públicos e o painel protegido pelo `authGuard`, com uma rota por seção.
    Todos os componentes são carregados sob demanda.
*/

import type { Routes } from "@angular/router";
import { authGuard } from "./infra/guards/auth.guard";

export const routes: Routes = [
    {
        path: "",
        redirectTo: "login",
        pathMatch: "full",
    },
    {
        path: "login",
        loadComponent: () => import("./features/auth/components/auth.component").then((m) => m.AuthComponent),
    },
    {
        path: "dashboard",
        loadComponent: () =>
            import("./infra/layout/dashboard-layout/dashboard-layout.component").then(
                (m) => m.DashboardLayoutComponent,
            ),
        canActivate: [authGuard],
        children: [
            {
                path: "",
                redirectTo: "view",
                pathMatch: "full",
            },
            {
                path: "view",
                loadComponent: () =>
                    import("./features/dashboard/dashboard.component").then((m) => m.DashboardComponent),
            },
            {
                path: "agendamentos",
                loadComponent: () =>
                    import("./features/agendamentos/components/agendamento-screen/agendamento-screen.component").then(
                        (m) => m.AgendamentoScreenComponent,
                    ),
            },
            {
                path: "servicos",
                loadComponent: () =>
                    import("./features/servicos/components/servico-screen/servico-screen.component").then(
                        (m) => m.ServicoScreenComponent,
                    ),
            },
        ],
    },
];
