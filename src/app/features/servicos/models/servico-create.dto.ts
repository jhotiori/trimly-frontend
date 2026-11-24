/*
    Payload de criação de serviço enviado à API.
*/

/**
 * Dados necessários para criar um serviço.
 */
export interface ServicoCreateDTO {
    nome: string;
    valor: number;
    duracao: number;
}
