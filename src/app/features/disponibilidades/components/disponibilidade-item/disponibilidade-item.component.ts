import { Component, Input, inject } from "@angular/core";

import { EnumLabelPipe } from "../../../../core/pipes/enum-label.pipe";
import { AlertService } from "../../../../core/services/alert.service";
import { AuthStore } from "../../../auth/services/auth.store";
import type { DisponibilidadeResponseDTO } from "../../models/disponibilidade-response.dto";
import { DisponibilidadeStore } from "../../services/disponibilidade.store";

/**
 * Cartão de uma única disponibilidade: o dia da semana e a janela de atendimento.
 *
 * Qualquer cargo vê o cartão; a exclusão fica restrita ao gestor.
 */
@Component({
    selector: "app-disponibilidade-item",
    imports: [EnumLabelPipe],
    templateUrl: "./disponibilidade-item.component.html",
})
export class DisponibilidadeItemComponent {
    /**
     * Loja reativa das disponibilidades, usada para remover o item exibido.
     * @see {@link DisponibilidadeStore}
     */
    private readonly store = inject(DisponibilidadeStore);

    /**
     * Superfície de diálogos, usada para confirmar a exclusão.
     * @see {@link AlertService}
     */
    private readonly alertService = inject(AlertService);

    /**
     * Sessão do usuário, que libera a exclusão ao gestor.
     * @see {@link AuthStore}
     */
    readonly authStore = inject(AuthStore);

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
     * Remove a disponibilidade exibida através da loja compartilhada, após a confirmação do gestor.
     *
     * Recusar o diálogo não altera nada; uma recusa do backend deixa a lista intacta e já é
     * reportada pela loja.
     */
    async remove(): Promise<void> {
        const confirmado = await this.alertService.confirm(
            "Excluir disponibilidade",
            "Você tem certeza que deseja excluir esta disponibilidade?",
        );

        if (!confirmado) {
            return;
        }

        this.store.remove(this.disponibilidade.id).subscribe();
    }
}
