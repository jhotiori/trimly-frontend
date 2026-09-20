import { Component, computed, inject } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { MdbModalModule, MdbModalService } from "mdb-angular-ui-kit/modal";
import { debounceTime } from "rxjs";
import { BuscaConfig } from "../../../../core/config/busca.config";
import { Formats } from "../../../../core/config/formats.config";
import { ModalConfig } from "../../../../core/config/modal.config";
import { normalizeTexto } from "../../../../core/utils/texto.util";
import { AuthStore } from "../../../auth/services/auth.store";
import { AgendamentoStatus } from "../../models/agendamento-status.enum";
import { AgendamentoStore, type AgendamentoView } from "../../services/agendamento.store";
import { AgendamentoFormComponent } from "../agendamento-form/agendamento-form.component";
import { AgendamentoListComponent } from "../agendamento-list/agendamento-list.component";

/** Campos sobre os quais a busca de agendamentos pode ser aplicada. */
type CampoBusca = "usuario" | "servico" | "diaSemana";

/** Opções do seletor de campo, na ordem exibida. */
const OPCOES_BUSCA: { campo: CampoBusca; rotulo: string }[] = [
    { campo: "usuario", rotulo: "Cliente" },
    { campo: "servico", rotulo: "Serviço" },
    { campo: "diaSemana", rotulo: "Dia da semana" },
];

/** Texto pesquisável de cada campo de busca. */
const VALOR_BUSCA: Record<CampoBusca, (agendamento: AgendamentoView) => string> = {
    usuario: (agendamento) => agendamento.usuarioNome,
    servico: (agendamento) => agendamento.servicoNome,
    diaSemana: (agendamento) => Formats.DIA_SEMANA.format(new Date(agendamento.data)),
};

/**
 * Tela de agendamentos: a grade dos `AGENDADO`, a busca local e a ação de criação.
 *
 * Um gestor vê os agendamentos de todos e também busca por cliente; um cliente vê só os
 * seus. A busca roda sobre a lista já carregada, sem nova chamada ao backend.
 */
@Component({
    selector: "app-agendamento-screen",
    imports: [AgendamentoListComponent, MdbModalModule, ReactiveFormsModule],
    templateUrl: "./agendamento-screen.component.html",
})
export class AgendamentoScreenComponent {
    /**
     * Loja reativa dos agendamentos.
     * @see {@link AgendamentoStore}
     */
    private readonly store = inject(AgendamentoStore);

    /**
     * Serviço de modais do MDB, usado para abrir o formulário de criação.
     * @see {@link MdbModalService}
     */
    private readonly modalService = inject(MdbModalService);

    /**
     * Sessão do usuário, que define os agendamentos visíveis e os campos de busca.
     * @see {@link AuthStore}
     */
    readonly authStore = inject(AuthStore);

    /** Texto digitado na busca. */
    readonly busca = new FormControl("", { nonNullable: true });

    /** Campo sobre o qual a busca é aplicada. */
    readonly campo = new FormControl<CampoBusca>("servico", { nonNullable: true });

    /** Campos disponíveis: o cliente não busca por cliente, pois só vê os próprios agendamentos. */
    readonly opcoesBusca = computed(() =>
        this.authStore.isGestor() ? OPCOES_BUSCA : OPCOES_BUSCA.filter((opcao) => opcao.campo !== "usuario"),
    );

    /** Texto da busca, aplicado só depois de uma pausa na digitação. */
    private readonly termo = toSignal(this.busca.valueChanges.pipe(debounceTime(BuscaConfig.DEBOUNCE)), {
        initialValue: "",
    });

    /** Campo selecionado, aplicado imediatamente. */
    private readonly campoAtual = toSignal(this.campo.valueChanges, { initialValue: this.campo.value });

    /**
     * Agendamentos exibidos na grade.
     *
     * Mostra apenas os `AGENDADO`; um cliente vê só os seus, um gestor vê os de todos. Sobre
     * eles aplica a busca no campo escolhido.
     */
    readonly agendamentosFiltrados = computed(() => {
        const isGestor = this.authStore.isGestor();
        const usuarioId = this.authStore.usuarioAtual()?.id;
        const termo = normalizeTexto(this.termo().trim());
        const valorBusca = VALOR_BUSCA[this.campoAtual()];

        return this.store
            .agendamentos()
            .filter(
                (agendamento) =>
                    agendamento.status === AgendamentoStatus.AGENDADO &&
                    (isGestor || agendamento.usuarioId === usuarioId) &&
                    normalizeTexto(valorBusca(agendamento)).includes(termo),
            );
    });

    /**
     * Abre o modal de criação de agendamento.
     */
    openAgendamentoForm(): void {
        this.modalService.open(AgendamentoFormComponent, ModalConfig);
    }
}
