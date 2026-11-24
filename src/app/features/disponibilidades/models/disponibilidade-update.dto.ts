/*
    Payload de atualização parcial (PATCH) de disponibilidade.
*/

import type { DisponibilidadeDiaSemana } from "./disponibilidade-dia-semana.enum";

/**
 * Campos opcionais para a atualização parcial de uma disponibilidade (semântica de PATCH).
 */
export interface DisponibilidadeUpdateDTO {
    diaSemana?: DisponibilidadeDiaSemana;
    horaInicio?: string;
    horaFim?: string;
}
