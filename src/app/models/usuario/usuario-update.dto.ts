import type { UsuarioCargo } from "./usuario-cargo.enum";

/**
 * Campos opcionais para a atualização parcial de um usuário (semântica de PATCH).
 */
export interface UsuarioUpdateDTO {
    nome?: string;
    email?: string;
    senha?: string;
    cargo?: UsuarioCargo;
}
