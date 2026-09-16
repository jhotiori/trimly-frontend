/**
 * Junta os segmentos informados em um caminho de rota absoluto, a partir da raiz da aplicação.
 *
 * @param segments - Segmentos do caminho, na ordem.
 * @returns Caminho resultante, iniciado por barra e com os segmentos unidos por barra.
 * @example
 * ```ts
 * ROUTE("dashboard", "view"); // /dashboard/view
 * ```
 */
export function ROUTE(...segments: (string | number)[]): string {
    return `/${segments.join("/")}`;
}

/**
 * Caminhos absolutos de navegação de cada tela da aplicação.
 */
export const RoutePaths = {
    LOGIN_ROUTE: ROUTE("login"),
    DASHBOARD_VIEW_ROUTE: ROUTE("dashboard", "view"),
    DASHBOARD_AGENDAMENTOS_ROUTE: ROUTE("dashboard", "agendamentos"),
    DASHBOARD_SERVICOS_ROUTE: ROUTE("dashboard", "servicos"),
};
