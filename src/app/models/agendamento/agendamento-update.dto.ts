import type { AgendamentoStatus } from "./agendamento-status.enum";

/**
 * Campos opcionais para a atualização parcial de um agendamento (semântica de PATCH).
 *
 * O campo `data` é uma data e hora ISO completa (backend `LocalDateTime`), diferente de
 * {@link AgendamentoCreateDTO}, que separa `data` (dia) e `horario` (hora).
 */
export interface AgendamentoUpdateDTO {
    data?: string;
    status?: AgendamentoStatus;
    servicoId?: number;
}
