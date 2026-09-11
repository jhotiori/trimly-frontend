import type { HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import Swal from "sweetalert2";

import type { ErrorResponseDTO } from "../models/exception/error-response.dto";

/**
 * Instância do SweetAlert2 pré-configurada com os tokens do sistema de design.
 *
 * As cores vêm das variáveis CSS globais e as classes `app-alert*` recebem o restante do
 * tema em `styles.scss`, já que o SweetAlert2 renderiza fora do encapsulamento do Angular.
 */
const swalTema = Swal.mixin({
    background: "var(--bg-surface)",
    color: "var(--text-primary)",
    confirmButtonColor: "var(--accent-hover)",
    cancelButtonColor: "var(--danger-hover)",
    customClass: {
        popup: "app-alert",
        title: "app-alert__titulo",
        confirmButton: "app-alert__botao",
        cancelButton: "app-alert__botao",
    },
});

/**
 * Extrai a mensagem de erro devolvida pelo backend.
 *
 * @param err - Resposta de erro do `HttpClient`.
 * @param fallback - Texto usado quando a resposta não traz mensagem.
 * @returns A mensagem do backend, ou o fallback.
 */
export function extractErrorMessage(err: HttpErrorResponse, fallback: string): string {
    return (err.error as ErrorResponseDTO | null)?.message ?? fallback;
}

/**
 * Superfície única de diálogos da aplicação.
 *
 * Expõe apenas uma confirmação e um erro, ambos pelo tema compartilhado. Nenhum outro
 * componente ou store deve importar o SweetAlert2 diretamente.
 */
@Injectable({
    providedIn: "root",
})
export class AlertService {
    /**
     * Pede confirmação ao usuário antes de uma ação.
     *
     * @param titulo - Título do diálogo.
     * @param texto - Texto explicando a ação a confirmar.
     * @returns `true` apenas quando o usuário confirma.
     * @example
     * ```ts
     * const confirmado = await alertService.confirm("Cancelar agendamento", "Você tem certeza?");
     * ```
     */
    async confirm(titulo: string, texto: string): Promise<boolean> {
        const resultado = await swalTema.fire({
            title: titulo,
            text: texto,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Confirmar",
            cancelButtonText: "Voltar",
        });

        return resultado.isConfirmed;
    }

    /**
     * Mostra um diálogo de erro com uma única ação de dispensa.
     *
     * @param mensagem - Mensagem exibida ao usuário.
     */
    error(mensagem: string): void {
        swalTema.fire({
            title: "Erro",
            text: mensagem,
            icon: "error",
            confirmButtonText: "Entendi",
        });
    }
}
