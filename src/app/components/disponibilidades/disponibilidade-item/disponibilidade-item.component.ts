import { Component, Input, inject } from "@angular/core";

import type { DisponibilidadeResponseDTO } from "../../../models/disponibilidade/disponibilidade-response.dto";
import { DisponibilidadeStore } from "../../../services/disponibilidade/disponibilidade.store";

/**
 * Exibe uma única disponibilidade com a sua janela de atendimento e a ação de exclusão.
 */
@Component({
    selector: "app-disponibilidade-item",
    imports: [],
    templateUrl: "./disponibilidade-item.component.html",
    styleUrl: "./disponibilidade-item.component.scss",
})
export class DisponibilidadeItemComponent {
    /**
     * Loja reativa das disponibilidades, usada para remover o item exibido.
     * @see {@link DisponibilidadeStore}
     */
    private readonly store = inject(DisponibilidadeStore);

    /** Disponibilidade exibida. */
    @Input({ required: true }) disponibilidade!: DisponibilidadeResponseDTO;

    /**
     * Recorta um horário da API para o formato de hora e minuto.
     *
     * @param hora - Horário recebido do backend, com ou sem os segundos.
     * @returns O horário no formato `HH:mm`.
     */
    formatHora(hora: string): string {
        return hora.slice(0, 5);
    }

    /**
     * Remove a disponibilidade exibida através da loja compartilhada.
     *
     * Uma recusa do backend deixa a lista intacta e já é reportada pela loja.
     */
    remove(): void {
        this.store.remove(this.disponibilidade.id).subscribe();
    }
}
