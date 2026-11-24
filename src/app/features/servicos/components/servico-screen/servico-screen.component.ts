/*
    Tela de serviços: busca com atraso, listagem e abertura do formulário de criação.
*/

import { Component, computed, inject, type OnInit } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { MdbModalModule, MdbModalService } from "mdb-angular-ui-kit/modal";
import { debounceTime } from "rxjs";
import { UiConfig } from "../../../../infra/config/ui.config";
import { normalizeText } from "../../../../infra/utils/text.util";
import { AuthStore } from "../../../auth/services/auth.store";
import { ServicoStore } from "../../services/servico.store";
import { ServicoFormComponent } from "../servico-form/servico-form.component";
import { ServicoListComponent } from "../servico-list/servico-list.component";

@Component({
    selector: "app-servico-screen",
    imports: [MdbModalModule, ReactiveFormsModule, ServicoListComponent],
    templateUrl: "./servico-screen.component.html",
})
export class ServicoScreenComponent implements OnInit {
    /**
     * Loja reativa dos serviços.
     * {@link ServicoStore}
     */
    private readonly store = inject(ServicoStore);

    /**
     * Serviço de modais do MDB, usado para abrir o formulário de criação.
     * {@link MdbModalService}
     */
    private readonly modalService = inject(MdbModalService);

    /**
     * Sessão do usuário, que libera a ação de criação ao gestor.
     * {@link AuthStore}
     */
    readonly authStore = inject(AuthStore);

    /** Texto digitado na busca. */
    readonly busca = new FormControl("", { nonNullable: true });

    /** Texto da busca, aplicado só depois de uma pausa na digitação. */
    private readonly termo = toSignal(this.busca.valueChanges.pipe(debounceTime(UiConfig.SEARCH_DEBOUNCE)), {
        initialValue: "",
    });

    /** Serviços exibidos na grade, filtrados pelo nome. */
    readonly servicosFiltrados = computed(() => {
        const termo = normalizeText(this.termo().trim());

        return this.store.servicos().filter((servico) => normalizeText(servico.nome).includes(termo));
    });

    /**
     * Recarrega os serviços a cada entrada na tela.
     */
    ngOnInit(): void {
        this.store.load();
    }

    /**
     * Abre o modal de criação de serviço.
     */
    openServicoForm(): void {
        this.modalService.open(ServicoFormComponent, UiConfig.MODAL);
    }
}
