/*
    Resposta de login e cadastro: o token JWT e o usuário autenticado.
*/

import type { UsuarioResponseDTO } from "./usuario-response.dto";

/**
 * Resposta do login e do cadastro: o token JWT emitido e os dados públicos do usuário.
 */
export interface AuthResponseDTO {
    token: string;
    usuario: UsuarioResponseDTO;
}
