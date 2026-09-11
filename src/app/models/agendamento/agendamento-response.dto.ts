import type { AgendamentoStatus } from "./agendamento-status.enum";

/**
 * Dados de um agendamento retornado pela API.
 */
export interface AgendamentoResponseDTO {
    id: number;
    data: string;
    duracao: number;
    status: AgendamentoStatus;
    usuarioId: number;
    servicoId: number;
}
