/*
    Grade de cartões de feriados, com estado vazio quando a lista não tem itens.
*/

import { Component, Input } from "@angular/core";

import type { FeriadoResponseDTO } from "../../models/feriado-response.dto";
import { FeriadoItemComponent } from "../feriado-item/feriado-item.component";

@Component({
    selector: "app-feriado-list",
    imports: [FeriadoItemComponent],
    templateUrl: "./feriado-list.component.html",
})
export class FeriadoListComponent {
    /** Feriados a serem exibidos. */
    @Input({ required: true }) feriados: FeriadoResponseDTO[] = [];
}
