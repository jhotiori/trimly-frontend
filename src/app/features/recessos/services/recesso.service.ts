/*
    Cliente HTTP dos endpoints de recesso.
*/

import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import type { Observable } from "rxjs";

import { ENDPOINT, Endpoints } from "../../../infra/config/endpoints.config";
import type { RecessoCreateDTO } from "../models/recesso-create.dto";
import type { RecessoResponseDTO } from "../models/recesso-response.dto";
import type { RecessoUpdateDTO } from "../models/recesso-update.dto";

@Injectable({
    providedIn: "root",
})
export class RecessoService {
    /** Cliente HTTP usado nas requisições à API. */
    private readonly http = inject(HttpClient);

    /** URL base do recurso de recessos. */
    private readonly url = Endpoints.RECESSOS_URL;

    /**
     * Cria um novo recesso.
     *
     * @param request - Dados do recesso a ser criado.
     * @returns O recesso criado.
     * @example
     * ```ts
     * recessoService.create({ descricao: "Férias da Barbearia", dataInicio: "2026-12-01", dataFim: "2026-12-17" });
     * ```
     */
    create(request: RecessoCreateDTO): Observable<RecessoResponseDTO> {
        return this.http.post<RecessoResponseDTO>(this.url, request);
    }

    /**
     * Atualiza parcialmente um recesso existente.
     *
     * @param id - Identificador do recesso.
     * @param request - Campos a serem atualizados.
     * @returns O recesso atualizado.
     * @example
     * ```ts
     * recessoService.update(1, { dataFim: "2026-12-20" });
     * ```
     */
    update(id: number, request: RecessoUpdateDTO): Observable<RecessoResponseDTO> {
        return this.http.patch<RecessoResponseDTO>(ENDPOINT(this.url, id), request);
    }

    /**
     * Lista todos os recessos cadastrados.
     *
     * @returns A lista completa de recessos.
     * @example
     * ```ts
     * recessoService.findAll();
     * ```
     */
    findAll(): Observable<RecessoResponseDTO[]> {
        return this.http.get<RecessoResponseDTO[]>(this.url);
    }

    /**
     * Remove um recesso pelo seu identificador.
     *
     * @param id - Identificador do recesso.
     * @returns Nada quando a remoção é concluída.
     * @example
     * ```ts
     * recessoService.deleteById(1);
     * ```
     */
    deleteById(id: number): Observable<void> {
        return this.http.delete<void>(ENDPOINT(this.url, id));
    }
}
