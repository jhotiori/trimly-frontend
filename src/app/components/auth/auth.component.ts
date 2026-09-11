import { Component, signal } from "@angular/core";

import { LoginFormComponent } from "./login-form/login-form.component";
import { RegistrarFormComponent } from "./registrar-form/registrar-form.component";

/**
 * Modo exibido pela casca de autenticação.
 */
export type AuthMode = "login" | "registrar";

/**
 * Casca da autenticação: um cartão centralizado que alterna entre o formulário de login e
 * o de registro.
 *
 * O modo vive em um signal local e só troca o título, o formulário e a linha de alternância.
 */
@Component({
    selector: "app-auth",
    imports: [LoginFormComponent, RegistrarFormComponent],
    templateUrl: "./auth.component.html",
    styleUrl: "./auth.component.scss",
})
export class AuthComponent {
    /** Modo atual do cartão, iniciando pelo login. */
    readonly mode = signal<AuthMode>("login");

    /**
     * Alterna entre o login e o registro.
     */
    toggle(): void {
        this.mode.update((mode) => (mode === "login" ? "registrar" : "login"));
    }
}
