import { Component, inject } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { MdbFormsModule } from "mdb-angular-ui-kit/forms";

import { AlertService } from "../../../services/alert.service";
import { AuthStore } from "../../../services/auth/auth.store";

/**
 * Formulário de acesso: confere as credenciais contra a API e entra no painel.
 */
@Component({
    selector: "app-login-form",
    imports: [MdbFormsModule, ReactiveFormsModule],
    templateUrl: "./login-form.component.html",
    styleUrl: "./login-form.component.scss",
})
export class LoginFormComponent {
    /** Construtor de formulários reativos. */
    private readonly builder = inject(FormBuilder);

    /** Sessão do cliente. */
    private readonly authStore = inject(AuthStore);

    /** Roteador usado para entrar no painel. */
    private readonly router = inject(Router);

    /** Superfície de diálogos usada para reportar a recusa das credenciais. */
    private readonly alertService = inject(AlertService);

    /** Credenciais de acesso. */
    readonly form = this.builder.nonNullable.group({
        email: ["", [Validators.required, Validators.email]],
        senha: ["", [Validators.required]],
    });

    /**
     * Autentica o visitante e navega para o painel quando as credenciais conferem.
     *
     * Um envio inválido é bloqueado e apenas revela o estado de validação dos campos.
     */
    submit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const { email, senha } = this.form.getRawValue();

        this.authStore.login(email, senha).subscribe((autenticado) => {
            if (!autenticado) {
                this.alertService.error("E-mail ou senha inválidos.");
                return;
            }

            this.router.navigate(["/dashboard/view"]);
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
