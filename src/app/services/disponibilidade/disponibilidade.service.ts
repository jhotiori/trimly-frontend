import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import type { Observable } from "rxjs";

import { ENDPOINT, Endpoints } from "../../config/endpoints.config";
import type { DiaSemana } from "../../models/disponibilidade/dia-semana.enum";
import type { DisponibilidadeCreateDTO } from "../../models/disponibilidade/disponibilidade-create.dto";
import type { DisponibilidadeResponseDTO } from "../../models/disponibilidade/disponibilidade-response.dto";
import type { DisponibilidadeUpdateDTO } from "../../models/disponibilidade/disponibilidade-update.dto";

/**
 * Serviço HTTP para as operações de disponibilidade na API do backend.
 */
@Injectable({
    providedIn: "root",
})
export class DisponibilidadeService {
    /** Cliente HTTP usado nas requisições à API. */
    private readonly http = inject(HttpClient);

    /** URL base do recurso de disponibilidades. */
    private readonly url = Endpoints.DISPONIBILIDADES_URL;

    /**
     * Cria uma nova disponibilidade.
     *
     * @param request - Dados da disponibilidade a ser criada.
     * @returns A disponibilidade criada.
     * @example
     * ```ts
     * disponibilidadeService.create({ diaSemana: DiaSemana.SEGUNDA, horaInicio: "09:00", horaFim: "18:00" });
     * ```
     */
    create(request: DisponibilidadeCreateDTO): Observable<DisponibilidadeResponseDTO> {
        return this.http.post<DisponibilidadeResponseDTO>(this.url, request);
    }

    /**
     * Atualiza parcialmente uma disponibilidade existente.
     *
     * @param id - Identificador da disponibilidade.
     * @param request - Campos a serem atualizados.
     * @returns A disponibilidade atualizada.
     * @example
     * ```ts
     * disponibilidadeService.update(1, { horaFim: "20:00" });
     * ```
     */
    update(id: number, request: DisponibilidadeUpdateDTO): Observable<DisponibilidadeResponseDTO> {
        return this.http.patch<DisponibilidadeResponseDTO>(ENDPOINT(this.url, id), request);
    }

    /**
     * Lista todas as disponibilidades cadastradas.
     *
     * @returns A lista completa de disponibilidades.
     * @example
     * ```ts
     * disponibilidadeService.findAll();
     * ```
     */
    findAll(): Observable<DisponibilidadeResponseDTO[]> {
        return this.http.get<DisponibilidadeResponseDTO[]>(this.url);
    }

    /**
     * Busca uma disponibilidade pelo seu identificador.
     *
     * @param id - Identificador da disponibilidade.
     * @returns A disponibilidade encontrada.
     * @example
     * ```ts
     * disponibilidadeService.findById(1);
     * ```
     */
    findById(id: number): Observable<DisponibilidadeResponseDTO> {
        return this.http.get<DisponibilidadeResponseDTO>(ENDPOINT(this.url, id));
    }

    /**
     * Lista as disponibilidades de um dia da semana.
     *
     * @param diaSemana - Dia da semana a ser consultado.
     * @returns As disponibilidades do dia informado.
     * @example
     * ```ts
     * disponibilidadeService.findByDiaSemana(DiaSemana.SEGUNDA);
     * ```
     */
    findByDiaSemana(diaSemana: DiaSemana): Observable<DisponibilidadeResponseDTO[]> {
        return this.http.get<DisponibilidadeResponseDTO[]>(ENDPOINT(this.url, "dia", diaSemana));
    }

    /**
     * Remove uma disponibilidade pelo seu identificador.
     *
     * @param id - Identificador da disponibilidade.
     * @returns Nada quando a remoção é concluída.
     * @example
     * ```ts
     * disponibilidadeService.deleteById(1);
     * ```
     */
    deleteById(id: number): Observable<void> {
        return this.http.delete<void>(ENDPOINT(this.url, id));
    }
}
