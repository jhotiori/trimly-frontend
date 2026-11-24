/*
    Cliente HTTP dos endpoints de usuário e de autenticação.
*/

import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import type { Observable } from "rxjs";

import { ENDPOINT, Endpoints } from "../../../infra/config/endpoints.config";
import type { AuthResponseDTO } from "../models/auth-response.dto";
import type { UsuarioCreateDTO } from "../models/usuario-create.dto";
import type { UsuarioLoginRequestDTO } from "../models/usuario-login-request.dto";
import type { UsuarioResponseDTO } from "../models/usuario-response.dto";
import type { UsuarioUpdateDTO } from "../models/usuario-update.dto";

@Injectable({
    providedIn: "root",
})
export class UsuarioService {
    /** Cliente HTTP usado nas requisições à API. */
    private readonly http = inject(HttpClient);

    /** URL base do recurso de usuários. */
    private readonly url = Endpoints.USUARIOS_URL;

    /** URL base da autenticação. */
    private readonly authUrl = Endpoints.AUTHENTICATION_URL;

    /**
     * Cadastra um novo usuário como `CLIENTE` e emite o token dele.
     *
     * @param request - Dados do usuário a ser criado.
     * @returns O token emitido e o usuário criado.
     * @example
     * ```ts
     * usuarioService.register({ nome: "Ana", email: "ana@email.com", senha: "senha123" });
     * ```
     */
    register(request: UsuarioCreateDTO): Observable<AuthResponseDTO> {
        return this.http.post<AuthResponseDTO>(ENDPOINT(this.authUrl, "register"), request);
    }

    /**
     * Autentica um usuário pelas credenciais informadas. Credenciais inválidas respondem `401`.
     *
     * @param request - Credenciais informadas.
     * @returns O token emitido e o usuário autenticado.
     * @example
     * ```ts
     * usuarioService.login({ email: "ana@email.com", senha: "senha123" });
     * ```
     */
    login(request: UsuarioLoginRequestDTO): Observable<AuthResponseDTO> {
        return this.http.post<AuthResponseDTO>(ENDPOINT(this.authUrl, "login"), request);
    }

    /**
     * Atualiza parcialmente um usuário existente.
     *
     * @param id - Identificador do usuário.
     * @param request - Campos a serem atualizados.
     * @returns O usuário atualizado.
     * @example
     * ```ts
     * usuarioService.update(1, { nome: "Ana Paula" });
     * ```
     */
    update(id: number, request: UsuarioUpdateDTO): Observable<UsuarioResponseDTO> {
        return this.http.patch<UsuarioResponseDTO>(ENDPOINT(this.url, id), request);
    }

    /**
     * Lista todos os usuários cadastrados.
     *
     * @returns A lista completa de usuários.
     * @example
     * ```ts
     * usuarioService.findAll();
     * ```
     */
    findAll(): Observable<UsuarioResponseDTO[]> {
        return this.http.get<UsuarioResponseDTO[]>(this.url);
    }

    /**
     * Busca um usuário pelo seu identificador.
     *
     * @param id - Identificador do usuário.
     * @returns O usuário encontrado.
     * @example
     * ```ts
     * usuarioService.findById(1);
     * ```
     */
    findById(id: number): Observable<UsuarioResponseDTO> {
        return this.http.get<UsuarioResponseDTO>(ENDPOINT(this.url, id));
    }

    /**
     * Remove um usuário pelo seu identificador.
     *
     * @param id - Identificador do usuário.
     * @returns Nada quando a remoção é concluída.
     * @example
     * ```ts
     * usuarioService.deleteById(1);
     * ```
     */
    deleteById(id: number): Observable<void> {
        return this.http.delete<void>(ENDPOINT(this.url, id));
    }
}
