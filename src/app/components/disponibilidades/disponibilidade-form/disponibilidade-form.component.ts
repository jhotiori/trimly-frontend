import { Component, inject, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { MdbFormsModule } from "mdb-angular-ui-kit/forms";
import { MdbModalRef } from "mdb-angular-ui-kit/modal";

import { DiaSemana } from "../../../models/disponibilidade/dia-semana.enum";
import { DisponibilidadeStore } from "../../../services/disponibilidade/disponibilidade.store";

/**
 * Formulário de disponibilidade exibido dentro de um modal do MDB.
 *
 * Cria a janela de atendimento de um dia da semana. O modal só fecha quando o backend
 * aceita, então uma recusa mantém o formulário como está.
 */
@Component({
    selector: "app-disponibilidade-form",
    imports: [MdbFormsModule, ReactiveFormsModule],
    templateUrl: "./disponibilidade-form.component.html",
    styleUrl: "./disponibilidade-form.component.scss",
})
export class DisponibilidadeFormComponent {
    /**
     * Construtor de formulários reativos.
     * @see {@link FormBuilder}
     */
    private readonly builder = inject(FormBuilder);

    /**
     * Loja reativa das disponibilidades, usada para criar o registro.
     * @see {@link DisponibilidadeStore}
     */
    private readonly store = inject(DisponibilidadeStore);

    /**
     * Referência do modal que hospeda o formulário.
     * @see {@link MdbModalRef}
     */
    private readonly modalRef = inject(MdbModalRef<DisponibilidadeFormComponent>);

    /** Dias da semana que podem receber uma disponibilidade. */
    readonly diasDisponiveis = Object.values(DiaSemana);

    /** Indica que houve uma tentativa de envio, liberando as mensagens de erro. */
    readonly submitted = signal(false);

    /** Campos da disponibilidade. */
    readonly form = this.builder.nonNullable.group({
        diaSemana: [null as DiaSemana | null, [Validators.required]],
        horaInicio: ["", [Validators.required]],
        horaFim: ["", [Validators.required]],
    });

    /**
     * Cria a disponibilidade quando o formulário está válido.
     *
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

        if (!diaSemana) {
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
