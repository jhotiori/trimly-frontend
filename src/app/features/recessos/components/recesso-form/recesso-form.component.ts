/*
    Formulário modal que cria ou edita um recesso: descrição e período.
*/

import { Component, effect, inject, type OnInit, signal } from "@angular/core";
import {
    type AbstractControl,
    FormBuilder,
    ReactiveFormsModule,
    type ValidationErrors,
    Validators,
} from "@angular/forms";
import { MdbFormsModule } from "mdb-angular-ui-kit/forms";
import { MdbModalRef } from "mdb-angular-ui-kit/modal";

import { BusinessRules } from "../../../../infra/config/business-rules.config";
import { todayIso } from "../../../../infra/utils/date.util";
import { AuthStore } from "../../../auth/services/auth.store";
import type { RecessoResponseDTO } from "../../models/recesso-response.dto";
import type { RecessoUpdateDTO } from "../../models/recesso-update.dto";
import { RecessoStore } from "../../services/recesso.store";

/**
 * Recusa uma data anterior a hoje.
 *
 * @param control - Campo de data no formato `yyyy-MM-dd`.
 * @returns O erro `passado` quando a data já passou, ou `null`.
 */
function notPast(control: AbstractControl<string>): ValidationErrors | null {
    return control.value && control.value < todayIso() ? { passado: true } : null;
}

/**
 * Recusa um período cuja data de fim vem antes da de início.
 *
 * @param group - Grupo com `dataInicio` e `dataFim`.
 * @returns O erro `periodo` quando o fim antecede o início, ou `null`.
 */
function validPeriod(group: AbstractControl): ValidationErrors | null {
    const { dataInicio, dataFim } = group.value as { dataInicio: string; dataFim: string };

    return dataInicio && dataFim && dataFim < dataInicio ? { periodo: true } : null;
}

@Component({
    selector: "app-recesso-form",
    imports: [MdbFormsModule, ReactiveFormsModule],
    templateUrl: "./recesso-form.component.html",
    styleUrl: "./recesso-form.component.scss",
})
export class RecessoFormComponent implements OnInit {
    /**
     * Construtor de formulários reativos.
     * {@link FormBuilder}
     */
    private readonly builder = inject(FormBuilder);

    /**
     * Loja reativa dos recessos, usada para criar e atualizar o registro.
     * {@link RecessoStore}
     */
    private readonly store = inject(RecessoStore);

    /**
     * Referência do modal que hospeda o formulário.
     * {@link MdbModalRef}
     */
    private readonly modalRef = inject(MdbModalRef<RecessoFormComponent>);

    /**
     * Sessão do usuário, cujo encerramento fecha o modal.
     * {@link AuthStore}
     */
    private readonly authStore = inject(AuthStore);

    /** Recesso em edição, atribuído pelo `data` do modal. Ausente na criação. */
    recesso?: RecessoResponseDTO;

    /** Tamanho máximo da descrição, exibido no campo. */
    readonly descricaoMaxLength = BusinessRules.RECESSO_DESCRICAO_MAX_LENGTH;

    /** Menor data aceita pelos campos de data: hoje, no formato `yyyy-MM-dd`. */
    readonly dataMinima = todayIso();

    /** Indica que houve uma tentativa de envio, liberando as mensagens de erro. */
    readonly submitted = signal(false);

    /** Campos do recesso. */
    readonly form = this.builder.nonNullable.group(
        {
            descricao: ["", [Validators.required, Validators.maxLength(BusinessRules.RECESSO_DESCRICAO_MAX_LENGTH)]],
            dataInicio: ["", [Validators.required]],
            dataFim: ["", [Validators.required]],
        },
        { validators: validPeriod },
    );

    constructor() {
        // A sessão encerrada (logout ou `401`) fecha o modal, liberando a tela de login.
        effect(() => {
            if (!this.authStore.isAutenticado()) {
                this.modalRef.close();
            }
        });
    }

    /**
     * Indica se o formulário está editando um recesso existente.
     *
     * @returns `true` quando um recesso foi recebido pelo `data` do modal.
     */
    get isEditing(): boolean {
        return this.recesso !== undefined;
    }

    /**
     * Prepara o formulário conforme o modo.
     * Na criação, nenhuma data pode ser passada; na edição, só o backend confere as datas
     * alteradas, porque um recesso em andamento mantém o início que já passou.
     */
    ngOnInit(): void {
        const recesso = this.recesso;

        if (!recesso) {
            this.form.controls.dataInicio.addValidators(notPast);
            this.form.controls.dataFim.addValidators(notPast);
            return;
        }

        this.form.patchValue({
            descricao: recesso.descricao,
            dataInicio: recesso.dataInicio,
            dataFim: recesso.dataFim,
        });
    }

    /**
     * Cria ou atualiza o recesso quando o formulário está válido.
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

        const request = this.form.getRawValue();
        const recesso = this.recesso;

        if (recesso) {
            this.store.update(recesso.id, this.changedFields(recesso)).subscribe((atualizado) => {
                if (atualizado) {
                    this.close();
                }
            });

            return;
        }

        this.store.add(request).subscribe((criado) => {
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
     * Informa se o período está invertido, com o fim antes do início.
     *
     * @returns `true` quando o formulário tem o erro `periodo`.
     */
    get isPeriodoInvalido(): boolean {
        return this.form.hasError("periodo");
    }

    /**
     * Seleciona só os campos que mudaram em relação ao recesso em edição.
     *
     * @param recesso - Recesso em edição.
     * @returns O payload do PATCH, sem os campos inalterados.
     */
    private changedFields(recesso: RecessoResponseDTO): RecessoUpdateDTO {
        const { descricao, dataInicio, dataFim } = this.form.getRawValue();

        return {
            ...(descricao !== recesso.descricao && { descricao }),
            ...(dataInicio !== recesso.dataInicio && { dataInicio }),
            ...(dataFim !== recesso.dataFim && { dataFim }),
        };
    }
}
