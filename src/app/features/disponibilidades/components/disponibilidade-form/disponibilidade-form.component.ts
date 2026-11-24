/*
    Formulário modal que cria ou edita uma disponibilidade: dia da semana e janela de atendimento.
*/

import { Component, effect, inject, type OnInit, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { MdbFormsModule } from "mdb-angular-ui-kit/forms";
import { MdbModalRef } from "mdb-angular-ui-kit/modal";

import { EnumLabelPipe } from "../../../../infra/pipes/enum-label.pipe";
import { toHHmm } from "../../../../infra/utils/time.util";
import { AuthStore } from "../../../auth/services/auth.store";
import { DisponibilidadeDiaSemana } from "../../models/disponibilidade-dia-semana.enum";
import type { DisponibilidadeResponseDTO } from "../../models/disponibilidade-response.dto";
import { DisponibilidadeStore } from "../../services/disponibilidade.store";

@Component({
    selector: "app-disponibilidade-form",
    imports: [MdbFormsModule, ReactiveFormsModule, EnumLabelPipe],
    templateUrl: "./disponibilidade-form.component.html",
    styleUrl: "./disponibilidade-form.component.scss",
})
export class DisponibilidadeFormComponent implements OnInit {
    /**
     * Construtor de formulários reativos.
     * {@link FormBuilder}
     */
    private readonly builder = inject(FormBuilder);

    /**
     * Loja reativa das disponibilidades, usada para criar e atualizar o registro.
     * {@link DisponibilidadeStore}
     */
    private readonly store = inject(DisponibilidadeStore);

    /**
     * Referência do modal que hospeda o formulário.
     * {@link MdbModalRef}
     */
    private readonly modalRef = inject(MdbModalRef<DisponibilidadeFormComponent>);

    /**
     * Sessão do usuário, cujo encerramento fecha o modal.
     * {@link AuthStore}
     */
    private readonly authStore = inject(AuthStore);

    /** Disponibilidade em edição, atribuída pelo `data` do modal. Ausente na criação. */
    disponibilidade?: DisponibilidadeResponseDTO;

    /** Dias da semana que podem receber uma disponibilidade. */
    readonly diasDisponiveis = Object.values(DisponibilidadeDiaSemana);

    /** Indica que houve uma tentativa de envio, liberando as mensagens de erro. */
    readonly submitted = signal(false);

    /** Campos da disponibilidade. */
    readonly form = this.builder.nonNullable.group({
        diaSemana: [null as DisponibilidadeDiaSemana | null, [Validators.required]],
        horaInicio: ["", [Validators.required]],
        horaFim: ["", [Validators.required]],
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
     * Indica se o formulário está editando uma disponibilidade existente.
     *
     * @returns `true` quando uma disponibilidade foi recebida pelo `data` do modal.
     */
    get isEditing(): boolean {
        return this.disponibilidade !== undefined;
    }

    /**
     * Preenche o formulário quando uma disponibilidade é recebida para edição.
     * Os horários chegam da API com os segundos, recortados aqui para o formato `HH:mm` que
     * os campos de hora aceitam.
     */
    ngOnInit(): void {
        const disponibilidade = this.disponibilidade;

        if (!disponibilidade) {
            return;
        }

        this.form.patchValue({
            diaSemana: disponibilidade.diaSemana,
            horaInicio: toHHmm(disponibilidade.horaInicio),
            horaFim: toHHmm(disponibilidade.horaFim),
        });
    }

    /**
     * Cria ou atualiza a disponibilidade quando o formulário está válido.
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

        const { diaSemana, horaInicio, horaFim } = this.form.getRawValue();
        const disponibilidade = this.disponibilidade;

        if (!diaSemana) {
            return;
        }

        if (disponibilidade) {
            this.store.update(disponibilidade.id, { diaSemana, horaInicio, horaFim }).subscribe((atualizada) => {
                if (atualizada) {
                    this.close();
                }
            });

            return;
        }

        this.store.add({ diaSemana, horaInicio, horaFim }).subscribe((criada) => {
            if (criada) {
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
}
