import { Component, inject } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { MdbFormsModule } from "mdb-angular-ui-kit/forms";

import { RoutePaths } from "../../../../core/config/route-paths.config";
import { AuthStore } from "../../services/auth.store";

/**
 * Formulário de registro: cria o usuário na API, que já o autentica, e entra no painel.
 *
 * Uma recusa do backend não acrescenta erro local: a mensagem já foi mostrada pelo
 * diretório de usuários e a ausência de navegação basta como sinal.
 */
@Component({
    selector: "app-registrar-form",
    imports: [MdbFormsModule, ReactiveFormsModule],
    templateUrl: "./registrar-form.component.html",
    styleUrl: "./registrar-form.component.scss",
})
export class RegistrarFormComponent {
    /** Construtor de formulários reativos. */
    private readonly builder = inject(FormBuilder);

    /** Sessão do cliente. */
    private readonly authStore = inject(AuthStore);

    /** Roteador usado para entrar no painel. */
    private readonly router = inject(Router);

    /** Dados do usuário a ser criado. */
    readonly form = this.builder.nonNullable.group({
        nome: ["", [Validators.required]],
        email: ["", [Validators.required, Validators.email]],
        senha: ["", [Validators.required, Validators.minLength(6)]],
    });

    /**
     * Cria o usuário, que entra autenticado, e navega para o painel.
     *
     * Um envio inválido é bloqueado e apenas revela o estado de validação dos campos.
     */
    submit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const { nome, email, senha } = this.form.getRawValue();

        this.authStore.register({ nome, email, senha }).subscribe((usuario) => {
            if (usuario) {
                this.router.navigate([RoutePaths.DASHBOARD_VIEW_ROUTE]);
            }
        });
    }

    /**
     * Informa se um campo deve exibir o estado de erro.
     *
     * @param nome - Nome do campo no formulário.
     * @returns `true` quando o campo é inválido e já foi tocado.
     */
    isInvalid(nome: string): boolean {
        const campo = this.form.get(nome);

        return !!campo?.invalid && campo.touched;
    }
}
