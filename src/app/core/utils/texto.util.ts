/**
 * Normaliza um texto para a busca, ignorando maiúsculas e acentos.
 *
 * @param texto - Texto a ser normalizado.
 * @returns O texto em minúsculas e sem diacríticos.
 */
export function normalizeTexto(texto: string): string {
    return texto
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .toLowerCase();
}
