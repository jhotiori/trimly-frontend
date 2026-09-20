/**
 * Formatadores de moeda, data e dia da semana no padrão brasileiro.
 *
 * Reúne a localidade `pt-BR` em um só lugar, então um ajuste de formato vale para toda a
 * aplicação.
 *
 * @example
 * ```ts
 * Formats.PRECO.format(40); // R$ 40,00
 * ```
 */
export const Formats = {
    PRECO: new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }),
    DATA_HORA: new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }),
    DIA_SEMANA: new Intl.DateTimeFormat("pt-BR", { weekday: "long" }),
};
