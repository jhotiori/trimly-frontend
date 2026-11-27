/*
    Tela de disponibilidades: busca por campo com atraso, listagem e abertura do formulário de criação.
*/

import { Component, computed, inject, type OnInit } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { MdbModalModule, MdbModalService } from "mdb-angular-ui-kit/modal";
import { debounceTime } from "rxjs";
import { UiConfig } from "../../../../infra/config/ui.config";
import { normalizeText } from "../../../../infra/utils/text.util";
import { toHHmm } from "../../../../infra/utils/time.util";
import { AuthStore } from "../../../auth/services/auth.store";
import type { DisponibilidadeResponseDTO } from "../../models/disponibilidade-response.dto";
import { DisponibilidadeStore } from "../../services/disponibilidade.store";
import { DisponibilidadeFormComponent } from "../disponibilidade-form/disponibilidade-form.component";
import { DisponibilidadeListComponent } from "../disponibilidade-list/disponibilidade-list.component";

/** Campos sobre os quais a busca de disponibilidades pode ser aplicada. */
type CampoBusca = "diaSemana" | "horaInicio" | "horaFim";

/** Opções do seletor de campo, na ordem exibida. */
const OPCOES_BUSCA: { campo: CampoBusca; rotulo: string }[] = [
    { campo: "diaSemana", rotulo: "Dia da semana" },
    { campo: "horaInicio", rotulo: "Início" },
    { campo: "horaFim", rotulo: "Fim" },
];

/** Texto pesquisável de cada campo de busca; os horários valem como aparecem no cartão, `HH:mm`. */
const VALOR_BUSCA: Record<CampoBusca, (disponibilidade: DisponibilidadeResponseDTO) => string> = {
    diaSemana: (disponibilidade) => disponibilidade.diaSemana,
    horaInicio: (disponibilidade) => toHHmm(disponibilidade.horaInicio),
    horaFim: (disponibilidade) => toHHmm(disponibilidade.horaFim),
};

@Component({
    selector: "app-disponibilidade-screen",
    imports: [DisponibilidadeListComponent, MdbModalModule, ReactiveFormsModule],
    templateUrl: "./disponibilidade-screen.component.html",
})
export class DisponibilidadeScreenComponent implements OnInit {
    /**
     * Loja reativa das disponibilidades.
     * {@link DisponibilidadeStore}
     */
    private readonly store = inject(DisponibilidadeStore);

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
    readonly campo = new FormControl<CampoBusca>("diaSemana", { nonNullable: true });

    /** Campos disponíveis no seletor. */
    readonly opcoesBusca = OPCOES_BUSCA;

    /** Texto da busca, aplicado só depois de uma pausa na digitação. */
    private readonly termo = toSignal(this.busca.valueChanges.pipe(debounceTime(UiConfig.SEARCH_DEBOUNCE)), {
        initialValue: "",
    });

    /** Campo selecionado, aplicado imediatamente. */
    private readonly campoAtual = toSignal(this.campo.valueChanges, { initialValue: this.campo.value });

    /**
     * Disponibilidades exibidas na grade, filtradas pela busca no campo escolhido.
     */
    readonly disponibilidadesFiltradas = computed(() => {
        const termo = normalizeText(this.termo().trim());
        const valorBusca = VALOR_BUSCA[this.campoAtual()];

        return this.store
            .disponibilidades()
            .filter((disponibilidade) => normalizeText(valorBusca(disponibilidade)).includes(termo));
    });

    /**
     * Recarrega as disponibilidades a cada entrada na tela.
     */
    ngOnInit(): void {
        this.store.load();
    }

    /**
     * Abre o modal de criação de disponibilidade.
     */
    openDisponibilidadeForm(): void {
        this.modalService.open(DisponibilidadeFormComponent, UiConfig.MODAL);
    }
}
