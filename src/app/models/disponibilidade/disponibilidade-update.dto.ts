import type { DiaSemana } from "./dia-semana.enum";

/**
 * Campos opcionais para a atualização parcial de uma disponibilidade (semântica de PATCH).
 */
export interface DisponibilidadeUpdateDTO {
    diaSemana?: DiaSemana;
    horaInicio?: string;
    horaFim?: string;
}
