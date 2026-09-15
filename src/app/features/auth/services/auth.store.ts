import { computed, Injectable, inject, signal } from "@angular/core";
import { map, type Observable, tap } from "rxjs";

import { UsuarioCargo } from "../../usuarios/models/usuario-cargo.enum";
import type { UsuarioCreateDTO } from "../../usuarios/models/usuario-create.dto";
import type { UsuarioResponseDTO } from "../../usuarios/models/usuario-response.dto";
import { UsuarioStore } from "../../usuarios/services/usuario.store";

/**
 * Sessão do cliente, mantida apenas em memória.
 *
 * Guarda o usuário autenticado em um signal e resolve as credenciais contra o diretório
 * HTTP de usuários. Não há persistência: recarregar a página esvazia a sessão e devolve o
 * visitante ao `/login`.
 */
@Injectable({
    providedIn: "root",
})
export class AuthStore {
    /** Diretório de usuários usado para resolver as credenciais. */
    private readonly usuarioStore = inject(UsuarioStore);

    /** Usuário da sessão atual, ou `null` quando ninguém está autenticado. */
    private readonly sessao = signal<UsuarioResponseDTO | null>(null);

    /** Usuário autenticado no momento, somente leitura. */
    readonly usuarioAtual = this.sessao.asReadonly();

    /**
     * Indica se existe um usuário autenticado.
     *
     * @returns `true` quando há uma sessão aberta.
     */
    readonly isAutenticado = computed(() => this.sessao() !== null);

    /**
     * Indica se o usuário da sessão administra a barbearia, com cargo `ADMIN` ou `DONO`.
     *
     * É apenas um controle de experiência: o backend libera todas as rotas, então isso não
     * é uma fronteira de segurança.
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
        return this.usuarioStore.login(email, senha).pipe(
            tap((usuario) => {
                if (usuario) {
                    this.sessao.set(usuario);
                }
            }),
            map((usuario) => usuario !== null),
        );
    }

    /**
     * Cadastra um usuário na API e já abre a sessão para ele.
     *
     * @param request - Dados do usuário a ser criado.
     * @returns O usuário criado e autenticado, ou `null` quando o backend recusa o cadastro.
     */
    register(request: UsuarioCreateDTO): Observable<UsuarioResponseDTO | null> {
        return this.usuarioStore.register(request).pipe(
            tap((usuario) => {
                if (usuario) {
                    this.sessao.set(usuario);
                }
            }),
        );
    }

    /**
     * Encerra a sessão atual, sem chamada à API - a sessão só existe em memória.
     */
    logout(): void {
        this.sessao.set(null);
    }
}
