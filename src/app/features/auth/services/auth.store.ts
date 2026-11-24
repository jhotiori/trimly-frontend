/*
    Sessão do usuário em memória: token, usuário atual, login, cadastro e logout.
*/

import type { HttpErrorResponse } from "@angular/common/http";
import { computed, Injectable, inject, signal } from "@angular/core";
import { catchError, map, type Observable, of, tap } from "rxjs";

import { ErrorMessages } from "../../../infra/config/messages.config";
import { AlertService, extractErrorMessage } from "../../../infra/services/alert.service";
import type { AuthResponseDTO } from "../../usuarios/models/auth-response.dto";
import { UsuarioCargo } from "../../usuarios/models/usuario-cargo.enum";
import type { UsuarioCreateDTO } from "../../usuarios/models/usuario-create.dto";
import type { UsuarioResponseDTO } from "../../usuarios/models/usuario-response.dto";
import { UsuarioService } from "../../usuarios/services/usuario.service";

@Injectable({
    providedIn: "root",
})
export class AuthStore {
    /** Serviço HTTP de usuários, que expõe o login e o cadastro. */
    private readonly usuarioService = inject(UsuarioService);

    /** Superfície de diálogos usada para reportar a recusa do cadastro. */
    private readonly alertService = inject(AlertService);

    /** Usuário da sessão atual, ou `null` quando ninguém está autenticado. */
    private readonly sessao = signal<UsuarioResponseDTO | null>(null);

    /** Token JWT da sessão atual, ou `null` quando ninguém está autenticado. */
    private readonly tokenState = signal<string | null>(null);

    /** Usuário autenticado no momento, somente leitura. */
    readonly usuarioAtual = this.sessao.asReadonly();

    /** Token JWT enviado ao backend, somente leitura. */
    readonly token = this.tokenState.asReadonly();

    /**
     * Indica se existe um usuário autenticado.
     *
     * @returns `true` quando há uma sessão aberta.
     */
    readonly isAutenticado = computed(() => this.sessao() !== null);

    /**
     * Indica se o usuário da sessão administra a barbearia, com cargo `ADMIN` ou `DONO`.
     * É apenas um controle de experiência: quem garante o acesso é o backend.
     *
     * @returns `true` para `ADMIN` e `DONO`, `false` para `CLIENTE` ou sem sessão.
     */
    readonly isGestor = computed(() => {
        const cargo = this.sessao()?.cargo;

        return cargo === UsuarioCargo.ADMIN || cargo === UsuarioCargo.DONO;
    });

    /**
     * Autentica um usuário contra a API e abre a sessão quando as credenciais conferem.
     *
     * @param email - E-mail informado.
     * @param senha - Senha informada.
     * @returns `true` quando a sessão é aberta, `false` caso contrário.
     * @example
     * ```ts
     * authStore.login("ana@email.com", "1234").subscribe((ok) => ...);
     * ```
     */
    login(email: string, senha: string): Observable<boolean> {
        return this.usuarioService.login({ email, senha }).pipe(
            tap((resposta) => this.open(resposta)),
            map(() => true),
            catchError(() => of(false)),
        );
    }

    /**
     * Cadastra um usuário na API e já abre a sessão para ele.
     *
     * @param request - Dados do usuário a ser criado.
     * @returns O usuário criado e autenticado, ou `null` quando o backend recusa o cadastro.
     */
    register(request: UsuarioCreateDTO): Observable<UsuarioResponseDTO | null> {
        return this.usuarioService.register(request).pipe(
            tap((resposta) => this.open(resposta)),
            map((resposta) => resposta.usuario),
            catchError((err: HttpErrorResponse) => {
                this.alertService.error(extractErrorMessage(err, ErrorMessages.USUARIO_REGISTER));
                return of(null);
            }),
        );
    }

    /**
     * Encerra a sessão atual, sem chamada à API - a sessão só existe em memória.
     */
    logout(): void {
        this.sessao.set(null);
        this.tokenState.set(null);
    }

    /**
     * Abre a sessão com o usuário e o token devolvidos pelo backend.
     *
     * @param resposta - Resposta do login ou do cadastro.
     */
    private open(resposta: AuthResponseDTO): void {
        this.tokenState.set(resposta.token);
        this.sessao.set(resposta.usuario);
    }
}
