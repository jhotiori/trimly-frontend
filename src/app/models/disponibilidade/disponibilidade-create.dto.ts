import type { DiaSemana } from "./dia-semana.enum";

/**
 * Dados necessários para criar uma disponibilidade.
 */
export interface DisponibilidadeCreateDTO {
    diaSemana: DiaSemana;
    horaInicio: string;
    horaFim: string;
}
