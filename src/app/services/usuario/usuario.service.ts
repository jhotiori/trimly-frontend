import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import type { Observable } from "rxjs";

import { ENDPOINT, Endpoints } from "../../config/endpoints.config";
import type { UsuarioCreateDTO } from "../../models/usuario/usuario-create.dto";
import type { UsuarioLoginRequestDTO } from "../../models/usuario/usuario-login-request.dto";
import type { UsuarioLoginResponseDTO } from "../../models/usuario/usuario-login-response.dto";
import type { UsuarioResponseDTO } from "../../models/usuario/usuario-response.dto";
import type { UsuarioUpdateDTO } from "../../models/usuario/usuario-update.dto";

/**
 * Serviço HTTP para as operações de usuário na API do backend.
 */
@Injectable({
    providedIn: "root",
})
export class UsuarioService {
    /** Cliente HTTP usado nas requisições à API. */
    private readonly http = inject(HttpClient);

    /** URL base do recurso de usuários. */
    private readonly url = Endpoints.USUARIOS_URL;

    /**
     * Cria um novo usuário.
     *
     * @param request - Dados do usuário a ser criado.
     * @returns O usuário criado.
     * @example
     * ```ts
     * usuarioService.create({ nome: "Ana", email: "ana@email.com", senha: "senha123" });
     * ```
     */
    create(request: UsuarioCreateDTO): Observable<UsuarioResponseDTO> {
        return this.http.post<UsuarioResponseDTO>(this.url, request);
    }

    /**
     * Autentica um usuário pelas credenciais informadas.
     *
     * A resposta é sempre bem-sucedida: `sucesso` diz se as credenciais conferem.
     *
     * @param request - Credenciais informadas.
     * @returns O resultado da autenticação.
     * @example
     * ```ts
     * usuarioService.login({ email: "ana@email.com", senha: "senha123" });
     * ```
     */
    login(request: UsuarioLoginRequestDTO): Observable<UsuarioLoginResponseDTO> {
        return this.http.post<UsuarioLoginResponseDTO>(ENDPOINT(this.url, "login"), request);
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
