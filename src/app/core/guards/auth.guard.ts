import { inject } from "@angular/core";
import { type CanActivateFn, Router } from "@angular/router";

import { AuthStore } from "../../features/auth/services/auth.store";
import { RoutePaths } from "../config/route-paths.config";

/**
 * Libera a rota apenas para quem está autenticado.
 *
 * Sem sessão aberta, resolve a navegação para a tela de login ({@link RoutePaths.LOGIN_ROUTE})
 * devolvendo uma árvore de URL.
 *
 * @returns `true` quando há sessão, ou a árvore de URL da tela de login quando não há.
 */
export const authGuard: CanActivateFn = () =>
    inject(AuthStore).isAutenticado() ? true : inject(Router).createUrlTree([RoutePaths.LOGIN_ROUTE]);
