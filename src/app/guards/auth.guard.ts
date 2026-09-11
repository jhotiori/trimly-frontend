import { inject } from "@angular/core";
import { type CanActivateFn, Router } from "@angular/router";

import { AuthStore } from "../services/auth/auth.store";

/**
 * Libera a rota apenas para quem está autenticado.
 *
 * Sem sessão aberta, resolve a navegação para `/login` devolvendo uma árvore de URL.
 *
 * @returns `true` quando há sessão, ou a árvore de URL do `/login` quando não há.
 */
export const authGuard: CanActivateFn = () =>
    inject(AuthStore).autenticado() ? true : inject(Router).createUrlTree(["/login"]);
