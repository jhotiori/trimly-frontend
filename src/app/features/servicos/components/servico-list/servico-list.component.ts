/*
    Grade de cartões de serviço, com estado vazio quando a lista não tem itens.
*/

import { Component, Input } from "@angular/core";

import type { ServicoResponseDTO } from "../../models/servico-response.dto";
import { ServicoItemComponent } from "../servico-item/servico-item.component";

@Component({
    selector: "app-servico-list",
    imports: [ServicoItemComponent],
    templateUrl: "./servico-list.component.html",
})
export class ServicoListComponent {
    /** Serviços a serem exibidos. */
    @Input({ required: true }) servicos: ServicoResponseDTO[] = [];
}
