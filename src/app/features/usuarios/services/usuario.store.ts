/*
    Diretório somente leitura dos usuários, recarregado a cada sessão.
*/

import { effect, Injectable, inject, signal, untracked } from "@angular/core";
import { AuthStore } from "../../auth/services/auth.store";
import type { UsuarioResponseDTO } from "../models/usuario-response.dto";
import { UsuarioService } from "./usuario.service";

@Injectable({
    providedIn: "root",
})
export class UsuarioStore {
    /** Serviço HTTP de usuários. */
    private readonly service = inject(UsuarioService);

    /**
     * Sessão do usuário, cuja abertura recarrega a lista e cujo encerramento a esvazia.
     * {@link AuthStore}
     */
    private readonly authStore = inject(AuthStore);

    /** Lista interna de usuários, substituída por inteiro a cada alteração. */
    private readonly usuariosState = signal<UsuarioResponseDTO[]>([]);

    /** Lista somente leitura dos usuários atuais. */
    readonly usuarios = this.usuariosState.asReadonly();

    constructor() {
        // Cada sessão recarrega a lista, e o logout a esvazia para o próximo usuário.
        effect(() => {
            if (this.authStore.token()) {
                untracked(() => this.load());
            } else {
                this.usuariosState.set([]);
            }
        });
    }

    /**
     * Recarrega a lista a partir da API. Uma falha, como o `403` de um `CLIENTE`, mantém a lista atual.
     */
    load(): void {
        this.service.findAll().subscribe({
            next: (usuarios) => this.usuariosState.set(usuarios),
            error: () => {},
        });
    }
}
