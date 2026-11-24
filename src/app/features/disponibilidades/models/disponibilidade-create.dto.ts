/*
    Payload de criação de disponibilidade enviado à API.
*/

import type { DisponibilidadeDiaSemana } from "./disponibilidade-dia-semana.enum";

/**
 * Dados necessários para criar uma disponibilidade.
 */
export interface DisponibilidadeCreateDTO {
    diaSemana: DisponibilidadeDiaSemana;
    horaInicio: string;
    horaFim: string;
}
