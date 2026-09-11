import { inject } from "@angular/core";
import { type CanActivateFn, Router } from "@angular/router";

import type { UsuarioCargo } from "../models/usuario/usuario-cargo.enum";
import { AuthStore } from "../services/auth/auth.store";

/**
 * Monta um guard que libera a rota apenas para os cargos informados.
 *
 * Sem um cargo permitido, resolve a navegação para `/dashboard/view` devolvendo uma árvore
 * de URL. É apenas um controle de experiência: o backend libera todas as rotas, então isso
 * não é uma fronteira de segurança.
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
            : inject(Router).createUrlTree(["/dashboard/view"]);
    };
}
