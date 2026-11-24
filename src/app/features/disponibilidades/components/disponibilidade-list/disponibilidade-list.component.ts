/*
    Grade de cartões de disponibilidade, com estado vazio quando a lista não tem itens.
*/

import { Component, Input } from "@angular/core";

import type { DisponibilidadeResponseDTO } from "../../models/disponibilidade-response.dto";
import { DisponibilidadeItemComponent } from "../disponibilidade-item/disponibilidade-item.component";

@Component({
    selector: "app-disponibilidade-list",
    imports: [DisponibilidadeItemComponent],
    templateUrl: "./disponibilidade-list.component.html",
})
export class DisponibilidadeListComponent {
    /** Disponibilidades a serem exibidas. */
    @Input({ required: true }) disponibilidades: DisponibilidadeResponseDTO[] = [];
}
