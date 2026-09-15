import { Component, Input, inject, signal } from "@angular/core";
import { MdbModalModule, MdbModalService } from "mdb-angular-ui-kit/modal";
import { AlertService } from "../../../../core/services/alert.service";
import { AuthStore } from "../../../auth/services/auth.store";
import { AgendamentoStatus } from "../../models/agendamento-status.enum";
import { AgendamentoStore, type AgendamentoView } from "../../services/agendamento.store";
import { AgendamentoFormComponent } from "../agendamento-form/agendamento-form.component";

/** Formatador de data e hora no padrão brasileiro. */
const FORMATO_DATA = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });

/** Formatador de valores monetários em real. */
const FORMATO_PRECO = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/** Configuração aplicada ao modal de edição aberto pelo item. */
const CONFIG_MODAL = { modalClass: "modal-dialog-centered" };

/**
 * Cartão de um único agendamento e as ações permitidas a quem está na sessão.
 *
 * Um gestor vê o cliente, exclui ou edita; um cliente cancela ou muda o próprio agendamento
 * por um menu compacto, sem acesso à exclusão.
 */
@Component({
    selector: "app-agendamento-item",
    imports: [MdbModalModule],
    templateUrl: "./agendamento-item.component.html",
    styleUrl: "./agendamento-item.component.scss",
})
export class AgendamentoItemComponent {
    /**
     * Loja reativa dos agendamentos, usada para remover e atualizar o item exibido.
     * @see {@link AgendamentoStore}
     */
    private readonly store = inject(AgendamentoStore);

    /**
     * Superfície de diálogos, usada para confirmar o cancelamento e a exclusão.
     * @see {@link AlertService}
     */
    private readonly alertService = inject(AlertService);

    /**
     * Serviço de modais do MDB, usado para abrir o formulário de edição.
     * @see {@link MdbModalService}
     */
    private readonly modalService = inject(MdbModalService);

    /**
     * Sessão do usuário, que define o conjunto de ações do item.
     * @see {@link AuthStore}
     */
    readonly authStore = inject(AuthStore);

    /** Agendamento exibido, já com o serviço e o cliente resolvidos. */
    @Input({ required: true }) agendamento!: AgendamentoView;

    /** Indica se o menu de ações do cliente está aberto. */
    readonly isMenuAberto = signal(false);

    /**
     * Formata a data do agendamento no padrão brasileiro.
     *
     * @param data - Data do agendamento em formato ISO.
     * @returns A data e o horário legíveis.
     */
    formatData(data: string): string {
        return FORMATO_DATA.format(new Date(data));
    }

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
     * Alterna a visibilidade do menu de ações do cliente.
     */
    toggleMenu(): void {
        this.isMenuAberto.update((aberto) => !aberto);
    }

    /**
     * Cancela o agendamento exibido após a confirmação do cliente.
     *
     * Recusar o diálogo não altera nada.
     */
    async cancel(): Promise<void> {
        this.isMenuAberto.set(false);

        const confirmado = await this.alertService.confirm(
            "Cancelar agendamento",
            "Você tem certeza que deseja cancelar seu Agendamento?",
        );

        if (!confirmado) {
            return;
        }

        this.store.update(this.agendamento.id, { status: AgendamentoStatus.CANCELADO }).subscribe();
    }

    /**
     * Abre o formulário de edição já preenchido com o agendamento exibido.
     */
    edit(): void {
        this.isMenuAberto.set(false);

        this.modalService.open(AgendamentoFormComponent, {
            ...CONFIG_MODAL,
            data: { agendamento: this.agendamento },
        });
    }

    /**
     * Remove o agendamento exibido através da loja compartilhada, após a confirmação do gestor.
     *
     * Recusar o diálogo não altera nada; uma recusa do backend deixa a lista intacta e já é
     * reportada pela loja.
     */
    async remove(): Promise<void> {
        const confirmado = await this.alertService.confirm(
            "Excluir agendamento",
            "Você tem certeza que deseja excluir este agendamento?",
        );

        if (!confirmado) {
            return;
        }

        this.store.remove(this.agendamento.id).subscribe();
    }
}
