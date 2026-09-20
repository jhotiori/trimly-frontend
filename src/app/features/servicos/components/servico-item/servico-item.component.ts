import { Component, Input, inject } from "@angular/core";
import { MdbModalModule, MdbModalService } from "mdb-angular-ui-kit/modal";

import { Formats } from "../../../../core/config/formats.config";
import { ModalConfig } from "../../../../core/config/modal.config";
import { AlertService } from "../../../../core/services/alert.service";
import { AuthStore } from "../../../auth/services/auth.store";
import type { ServicoResponseDTO } from "../../models/servico-response.dto";
import { ServicoStore } from "../../services/servico.store";
import { ServicoFormComponent } from "../servico-form/servico-form.component";

/**
 * Cartão de um único serviço com nome, valor e duração.
 *
 * Qualquer cargo vê o cartão; editar e excluir ficam restritos ao gestor.
 */
@Component({
    selector: "app-servico-item",
    imports: [MdbModalModule],
    templateUrl: "./servico-item.component.html",
})
export class ServicoItemComponent {
    /**
     * Loja reativa dos serviços, usada para remover o item exibido.
     * @see {@link ServicoStore}
     */
    private readonly store = inject(ServicoStore);

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

    /** Serviço exibido. */
    @Input({ required: true }) servico!: ServicoResponseDTO;

    /**
     * Formata um valor monetário em real.
     *
     * @param valor - Valor a ser formatado.
     * @returns O valor com o símbolo da moeda.
     */
    formatPreco(valor: number): string {
        return Formats.PRECO.format(valor);
    }

    /**
     * Abre o formulário de edição já preenchido com o serviço exibido.
     */
    edit(): void {
        this.modalService.open(ServicoFormComponent, {
            ...ModalConfig,
            data: { servico: this.servico },
        });
    }

    /**
     * Remove o serviço exibido através da loja compartilhada, após a confirmação do gestor.
     *
     * Recusar o diálogo não altera nada; uma recusa do backend deixa a lista intacta e já é
     * reportada pela loja.
     */
    async remove(): Promise<void> {
        const confirmado = await this.alertService.confirm(
            "Excluir serviço",
            "Você tem certeza que deseja excluir este serviço?",
        );

        if (!confirmado) {
            return;
        }

        this.store.remove(this.servico.id).subscribe();
    }
}
