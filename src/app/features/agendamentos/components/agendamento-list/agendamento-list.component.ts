import { Component, Input } from "@angular/core";

import type { AgendamentoView } from "../../services/agendamento.store";
import { AgendamentoItemComponent } from "../agendamento-item/agendamento-item.component";

/**
 * Exibe os agendamentos em uma grade de cartões, ou um estado vazio quando não há nenhum.
 */
@Component({
    selector: "app-agendamento-list",
    imports: [AgendamentoItemComponent],
    templateUrl: "./agendamento-list.component.html",
})
export class AgendamentoListComponent {
    /** Agendamentos a serem exibidos. */
    @Input({ required: true }) agendamentos: AgendamentoView[] = [];
}
