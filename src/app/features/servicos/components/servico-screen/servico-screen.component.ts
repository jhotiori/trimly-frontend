import { Component, computed, inject } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { MdbModalModule, MdbModalService } from "mdb-angular-ui-kit/modal";
import { debounceTime } from "rxjs";
import { BuscaConfig } from "../../../../core/config/busca.config";
import { ModalConfig } from "../../../../core/config/modal.config";
import { normalizeTexto } from "../../../../core/utils/texto.util";
import { AuthStore } from "../../../auth/services/auth.store";
import { ServicoStore } from "../../services/servico.store";
import { ServicoFormComponent } from "../servico-form/servico-form.component";
import { ServicoListComponent } from "../servico-list/servico-list.component";

/**
 * Tela de serviços: a grade de todos os serviços, a busca local pelo nome e a ação de
 * criação do gestor.
 *
 * Qualquer cargo consulta e pesquisa; só o gestor cria, edita e exclui. A busca roda sobre
 * a lista já carregada, sem nova chamada ao backend.
 */
@Component({
    selector: "app-servico-screen",
    imports: [MdbModalModule, ReactiveFormsModule, ServicoListComponent],
    templateUrl: "./servico-screen.component.html",
})
export class ServicoScreenComponent {
    /**
     * Loja reativa dos serviços.
     * @see {@link ServicoStore}
     */
    private readonly store = inject(ServicoStore);

    /**
     * Serviço de modais do MDB, usado para abrir o formulário de criação.
     * @see {@link MdbModalService}
     */
    private readonly modalService = inject(MdbModalService);

    /**
     * Sessão do usuário, que libera a ação de criação ao gestor.
     * @see {@link AuthStore}
     */
    readonly authStore = inject(AuthStore);

    /** Texto digitado na busca. */
    readonly busca = new FormControl("", { nonNullable: true });

    /** Texto da busca, aplicado só depois de uma pausa na digitação. */
    private readonly termo = toSignal(this.busca.valueChanges.pipe(debounceTime(BuscaConfig.DEBOUNCE)), {
        initialValue: "",
    });

    /** Serviços exibidos na grade, filtrados pelo nome. */
    readonly servicosFiltrados = computed(() => {
        const termo = normalizeTexto(this.termo().trim());

        return this.store.servicos().filter((servico) => normalizeTexto(servico.nome).includes(termo));
    });

    /**
     * Abre o modal de criação de serviço.
     */
    openServicoForm(): void {
        this.modalService.open(ServicoFormComponent, ModalConfig);
    }
}
