import type { ServicoStatus } from "./servico-status.enum";

/**
 * Dados de um serviço retornado pela API.
 */
export interface ServicoResponseDTO {
    id: number;
    nome: string;
    valor: number;
    duracao: number;
    status: ServicoStatus;
}
