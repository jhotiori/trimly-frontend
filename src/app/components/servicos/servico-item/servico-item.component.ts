import { Component, Input, inject } from "@angular/core";
import { MdbModalModule, MdbModalService } from "mdb-angular-ui-kit/modal";

import type { ServicoResponseDTO } from "../../../models/servico/servico-response.dto";
import { ServicoStore } from "../../../services/servico/servico.store";
import { ServicoFormComponent } from "../servico-form/servico-form.component";

/** Formatador de valores monetários em real. */
const FORMATO_PRECO = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/** Configuração aplicada ao modal de edição aberto pelo item. */
const CONFIG_MODAL = { modalClass: "modal-dialog-centered" };

/**
 * Exibe um único serviço com seus dados principais e as ações de edição e exclusão.
 */
@Component({
    selector: "app-servico-item",
    imports: [MdbModalModule],
    templateUrl: "./servico-item.component.html",
    styleUrl: "./servico-item.component.scss",
})
export class ServicoItemComponent {
    /**
     * Loja reativa dos serviços, usada para remover o item exibido.
     * @see {@link ServicoStore}
     */
    private readonly store = inject(ServicoStore);

    /**
     * Serviço de modais do MDB, usado para abrir o formulário de edição.
     * @see {@link MdbModalService}
     */
    private readonly modalService = inject(MdbModalService);

    /** Serviço exibido. */
    @Input({ required: true }) servico!: ServicoResponseDTO;

    /**
     * Formata um valor monetário em real.
     *
     * @param valor - Valor a ser formatado.
     * @returns O valor com o símbolo da moeda.
     */
    formatPreco(valor: number): string {
        return FORMATO_PRECO.format(valor);
    }

    /**
     * Abre o formulário de edição já preenchido com o serviço exibido.
     */
    editar(): void {
        this.modalService.open(ServicoFormComponent, {
            ...CONFIG_MODAL,
            data: { servico: this.servico },
        });
    }

    /**
     * Remove o serviço exibido através da loja compartilhada.
     *
     * Uma recusa do backend deixa a lista intacta e já é reportada pela loja.
     */
    remove(): void {
        this.store.remove(this.servico.id).subscribe();
    }
}
