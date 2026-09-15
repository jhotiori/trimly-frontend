import { inject } from "@angular/core";
import { type CanActivateFn, Router } from "@angular/router";
import { AuthStore } from "../../features/auth/services/auth.store";
import type { UsuarioCargo } from "../../features/usuarios/models/usuario-cargo.enum";
import { RoutePaths } from "../config/route-paths.config";

/**
 * Monta um guard que libera a rota apenas para os cargos informados.
 *
 * Sem um cargo permitido, resolve a navegação para o painel ({@link RoutePaths.DASHBOARD_VIEW_ROUTE})
 * devolvendo uma árvore de URL. É apenas um controle de experiência: o backend libera todas as
 * rotas, então isso não é uma fronteira de segurança.
 *
 * @param cargosPermitidos - Cargos que podem ativar a rota.
 * @returns O guard de rota correspondente.
 * @example
 * ```ts
 * { path: "usuarios", canActivate: [roleGuard(UsuarioCargo.ADMIN, UsuarioCargo.DONO)] }
 * ```
 */
export function roleGuard(...cargosPermitidos: UsuarioCargo[]): CanActivateFn {
    return () => {
        const cargo = inject(AuthStore).usuarioAtual()?.cargo;

        return cargo !== undefined && cargosPermitidos.includes(cargo)
            ? true
            : inject(Router).createUrlTree([RoutePaths.DASHBOARD_VIEW_ROUTE]);
    };
}
