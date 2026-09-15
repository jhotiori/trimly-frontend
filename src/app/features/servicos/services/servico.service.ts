import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import type { Observable } from "rxjs";

import { ENDPOINT, Endpoints } from "../../../core/config/endpoints.config";
import type { ServicoCreateDTO } from "../models/servico-create.dto";
import type { ServicoResponseDTO } from "../models/servico-response.dto";
import type { ServicoStatus } from "../models/servico-status.enum";
import type { ServicoUpdateDTO } from "../models/servico-update.dto";

/**
 * Serviço HTTP para as operações de serviço na API do backend.
 */
@Injectable({
    providedIn: "root",
})
export class ServicoService {
    /** Cliente HTTP usado nas requisições à API. */
    private readonly http = inject(HttpClient);

    /** URL base do recurso de serviços. */
    private readonly url = Endpoints.SERVICOS_URL;

    /**
     * Cria um novo serviço.
     *
     * @param request - Dados do serviço a ser criado.
     * @returns O serviço criado.
     * @example
     * ```ts
     * servicoService.create({ nome: "Corte", valor: 40, duracao: 30 });
     * ```
     */
    create(request: ServicoCreateDTO): Observable<ServicoResponseDTO> {
        return this.http.post<ServicoResponseDTO>(this.url, request);
    }

    /**
     * Atualiza parcialmente um serviço existente.
     *
     * @param id - Identificador do serviço.
     * @param request - Campos a serem atualizados.
     * @returns O serviço atualizado.
     * @example
     * ```ts
     * servicoService.update(1, { valor: 45 });
     * ```
     */
    update(id: number, request: ServicoUpdateDTO): Observable<ServicoResponseDTO> {
        return this.http.patch<ServicoResponseDTO>(ENDPOINT(this.url, id), request);
    }

    /**
     * Lista todos os serviços cadastrados.
     *
     * @returns A lista completa de serviços.
     * @example
     * ```ts
     * servicoService.findAll();
     * ```
     */
    findAll(): Observable<ServicoResponseDTO[]> {
        return this.http.get<ServicoResponseDTO[]>(this.url);
    }

    /**
     * Busca um serviço pelo seu identificador.
     *
     * @param id - Identificador do serviço.
     * @returns O serviço encontrado.
     * @example
     * ```ts
     * servicoService.findById(1);
     * ```
     */
    findById(id: number): Observable<ServicoResponseDTO> {
        return this.http.get<ServicoResponseDTO>(ENDPOINT(this.url, id));
    }

    /**
     * Lista os serviços que possuem o status informado.
     *
     * @param status - Status usado para filtrar os serviços.
     * @returns Os serviços com o status informado.
     * @example
     * ```ts
     * servicoService.findByStatus(ServicoStatus.ATIVO);
     * ```
     */
    findByStatus(status: ServicoStatus): Observable<ServicoResponseDTO[]> {
        return this.http.get<ServicoResponseDTO[]>(ENDPOINT(this.url, "status", status));
    }

    /**
     * Remove um serviço pelo seu identificador.
     *
     * @param id - Identificador do serviço.
     * @returns Nada quando a remoção é concluída.
     * @example
     * ```ts
     * servicoService.deleteById(1);
     * ```
     */
    deleteById(id: number): Observable<void> {
        return this.http.delete<void>(ENDPOINT(this.url, id));
    }
}
