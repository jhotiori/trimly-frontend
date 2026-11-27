/*
    Grade de cartões de recesso, com estado vazio quando a lista não tem itens.
*/

import { Component, Input } from "@angular/core";

import type { RecessoResponseDTO } from "../../models/recesso-response.dto";
import { RecessoItemComponent } from "../recesso-item/recesso-item.component";

@Component({
    selector: "app-recesso-list",
    imports: [RecessoItemComponent],
    templateUrl: "./recesso-list.component.html",
})
export class RecessoListComponent {
    /** Recessos a serem exibidos. */
    @Input({ required: true }) recessos: RecessoResponseDTO[] = [];
}
