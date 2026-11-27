/*
    Recesso como a API o devolve.
*/

/**
 * Dados de um recesso retornado pela API, com as datas no formato `yyyy-MM-dd`.
 */
export interface RecessoResponseDTO {
    id: number;
    descricao: string;
    dataInicio: string;
    dataFim: string;
}
