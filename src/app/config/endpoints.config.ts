const PROTOCOL = "http://";
const HOST = "localhost";
const PORT = 8080;
const BASE_URL = `${PROTOCOL}${HOST}:${PORT}`;

/**
 * Junta o root (tronco) de uma URL com os segmentos informados, formatando uma URL de endpoint.
 *
 * @param root - Tronco da URL, geralmente a base do backend.
 * @param segments - Segmentos de caminho anexados ao root, na ordem.
 * @returns URL resultante com os segmentos unidos por barra.
 * @example
 * ```ts
 * ENDPOINT(BASE_URL, "api", "agendamentos"); // http://localhost:8080/api/agendamentos
 * ```
 */
export function ENDPOINT(root: string, ...segments: (string | number)[]): string {
    return [root, ...segments].join("/");
}

/**
 * Caminhos base de cada recurso REST do backend.
 */
export const Endpoints = {
    AGENDAMENTOS_URL: ENDPOINT(BASE_URL, "api", "agendamentos"),
    USUARIOS_URL: ENDPOINT(BASE_URL, "api", "usuarios"),
    SERVICOS_URL: ENDPOINT(BASE_URL, "api", "servicos"),
    DISPONIBILIDADES_URL: ENDPOINT(BASE_URL, "api", "disponibilidades"),
    AUTHENTICATION_URL: ENDPOINT(BASE_URL, "api", "auth"),
};
