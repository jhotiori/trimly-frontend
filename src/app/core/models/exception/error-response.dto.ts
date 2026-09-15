/**
 * Corpo padrão das respostas de erro da API.
 */
export interface ErrorResponseDTO {
    status: number;
    error: string;
    message: string;
}
