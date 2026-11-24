/*
    Utilitário que reduz horários do backend ao formato `HH:mm`.
*/

/** Tamanho de um horário no formato `HH:mm`. */
const HHMM_LENGTH = "HH:mm".length;

/**
 * Reduz um horário do backend ao formato `HH:mm`, descartando os segundos.
 *
 * @param horario - Horário no formato `HH:mm` ou `HH:mm:ss`.
 * @returns O horário no formato `HH:mm`.
 */
export function toHHmm(horario: string): string {
    return horario.slice(0, HHMM_LENGTH);
}
