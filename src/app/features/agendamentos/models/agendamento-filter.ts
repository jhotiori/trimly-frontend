/*
    Filtros opcionais da listagem de agendamentos, enviados como query params.
*/

import type { AgendamentoStatus } from "./agendamento-status.enum";

/**
 * Filtros opcionais para a listagem de agendamentos. Campos ausentes são ignorados.
 */
export interface AgendamentoFilter {
    status?: AgendamentoStatus;
    data?: string;
    usuarioId?: number;
    servicoId?: number;
}
