/*
    Payload de atualização parcial (PATCH) de recesso.
*/

/**
 * Campos opcionais para a atualização parcial de um recesso (semântica de PATCH).
 */
export interface RecessoUpdateDTO {
    descricao?: string;
    dataInicio?: string;
    dataFim?: string;
}
