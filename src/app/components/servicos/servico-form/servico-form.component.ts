import { Component, inject, type OnInit, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { MdbFormsModule } from "mdb-angular-ui-kit/forms";
import { MdbModalRef } from "mdb-angular-ui-kit/modal";

import type { ServicoResponseDTO } from "../../../models/servico/servico-response.dto";
import { ServicoStatus } from "../../../models/servico/servico-status.enum";
import { ServicoStore } from "../../../services/servico/servico.store";

/**
 * Formulário de serviço exibido dentro de um modal do MDB.
 *
 * Serve à criação e à edição: sem um serviço recebido cria um novo registro, com um serviço
 * recebido preenche os campos, libera o status e atualiza aquele id. O modal só fecha
 * quando o backend aceita, então uma recusa mantém o formulário como está.
 */
@Component({
    selector: "app-servico-form",
    imports: [MdbFormsModule, ReactiveFormsModule],
    templateUrl: "./servico-form.component.html",
    styleUrl: "./servico-form.component.scss",
})
export class ServicoFormComponent implements OnInit {
    /**
     * Construtor de formulários reativos.
     * @see {@link FormBuilder}
     */
    private readonly builder = inject(FormBuilder);

    /**
     * Loja reativa dos serviços, usada para criar e atualizar o registro.
     * @see {@link ServicoStore}
     */
    private readonly store = inject(ServicoStore);

    /**
     * Referência do modal que hospeda o formulário.
     * @see {@link MdbModalRef}
     */
    private readonly modalRef = inject(MdbModalRef<ServicoFormComponent>);

    /** Serviço em edição, atribuído pelo `data` do modal. Ausente na criação. */
    servico?: ServicoResponseDTO;

    /** Status que podem ser atribuídos na edição. */
    readonly statusDisponiveis = Object.values(ServicoStatus);

    /** Indica que houve uma tentativa de envio, liberando as mensagens de erro. */
    readonly submitted = signal(false);

    /** Campos do serviço. */
    readonly form = this.builder.nonNullable.group({
        nome: ["", [Validators.required, Validators.minLength(3)]],
        valor: [null as number | null, [Validators.required, Validators.min(1)]],
        duracao: [null as number | null, [Validators.required, Validators.min(1)]],
        status: [null as ServicoStatus | null],
    });

    /** Indica se o formulário está editando um serviço existente. */
    get edicao(): boolean {
        return this.servico !== undefined;
    }

    /**
     * Preenche o formulário quando um serviço é recebido para edição.
     */
    ngOnInit(): void {
        const servico = this.servico;

        if (!servico) {
            return;
        }

        this.form.patchValue({
            nome: servico.nome,
            valor: servico.valor,
            duracao: servico.duracao,
            status: servico.status,
        });
    }

    /**
     * Cria ou atualiza o serviço quando o formulário está válido.
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

        const { nome, valor, duracao, status } = this.form.getRawValue();
        const servico = this.servico;

        if (servico) {
            this.store
                .update(servico.id, {
                    nome,
                    valor: Number(valor),
                    duracao: Number(duracao),
                    ...(status !== null && status !== servico.status ? { status } : {}),
                })
                .subscribe((atualizado) => {
                    if (atualizado) {
                        this.close();
                    }
                });

            return;
        }

        this.store
            .add({
                nome,
                valor: Number(valor),
                duracao: Number(duracao),
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
}
