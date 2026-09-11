import type { UsuarioResponseDTO } from "./usuario-response.dto";

/**
 * Resultado de um login por credenciais. O campo `usuario` é `null` quando `sucesso` é `false`.
 */
export interface UsuarioLoginResponseDTO {
    sucesso: boolean;
    usuario: UsuarioResponseDTO | null;
}
