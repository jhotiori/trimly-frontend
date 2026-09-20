import { Component, Input, inject } from "@angular/core";
import { MdbModalModule, MdbModalService } from "mdb-angular-ui-kit/modal";

import { ModalConfig } from "../../../../core/config/modal.config";
import { EnumLabelPipe } from "../../../../core/pipes/enum-label.pipe";
import { AlertService } from "../../../../core/services/alert.service";
import { AuthStore } from "../../../auth/services/auth.store";
import type { DisponibilidadeResponseDTO } from "../../models/disponibilidade-response.dto";
import { DisponibilidadeStore } from "../../services/disponibilidade.store";
import { DisponibilidadeFormComponent } from "../disponibilidade-form/disponibilidade-form.component";

/**
 * Cartão de uma única disponibilidade: o dia da semana e a janela de atendimento.
 *
 * Qualquer cargo vê o cartão; editar e excluir ficam restritos ao gestor.
 */
@Component({
    selector: "app-disponibilidade-item",
    imports: [EnumLabelPipe, MdbModalModule],
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
     * Serviço de modais do MDB, usado para abrir o formulário de edição.
     * @see {@link MdbModalService}
     */
    private readonly modalService = inject(MdbModalService);

    /**
     * Sessão do usuário, que libera as ações de gestão.
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
     * Abre o formulário de edição já preenchido com a disponibilidade exibida.
     */
    edit(): void {
        this.modalService.open(DisponibilidadeFormComponent, {
            ...ModalConfig,
            data: { disponibilidade: this.disponibilidade },
        });
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
