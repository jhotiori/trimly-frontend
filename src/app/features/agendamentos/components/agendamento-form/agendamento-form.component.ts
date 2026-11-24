/*
    Formulário modal que cria ou edita um agendamento, limitando a data à antecedência máxima.
*/

import { Component, computed, effect, inject, type OnInit, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { MdbFormsModule } from "mdb-angular-ui-kit/forms";
import { MdbModalRef } from "mdb-angular-ui-kit/modal";
import { BusinessRules } from "../../../../infra/config/business-rules.config";
import { Formats } from "../../../../infra/config/formats.config";
import { EnumLabelPipe } from "../../../../infra/pipes/enum-label.pipe";
import { toHHmm } from "../../../../infra/utils/time.util";
import { AuthStore } from "../../../auth/services/auth.store";
import { ServicoStore } from "../../../servicos/services/servico.store";
import { UsuarioCargo } from "../../../usuarios/models/usuario-cargo.enum";
import { UsuarioStore } from "../../../usuarios/services/usuario.store";
import { AgendamentoStatus } from "../../models/agendamento-status.enum";
import type { AgendamentoUpdateDTO } from "../../models/agendamento-update.dto";
import { AgendamentoStore, type AgendamentoView } from "../../services/agendamento.store";

@Component({
    selector: "app-agendamento-form",
    imports: [EnumLabelPipe, MdbFormsModule, ReactiveFormsModule],
    templateUrl: "./agendamento-form.component.html",
    styleUrl: "./agendamento-form.component.scss",
})
export class AgendamentoFormComponent implements OnInit {
    /**
     * Construtor de formulários reativos.
     * {@link FormBuilder}
     */
    private readonly builder = inject(FormBuilder);

    /**
     * Loja reativa dos agendamentos, usada para criar e atualizar o registro.
     * {@link AgendamentoStore}
     */
    private readonly store = inject(AgendamentoStore);

    /**
     * Referência do modal que hospeda o formulário.
     * {@link MdbModalRef}
     */
    private readonly modalRef = inject(MdbModalRef<AgendamentoFormComponent>);

    /**
     * Loja reativa dos serviços, usada para popular a seleção de serviço.
     * {@link ServicoStore}
     */
    private readonly servicoStore = inject(ServicoStore);

    /**
     * Diretório de usuários, usado para popular a seleção de cliente do gestor.
     * {@link UsuarioStore}
     */
    private readonly usuarioStore = inject(UsuarioStore);

    /**
     * Sessão do usuário, que define o cliente do agendamento e os campos visíveis e fecha o modal ao
     * ser encerrada.
     * {@link AuthStore}
     */
    readonly authStore = inject(AuthStore);

    /** Agendamento em edição, atribuído pelo `data` do modal. Ausente na criação. */
    agendamento?: AgendamentoView;

    /** Serviços disponíveis para escolha. */
    readonly servicos = this.servicoStore.servicos;

    /** Clientes disponíveis para o gestor escolher na criação. */
    readonly clientes = computed(() =>
        this.usuarioStore.usuarios().filter((usuario) => usuario.cargo === UsuarioCargo.CLIENTE),
    );

    /** Status que o gestor pode atribuir na edição. */
    readonly statusDisponiveis = Object.values(AgendamentoStatus);

    /** Indica que houve uma tentativa de envio, liberando as mensagens de erro. */
    readonly submitted = signal(false);

    /** Menor data aceita pelo campo de data: hoje, no formato `yyyy-MM-dd`. */
    readonly dataMinima = this.computeDataIso(0);

    /** Maior data aceita pelo campo de data: hoje mais a antecedência máxima, no formato `yyyy-MM-dd`. */
    readonly dataMaxima = this.computeDataIso(BusinessRules.ANTECEDENCIA_MAXIMA_DIAS);

    /** Campos do agendamento. */
    readonly form = this.builder.nonNullable.group({
        data: ["", Validators.required],
        horario: ["", Validators.required],
        usuarioId: [null as number | null],
        servicoId: [null as number | null, Validators.required],
        status: [null as AgendamentoStatus | null],
    });

    constructor() {
        // A sessão encerrada (logout ou `401`) fecha o modal, liberando a tela de login.
        effect(() => {
            if (!this.authStore.isAutenticado()) {
                this.modalRef.close();
            }
        });
    }

    /**
     * Indica se o formulário está editando um agendamento existente.
     *
     * @returns `true` quando um agendamento foi recebido pelo `data` do modal.
     */
    get isEditing(): boolean {
        return this.agendamento !== undefined;
    }

    /**
     * Preenche o formulário na edição e exige o cliente quando o gestor está criando.
     */
    ngOnInit(): void {
        const agendamento = this.agendamento;

        if (agendamento) {
            const [data, horario] = agendamento.data.split("T");

            this.form.patchValue({
                data,
                horario: toHHmm(horario),
                servicoId: agendamento.servicoId,
                status: agendamento.status,
            });

            return;
        }

        if (this.authStore.isGestor()) {
            this.form.controls.usuarioId.addValidators([Validators.required, Validators.min(1)]);
            this.form.controls.usuarioId.updateValueAndValidity();
        }
    }

    /**
     * Cria ou atualiza o agendamento quando o formulário está válido.
     * O modal só fecha quando o backend aceita a operação; qualquer recusa já foi reportada
     * pela loja e deixa o formulário intacto. Um envio inválido é bloqueado e apenas revela
     * o estado de validação dos campos.
     */
    submit(): void {
        this.submitted.set(true);

        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const { data, horario, usuarioId, servicoId, status } = this.form.getRawValue();
        const agendamento = this.agendamento;

        if (agendamento) {
            const request: AgendamentoUpdateDTO = {
                data: `${data}T${horario}`,
                servicoId: Number(servicoId),
            };

            // Só envia o status quando o gestor de fato o alterou: o backend recusa uma
            // atualização cujo status é igual ao atual.
            if (this.authStore.isGestor() && status !== null && status !== agendamento.status) {
                request.status = status;
            }

            this.store.update(agendamento.id, request).subscribe((atualizado) => {
                if (atualizado) {
                    this.close();
                }
            });

            return;
        }

        this.store
            .add({
                data,
                horario,
                usuarioId: this.authStore.isGestor() ? Number(usuarioId) : (this.authStore.usuarioAtual()?.id ?? 0),
                servicoId: Number(servicoId),
            })
            .subscribe((criado) => {
                if (criado) {
                    this.close();
                }
            });
    }

    /**
     * Fecha o modal sem gravar nada.
     */
    close(): void {
        this.modalRef.close();
    }

    /**
     * Informa se um campo deve exibir o estado de erro.
     *
     * @param nome - Nome do campo no formulário.
     * @returns `true` quando o campo é inválido e já foi tocado ou enviado.
     */
    isInvalid(nome: string): boolean {
        const campo = this.form.get(nome);

        return !!campo?.invalid && (campo.touched || this.submitted());
    }

    /**
     * Calcula a data local deslocada do dia atual, no formato aceito pelo `<input type="date">`.
     *
     * @param dias - Quantidade de dias a somar ao dia atual.
     * @returns A data no formato `yyyy-MM-dd`, no fuso local.
     */
    private computeDataIso(dias: number): string {
        const data = new Date();
        data.setDate(data.getDate() + dias);

        return Formats.DATE_ISO.format(data);
    }
}
