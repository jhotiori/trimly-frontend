/*
    Payload de cadastro de usuário enviado à API.
*/

/**
 * Dados necessários para criar um usuário.
 */
export interface UsuarioCreateDTO {
    nome: string;
    email: string;
    senha: string;
}
