/*
    Variáveis do build de produção. O build de desenvolvimento troca este arquivo por `environment.development.ts`.
*/

/**
 * Variáveis de ambiente do frontend.
 */
export const environment = {
    /** URL base da API do backend, sem barra final. */
    apiUrl: "http://${window.location.hostname}:8080",
};
