/*
    Cartão somente leitura de um feriado nacional, com a data e o dia da semana.
*/

import { Component, Input } from "@angular/core";

import { Formats } from "../../../../infra/config/formats.config";
import type { FeriadoResponseDTO } from "../../models/feriado-response.dto";

@Component({
    selector: "app-feriado-item",
    templateUrl: "./feriado-item.component.html",
})
export class FeriadoItemComponent {
    /** Feriado exibido. */
    @Input({ required: true }) feriado!: FeriadoResponseDTO;

    /**
     * Formata a data do feriado como dia e mês seguidos do dia da semana.
     *
     * @param data - Data recebida do backend, no formato `yyyy-MM-dd`.
     * @returns A data no formato `dd/MM, dia-da-semana`.
     */
    formatData(data: string): string {
        // Sem o horário, `new Date` lê a data como UTC e mostra o dia anterior em GMT-3.
        const dia = new Date(`${data}T00:00:00`);

        return `${Formats.DAY_MONTH.format(dia)}, ${Formats.WEEKDAY.format(dia)}`;
    }
}
