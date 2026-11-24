/*
    Ajustes de interface compartilhados pelas telas: atraso da busca e configuração dos modais do MDB.
*/

/**
 * Ajustes de interface compartilhados pelas telas.
 *
 * @example
 * ```ts
 * this.modalService.open(ServicoFormComponent, UiConfig.MODAL);
 * ```
 */
export const UiConfig = {
    /** Atraso, em milissegundos, entre a digitação e a filtragem da busca. */
    SEARCH_DEBOUNCE: 500,
    /** Configuração base de todo modal do MDB: centralizado na tela. */
    MODAL: { modalClass: "modal-dialog-centered" },
};
