/*
    Payload de criação de agendamento enviado à API.
*/

/**
 * Dados necessários para criar um agendamento.
 */
export interface AgendamentoCreateDTO {
    data: string;
    horario: string;
    usuarioId: number;
    servicoId: number;
}
