/*
    Cartão de um recesso, com editar e excluir restritos ao gestor.
*/

import { Component, Input, inject } from "@angular/core";
import { MdbModalModule, MdbModalService } from "mdb-angular-ui-kit/modal";

import { Formats } from "../../../../infra/config/formats.config";
import { UiConfig } from "../../../../infra/config/ui.config";
import { AlertService } from "../../../../infra/services/alert.service";
import { parseDate, todayIso } from "../../../../infra/utils/date.util";
import { AuthStore } from "../../../auth/services/auth.store";
import type { RecessoResponseDTO } from "../../models/recesso-response.dto";
import { RecessoStore } from "../../services/recesso.store";
import { RecessoFormComponent } from "../recesso-form/recesso-form.component";

@Component({
    selector: "app-recesso-item",
    imports: [MdbModalModule],
    templateUrl: "./recesso-item.component.html",
})
export class RecessoItemComponent {
    /**
     * Loja reativa dos recessos, usada para remover o item exibido.
     * {@link RecessoStore}
     */
    private readonly store = inject(RecessoStore);

    /**
     * Superfície de diálogos, usada para confirmar a exclusão.
     * {@link AlertService}
     */
    private readonly alertService = inject(AlertService);

    /**
     * Serviço de modais do MDB, usado para abrir o formulário de edição.
     * {@link MdbModalService}
     */
    private readonly modalService = inject(MdbModalService);

    /**
     * Sessão do usuário, que libera as ações de gestão.
     * {@link AuthStore}
     */
    readonly authStore = inject(AuthStore);

    /** Recesso exibido. */
    @Input({ required: true }) recesso!: RecessoResponseDTO;

    /**
     * Indica se o recesso já terminou.
     *
     * @returns `true` quando a data de fim é anterior a hoje.
     */
    get isEncerrado(): boolean {
        return this.recesso.dataFim < todayIso();
    }

    /**
     * Formata o período do recesso como duas datas `dd/MM/yyyy`.
     *
     * @returns O período no formato `dd/MM/yyyy a dd/MM/yyyy`.
     */
    formatPeriodo(): string {
        return `${Formats.DATE.format(parseDate(this.recesso.dataInicio))} a ${Formats.DATE.format(parseDate(this.recesso.dataFim))}`;
    }

    /**
     * Abre o formulário de edição já preenchido com o recesso exibido.
     */
    edit(): void {
        this.modalService.open(RecessoFormComponent, {
            ...UiConfig.MODAL,
            data: { recesso: this.recesso },
        });
    }

    /**
     * Remove o recesso exibido através da loja compartilhada, após a confirmação do gestor.
     * Recusar o diálogo não altera nada; uma recusa do backend deixa a lista intacta e já é
     * reportada pela loja.
     */
    async remove(): Promise<void> {
        const confirmado = await this.alertService.confirm(
            "Excluir recesso",
            "Você tem certeza que deseja excluir este recesso?",
        );

        if (!confirmado) {
            return;
        }

        this.store.remove(this.recesso.id).subscribe();
    }
}
