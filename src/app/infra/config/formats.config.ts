/*
    Formatadores `Intl` de moeda, data e dia da semana no padrão `pt-BR`, mais a data ISO dos inputs.
*/

/**
 * Formatadores de moeda, data e dia da semana no padrão brasileiro.
 * Reúne a localidade `pt-BR` em um só lugar, então um ajuste de formato vale para toda a
 * aplicação.
 *
 * @example
 * ```ts
 * Formats.CURRENCY.format(40); // R$ 40,00
 * ```
 */
export const Formats = {
    CURRENCY: new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }),
    DATE: new Intl.DateTimeFormat("pt-BR"),
    DATE_TIME: new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }),
    WEEKDAY: new Intl.DateTimeFormat("pt-BR", { weekday: "long" }),
    DAY_MONTH: new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }),
    // A localidade sueca formata a data como `yyyy-MM-dd`, o formato do `<input type="date">`.
    DATE_ISO: new Intl.DateTimeFormat("sv-SE"),
};
