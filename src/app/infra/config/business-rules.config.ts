/*
    BusinessRules de negócio validadas no frontend, espelhando os limites do backend quando existem.
*/

/**
 * Limites de negócio aplicados pelos formulários antes de chamar a API.
 */
export const BusinessRules = {
    /** Quantidade máxima de dias entre hoje e a data do agendamento, a mesma regra do backend. */
    ANTECEDENCIA_MAXIMA_DIAS: 14,
    /** Tamanho máximo da descrição do recesso, o mesmo da coluna no backend. */
    RECESSO_DESCRICAO_MAX_LENGTH: 128,
    /** Tamanho mínimo da senha, o mesmo exigido pelo backend. */
    SENHA_MIN_LENGTH: 6,
    /** Tamanho mínimo do nome do serviço. */
    SERVICO_NOME_MIN_LENGTH: 3,
};
