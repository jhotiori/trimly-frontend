/*
    Utilitários para datas sem horário (`yyyy-MM-dd`) no fuso local.
*/

import { Formats } from "../config/formats.config";

/**
 * Converte uma data `yyyy-MM-dd` do backend em `Date` à meia-noite local.
 *
 * @param data - Data no formato `yyyy-MM-dd`.
 * @returns A data à meia-noite do fuso local.
 */
export function parseDate(data: string): Date {
    // Sem o horário, `new Date` lê a data como UTC e mostra o dia anterior em GMT-3.
    return new Date(`${data}T00:00:00`);
}

/**
 * Informa a data de hoje no fuso local, comparável por texto com as datas do backend.
 *
 * @returns Hoje no formato `yyyy-MM-dd`.
 */
export function todayIso(): string {
    return Formats.DATE_ISO.format(new Date());
}
