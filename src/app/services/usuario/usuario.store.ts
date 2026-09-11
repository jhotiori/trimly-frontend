import type { HttpErrorResponse } from "@angular/common/http";
import { Injectable, inject, signal } from "@angular/core";
import { catchError, map, type Observable, of, tap } from "rxjs";

import type { UsuarioCreateDTO } from "../../models/usuario/usuario-create.dto";
import type { UsuarioResponseDTO } from "../../models/usuario/usuario-response.dto";
import { AlertService, extractErrorMessage } from "../alert.service";
import { UsuarioService } from "./usuario.service";

/**
 * Diretório de usuários, servido pela API.
 *
 * Fica ao lado do `UsuarioService` HTTP sem substituí-lo: guarda a lista em um signal e
 * expõe o cadastro e o login por credenciais. Nenhuma senha entra no estado e o signal só
 * muda depois que a resposta HTTP chega.
 */
@Injectable({
    providedIn: "root",
})
export class UsuarioStore {
    /** Serviço HTTP de usuários. */
    private readonly service = inject(UsuarioService);

    /** Superfície de diálogos usada para reportar as recusas do backend. */
    private readonly alertService = inject(AlertService);

    /** Lista interna de usuários, substituída por inteiro a cada alteração. */
    private readonly state = signal<UsuarioResponseDTO[]>([]);

    /** Lista somente leitura dos usuários atuais. */
    readonly usuarios = this.state.asReadonly();

    constructor() {
        this.service.findAll().subscribe({
            next: (usuarios) => this.state.set(usuarios),
            error: () => {},
        });
    }

    /**
     * Cadastra um novo usuário na API e o acrescenta à lista.
     *
     * @param request - Dados do usuário a ser criado.
     * @returns O usuário criado, ou `null` quando o backend recusa o cadastro.
     * @example
     * ```ts
     * usuarioStore.register({ nome: "Ana", email: "ana@email.com", senha: "1234" });
     * ```
     */
    register(request: UsuarioCreateDTO): Observable<UsuarioResponseDTO | null> {
        return this.service.create(request).pipe(
            tap((usuario) => this.state.update((usuarios) => [...usuarios, usuario])),
            catchError((err: HttpErrorResponse) => {
                this.alertService.error(extractErrorMessage(err, "Não foi possível criar a conta."));
                return of(null);
            }),
        );
    }

    /**
     * Autentica um usuário pelas credenciais informadas.
     *
     * Não mostra diálogo próprio: quem chama decide como reportar a falha.
     *
     * @param email - E-mail informado.
     * @param senha - Senha informada.
     * @returns O usuário autenticado, ou `null` quando as credenciais não conferem.
     * @example
     * ```ts
     * usuarioStore.login("ana@email.com", "1234");
     * ```
     */
    login(email: string, senha: string): Observable<UsuarioResponseDTO | null> {
        return this.service.login({ email, senha }).pipe(
            map((resposta) => resposta.usuario),
            catchError(() => of(null)),
        );
    }
}
