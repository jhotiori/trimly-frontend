/*
    Cliente HTTP do endpoint de feriados nacionais.
*/

import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import type { Observable } from "rxjs";

import { Endpoints } from "../../../infra/config/endpoints.config";
import type { FeriadoResponseDTO } from "../models/feriado-response.dto";

@Injectable({
    providedIn: "root",
})
export class FeriadoService {
    /** Cliente HTTP usado nas requisições à API. */
    private readonly http = inject(HttpClient);

    /** URL base do recurso de feriados. */
    private readonly url = Endpoints.FERIADOS_URL;

    /**
     * Lista os feriados nacionais do ano atual.
     *
     * @returns Os feriados do ano corrente, definido pelo backend.
     */
    findAll(): Observable<FeriadoResponseDTO[]> {
        return this.http.get<FeriadoResponseDTO[]>(this.url);
    }
}
