/*
    Interceptor que anexa o token às chamadas do backend e encerra a sessão em um `401`.
*/

import { HttpErrorResponse, type HttpInterceptorFn, HttpStatusCode } from "@angular/common/http";
import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { catchError, EMPTY, throwError } from "rxjs";

import { AuthStore } from "../../features/auth/services/auth.store";
import { BASE_URL, ENDPOINT, Endpoints } from "../config/endpoints.config";
import { RoutePaths } from "../config/route-paths.config";

/** Rotas de autenticação cujo `401` é erro de formulário, não sessão expirada. */
const AUTH_ROUTES = [
    ENDPOINT(Endpoints.AUTHENTICATION_URL, "login"),
    ENDPOINT(Endpoints.AUTHENTICATION_URL, "register"),
];

/**
 * Envia `Authorization: Bearer <token>` apenas nas requisições ao backend.
 * Um `401` do backend com sessão aberta (fora do login e do cadastro) encerra a sessão, leva à
 * tela de login e completa sem repassar o erro, para nenhum diálogo cobrir o formulário de login.
 *
 * @param req - Requisição de saída.
 * @param next - Próximo manipulador da cadeia.
 * @returns A resposta da requisição, com qualquer outro erro repassado a quem chamou.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
    if (!req.url.startsWith(BASE_URL)) {
        return next(req);
    }

    const authStore = inject(AuthStore);
    const router = inject(Router);
    const token = authStore.token();
    const request = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

    return next(request).pipe(
        catchError((err: unknown) => {
            const isSessaoExpirada =
                err instanceof HttpErrorResponse &&
                err.status === HttpStatusCode.Unauthorized &&
                !!token &&
                !AUTH_ROUTES.includes(req.url);

            if (!isSessaoExpirada) {
                return throwError(() => err);
            }

            authStore.logout();
            router.navigate([RoutePaths.LOGIN_ROUTE]);
            return EMPTY;
        }),
    );
};
