import { Component, Input, inject, signal } from "@angular/core";
import { MdbModalModule, MdbModalService } from "mdb-angular-ui-kit/modal";

import { AgendamentoStatus } from "../../../models/agendamento/agendamento-status.enum";
import { AgendamentoStore, type AgendamentoView } from "../../../services/agendamento/agendamento.store";
import { AlertService } from "../../../services/alert.service";
import { AuthStore } from "../../../services/auth/auth.store";
import { AgendamentoFormComponent } from "../agendamento-form/agendamento-form.component";

/** Formatador de data e hora no padrão brasileiro. */
const FORMATO_DATA = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });

/** Configuração aplicada ao modal de edição aberto pelo item. */
const CONFIG_MODAL = { modalClass: "modal-dialog-centered" };

/**
 * Exibe um único agendamento e as ações permitidas a quem está na sessão.
 *
 * Um gestor exclui ou edita; um cliente cancela ou muda o próprio agendamento por um menu
 * compacto, sem acesso à exclusão.
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
     * Superfície de diálogos, usada para confirmar o cancelamento.
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
    readonly menuAberto = signal(false);

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
     * Alterna a visibilidade do menu de ações do cliente.
     */
    toggleMenu(): void {
        this.menuAberto.update((aberto) => !aberto);
    }

    /**
     * Cancela o agendamento exibido após a confirmação do cliente.
     *
     * Recusar o diálogo não altera nada.
     */
    async cancelar(): Promise<void> {
        this.menuAberto.set(false);

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
    mudar(): void {
        this.menuAberto.set(false);

        this.modalService.open(AgendamentoFormComponent, {
            ...CONFIG_MODAL,
            data: { agendamento: this.agendamento },
        });
    }

    /**
     * Remove o agendamento exibido através da loja compartilhada.
     *
     * Uma recusa do backend deixa a lista intacta e já é reportada pela loja.
     */
    remove(): void {
        this.store.remove(this.agendamento.id).subscribe();
    }
}
