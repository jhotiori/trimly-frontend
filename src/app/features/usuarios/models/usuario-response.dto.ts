import type { UsuarioCargo } from "./usuario-cargo.enum";

/**
 * Dados de um usuário retornado pela API.
 */
export interface UsuarioResponseDTO {
    id: number;
    nome: string;
    email: string;
    cargo: UsuarioCargo;
}
