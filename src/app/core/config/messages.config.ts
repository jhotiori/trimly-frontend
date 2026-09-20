/**
 * Mensagens de recusa exibidas pelas lojas quando o backend não devolve uma própria.
 *
 * Servem de fallback para `extractErrorMessage`: a mensagem do backend tem prioridade e
 * estas só aparecem quando a resposta não traz nenhuma.
 *
 * @example
 * ```ts
 * alertService.error(extractErrorMessage(err, ErrorMessages.SERVICO_CREATE));
 * ```
 */
export const ErrorMessages = {
    AGENDAMENTO_CREATE: "Não foi possível criar o agendamento.",
    AGENDAMENTO_UPDATE: "Não foi possível atualizar o agendamento.",
    AGENDAMENTO_REMOVE: "Não foi possível remover o agendamento.",
    DISPONIBILIDADE_CREATE: "Não foi possível criar a disponibilidade.",
    DISPONIBILIDADE_UPDATE: "Não foi possível atualizar a disponibilidade.",
    DISPONIBILIDADE_REMOVE: "Não foi possível remover a disponibilidade.",
    SERVICO_CREATE: "Não foi possível criar o serviço.",
    SERVICO_UPDATE: "Não foi possível atualizar o serviço.",
    SERVICO_REMOVE: "Não foi possível remover o serviço.",
    USUARIO_REGISTER: "Não foi possível criar a conta.",
};
