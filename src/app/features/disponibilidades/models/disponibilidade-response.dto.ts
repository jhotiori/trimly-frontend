import type { DiaSemana } from "./dia-semana.enum";

/**
 * Dados de uma disponibilidade retornada pela API.
 */
export interface DisponibilidadeResponseDTO {
    id: number;
    diaSemana: DiaSemana;
    horaInicio: string;
    horaFim: string;
}
