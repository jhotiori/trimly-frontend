/*
    Grade de cartões de agendamento, com estado vazio quando a lista não tem itens.
*/

import { Component, Input } from "@angular/core";

import type { AgendamentoView } from "../../services/agendamento.store";
import { AgendamentoItemComponent } from "../agendamento-item/agendamento-item.component";

@Component({
    selector: "app-agendamento-list",
    imports: [AgendamentoItemComponent],
    templateUrl: "./agendamento-list.component.html",
})
export class AgendamentoListComponent {
    /** Agendamentos a serem exibidos. */
    @Input({ required: true }) agendamentos: AgendamentoView[] = [];
}
