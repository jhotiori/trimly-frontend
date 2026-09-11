import { Component, Input } from "@angular/core";

import type { AgendamentoView } from "../../../services/agendamento/agendamento.store";
import { AgendamentoItemComponent } from "../agendamento-item/agendamento-item.component";

/**
 * Exibe uma lista de agendamentos, ou um estado vazio quando não há nenhum.
 */
@Component({
    selector: "app-agendamento-list",
    imports: [AgendamentoItemComponent],
    templateUrl: "./agendamento-list.component.html",
    styleUrl: "./agendamento-list.component.scss",
})
export class AgendamentoListComponent {
    /** Agendamentos a serem exibidos. */
    @Input({ required: true }) agendamentos: AgendamentoView[] = [];
}
