import { Component, Input } from "@angular/core";

import type { ServicoResponseDTO } from "../../models/servico-response.dto";
import { ServicoItemComponent } from "../servico-item/servico-item.component";

/**
 * Exibe os serviços em uma grade de cartões, ou um estado vazio quando não há nenhum.
 */
@Component({
    selector: "app-servico-list",
    imports: [ServicoItemComponent],
    templateUrl: "./servico-list.component.html",
})
export class ServicoListComponent {
    /** Serviços a serem exibidos. */
    @Input({ required: true }) servicos: ServicoResponseDTO[] = [];
}
