/*
    Disponibilidade como a API a devolve.
*/

import type { DisponibilidadeDiaSemana } from "./disponibilidade-dia-semana.enum";

/**
 * Dados de uma disponibilidade retornada pela API.
 */
export interface DisponibilidadeResponseDTO {
    id: number;
    diaSemana: DisponibilidadeDiaSemana;
    horaInicio: string;
    horaFim: string;
}
