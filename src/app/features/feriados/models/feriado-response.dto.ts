/*
    Feriado nacional como a API o devolve.
*/

/**
 * Dados de um feriado nacional retornado pela API.
 */
export interface FeriadoResponseDTO {
    /** Data no formato `yyyy-MM-dd`. */
    readonly date: string;
    readonly name: string;
    readonly type: string;
}
