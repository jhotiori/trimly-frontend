import { Component, Input } from "@angular/core";

import type { DisponibilidadeResponseDTO } from "../../models/disponibilidade-response.dto";
import { DisponibilidadeItemComponent } from "../disponibilidade-item/disponibilidade-item.component";

/**
 * Exibe as disponibilidades em uma grade de cartões, ou um estado vazio quando não há nenhuma.
 */
@Component({
    selector: "app-disponibilidade-list",
    imports: [DisponibilidadeItemComponent],
    templateUrl: "./disponibilidade-list.component.html",
})
export class DisponibilidadeListComponent {
    /** Disponibilidades a serem exibidas. */
    @Input({ required: true }) disponibilidades: DisponibilidadeResponseDTO[] = [];
}
