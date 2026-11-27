/*
    Estado reativo dos feriados nacionais do ano, recarregado a cada sessão.
*/

import { effect, Injectable, inject, signal, untracked } from "@angular/core";
import { AuthStore } from "../../auth/services/auth.store";
import type { FeriadoResponseDTO } from "../models/feriado-response.dto";
import { FeriadoService } from "./feriado.service";

@Injectable({
    providedIn: "root",
})
export class FeriadoStore {
    /** Serviço HTTP de feriados. */
    private readonly service = inject(FeriadoService);

    /**
     * Sessão do usuário, cuja abertura recarrega a lista e cujo encerramento a esvazia.
     * {@link AuthStore}
     */
    private readonly authStore = inject(AuthStore);

    /** Lista interna de feriados, substituída por inteiro a cada carga. */
    private readonly feriadosState = signal<FeriadoResponseDTO[]>([]);

    /** Lista somente leitura dos feriados do ano. */
    readonly feriados = this.feriadosState.asReadonly();

    constructor() {
        // Cada sessão recarrega a lista, e o logout a esvazia para o próximo usuário.
        effect(() => {
            if (this.authStore.token()) {
                untracked(() => this.load());
            } else {
                this.feriadosState.set([]);
            }
        });
    }

    /**
     * Recarrega a lista a partir da API. Uma falha, como a BrasilAPI fora do ar, mantém a lista atual.
     */
    load(): void {
        this.service.findAll().subscribe({
            next: (feriados) => this.feriadosState.set(feriados),
            error: () => {},
        });
    }
}
