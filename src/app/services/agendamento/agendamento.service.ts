import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import type { Observable } from "rxjs";

import { ENDPOINT, Endpoints } from "../../config/endpoints.config";
import type { AgendamentoCreateDTO } from "../../models/agendamento/agendamento-create.dto";
import type { AgendamentoResponseDTO } from "../../models/agendamento/agendamento-response.dto";
import type { AgendamentoStatus } from "../../models/agendamento/agendamento-status.enum";
import type { AgendamentoUpdateDTO } from "../../models/agendamento/agendamento-update.dto";

/**
 * Serviço HTTP para as operações de agendamento na API do backend.
 */
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
     * @param status - Filtra pelo status do agendamento.
     * @param data - Filtra pela data no formato ISO.
     * @param usuarioId - Filtra pelo identificador do usuário.
     * @param servicoId - Filtra pelo identificador do serviço.
     * @returns A lista de agendamentos correspondente aos filtros.
     * @example
     * ```ts
     * agendamentoService.findAll(AgendamentoStatus.AGENDADO, "2026-08-30");
     * ```
     */
    findAll(
        status?: AgendamentoStatus,
        data?: string,
        usuarioId?: number,
        servicoId?: number,
    ): Observable<AgendamentoResponseDTO[]> {
        let params = new HttpParams();

        if (status !== undefined && status !== null) {
            params = params.set("status", status);
        }
        if (data !== undefined && data !== null) {
            params = params.set("data", data);
        }
        if (usuarioId !== undefined && usuarioId !== null) {
            params = params.set("usuarioId", usuarioId);
        }
        if (servicoId !== undefined && servicoId !== null) {
            params = params.set("servicoId", servicoId);
        }

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
