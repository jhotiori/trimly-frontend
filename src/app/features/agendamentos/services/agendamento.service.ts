/*
    Cliente HTTP dos endpoints de agendamento.
*/

import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import type { Observable } from "rxjs";

import { ENDPOINT, Endpoints } from "../../../infra/config/endpoints.config";
import type { AgendamentoCreateDTO } from "../models/agendamento-create.dto";
import type { AgendamentoFilter } from "../models/agendamento-filter";
import type { AgendamentoResponseDTO } from "../models/agendamento-response.dto";
import type { AgendamentoUpdateDTO } from "../models/agendamento-update.dto";

@Injectable({
    providedIn: "root",
})
export class AgendamentoService {
    /** Cliente HTTP usado nas requisições à API. */
    private readonly http = inject(HttpClient);

    /** URL base do recurso de agendamentos. */
    private readonly url = Endpoints.AGENDAMENTOS_URL;

    /**
     * Cria um novo agendamento.
     *
     * @param request - Dados do agendamento a ser criado.
     * @returns O agendamento criado.
     * @example
     * ```ts
     * agendamentoService.create({ data: "2026-08-30", horario: "10:00", usuarioId: 1, servicoId: 2 });
     * ```
     */
    create(request: AgendamentoCreateDTO): Observable<AgendamentoResponseDTO> {
        return this.http.post<AgendamentoResponseDTO>(this.url, request);
    }

    /**
     * Atualiza parcialmente um agendamento existente.
     *
     * @param id - Identificador do agendamento.
     * @param request - Campos a serem atualizados.
     * @returns O agendamento atualizado.
     * @example
     * ```ts
     * agendamentoService.update(1, { data: "2026-09-01" });
     * ```
     */
    update(id: number, request: AgendamentoUpdateDTO): Observable<AgendamentoResponseDTO> {
        return this.http.patch<AgendamentoResponseDTO>(ENDPOINT(this.url, id), request);
    }

    /**
     * Lista os agendamentos, aplicando os filtros informados.
     *
     * @param filter - Filtros opcionais; campos ausentes não viram query params.
     * @returns A lista de agendamentos correspondente aos filtros.
     * @example
     * ```ts
     * agendamentoService.findAll({ status: AgendamentoStatus.AGENDADO, data: "2026-08-30" });
     * ```
     */
    findAll(filter: AgendamentoFilter = {}): Observable<AgendamentoResponseDTO[]> {
        const definidos = Object.entries(filter).filter(([, valor]) => valor != null);
        const params = new HttpParams({ fromObject: Object.fromEntries(definidos) });

        return this.http.get<AgendamentoResponseDTO[]>(this.url, { params });
    }

    /**
     * Busca um agendamento pelo seu identificador.
     *
     * @param id - Identificador do agendamento.
     * @returns O agendamento encontrado.
     * @example
     * ```ts
     * agendamentoService.findById(1);
     * ```
     */
    findById(id: number): Observable<AgendamentoResponseDTO> {
        return this.http.get<AgendamentoResponseDTO>(ENDPOINT(this.url, id));
    }

    /**
     * Remove um agendamento pelo seu identificador.
     *
     * @param id - Identificador do agendamento.
     * @returns Nada quando a remoção é concluída.
     * @example
     * ```ts
     * agendamentoService.deleteById(1);
     * ```
     */
    deleteById(id: number): Observable<void> {
        return this.http.delete<void>(ENDPOINT(this.url, id));
    }
}
