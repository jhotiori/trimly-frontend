/*
    Payload de criação de recesso.
*/

/**
 * Dados necessários para criar um recesso, com as datas no formato `yyyy-MM-dd`.
 */
export interface RecessoCreateDTO {
    descricao: string;
    dataInicio: string;
    dataFim: string;
}
