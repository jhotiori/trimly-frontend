import type { ServicoStatus } from "./servico-status.enum";

/**
 * Campos opcionais para a atualização parcial de um serviço (semântica de PATCH).
 */
export interface ServicoUpdateDTO {
    nome?: string;
    valor?: number;
    duracao?: number;
    status?: ServicoStatus;
}
