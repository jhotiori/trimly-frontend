import { Pipe, type PipeTransform } from "@angular/core";

/**
 * Exibe um membro de enum em UPPER_SNAKE_CASE como texto legível.
 *
 * Só a apresentação muda: o valor do enum segue intacto no modelo e na API.
 *
 * @example
 * ```ts
 * new EnumLabelPipe().transform("EM_ANDAMENTO"); // "Em andamento"
 * ```
 */
@Pipe({
    name: "enumLabel",
})
export class EnumLabelPipe implements PipeTransform {
    /**
     * Troca os sublinhados por espaços e deixa só a primeira letra maiúscula.
     *
     * @param valor - Membro do enum, como `AGENDADO`.
     * @returns O texto legível, como `Agendado`.
     */
    transform(valor: string): string {
        const texto = valor.replaceAll("_", " ").toLowerCase();

        return texto.charAt(0).toUpperCase() + texto.slice(1);
    }
}
