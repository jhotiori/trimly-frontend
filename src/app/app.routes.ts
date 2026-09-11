import type { Routes } from "@angular/router";
import { AuthComponent } from "./components/auth/auth.component";
import { ConfiguracoesComponent } from "./components/configuracoes/configuracoes.component";
import { DashboardComponent } from "./components/dashboard/dashboard.component";
import { UsuariosComponent } from "./components/usuarios/usuarios.component";
import { authGuard } from "./guards/auth.guard";
import { roleGuard } from "./guards/role.guard";
import { UsuarioCargo } from "./models/usuario/usuario-cargo.enum";
import { DashboardLayoutComponent } from "./shared/layout/dashboard-layout/dashboard-layout.component";

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
            /*{
                path: "admin",
                component: class {},
            },*/
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
                path: "usuarios",
                component: UsuariosComponent,
                canActivate: [roleGuard(UsuarioCargo.ADMIN, UsuarioCargo.DONO)],
            },
            {
                path: "configuracoes",
                component: ConfiguracoesComponent,
            },
        ],
    },
];
