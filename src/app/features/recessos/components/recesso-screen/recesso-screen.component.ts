/*
    Tela de recessos: busca por campo com atraso, listagem e abertura do formulário de criação.
*/

import { Component, computed, inject, type OnInit } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { MdbModalModule, MdbModalService } from "mdb-angular-ui-kit/modal";
import { debounceTime } from "rxjs";
import { Formats } from "../../../../infra/config/formats.config";
import { UiConfig } from "../../../../infra/config/ui.config";
import { parseDate } from "../../../../infra/utils/date.util";
import { normalizeText } from "../../../../infra/utils/text.util";
import { AuthStore } from "../../../auth/services/auth.store";
import type { RecessoResponseDTO } from "../../models/recesso-response.dto";
import { RecessoStore } from "../../services/recesso.store";
import { RecessoFormComponent } from "../recesso-form/recesso-form.component";
import { RecessoListComponent } from "../recesso-list/recesso-list.component";

/** Campos sobre os quais a busca de recessos pode ser aplicada. */
type CampoBusca = "descricao" | "dataInicio" | "dataFim";

/** Opções do seletor de campo, na ordem exibida. */
const OPCOES_BUSCA: { campo: CampoBusca; rotulo: string }[] = [
    { campo: "descricao", rotulo: "Descrição" },
    { campo: "dataInicio", rotulo: "Início" },
    { campo: "dataFim", rotulo: "Fim" },
];

/** Texto pesquisável de cada campo de busca; as datas valem como aparecem no cartão, `dd/MM/yyyy`. */
const VALOR_BUSCA: Record<CampoBusca, (recesso: RecessoResponseDTO) => string> = {
    descricao: (recesso) => recesso.descricao,
    dataInicio: (recesso) => Formats.DATE.format(parseDate(recesso.dataInicio)),
    dataFim: (recesso) => Formats.DATE.format(parseDate(recesso.dataFim)),
};

@Component({
    selector: "app-recesso-screen",
    imports: [MdbModalModule, ReactiveFormsModule, RecessoListComponent],
    templateUrl: "./recesso-screen.component.html",
})
export class RecessoScreenComponent implements OnInit {
    /**
     * Loja reativa dos recessos.
     * {@link RecessoStore}
     */
    private readonly store = inject(RecessoStore);

    /**
     * Serviço de modais do MDB, usado para abrir o formulário de criação.
     * {@link MdbModalService}
     */
    private readonly modalService = inject(MdbModalService);

    /**
     * Sessão do usuário, que libera o botão de criação.
     * {@link AuthStore}
     */
    readonly authStore = inject(AuthStore);

    /** Texto digitado na busca. */
    readonly busca = new FormControl("", { nonNullable: true });

    /** Campo sobre o qual a busca é aplicada. */
    readonly campo = new FormControl<CampoBusca>("descricao", { nonNullable: true });

    /** Campos disponíveis no seletor. */
    readonly opcoesBusca = OPCOES_BUSCA;

    /** Texto da busca, aplicado só depois de uma pausa na digitação. */
    private readonly termo = toSignal(this.busca.valueChanges.pipe(debounceTime(UiConfig.SEARCH_DEBOUNCE)), {
        initialValue: "",
    });

    /** Campo selecionado, aplicado imediatamente. */
    private readonly campoAtual = toSignal(this.campo.valueChanges, { initialValue: this.campo.value });

    /**
     * Recessos exibidos na grade.
     * Do início mais recente ao mais antigo, filtrados pela busca no campo escolhido.
     */
    readonly recessosFiltrados = computed(() => {
        const termo = normalizeText(this.termo().trim());
        const valorBusca = VALOR_BUSCA[this.campoAtual()];

        return this.store
            .recessos()
            .filter((recesso) => normalizeText(valorBusca(recesso)).includes(termo))
            .sort((a, b) => b.dataInicio.localeCompare(a.dataInicio));
    });

    /**
     * Recarrega os recessos a cada entrada na tela.
     */
    ngOnInit(): void {
        this.store.load();
    }

    /**
     * Abre o modal de criação de recesso.
     */
    openRecessoForm(): void {
        this.modalService.open(RecessoFormComponent, UiConfig.MODAL);
    }
}
