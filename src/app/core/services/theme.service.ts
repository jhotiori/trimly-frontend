import { Injectable, signal } from "@angular/core";

/** Chave do `localStorage` que guarda o tema escolhido. */
const CHAVE_TEMA = "trimly-theme";

/** Atributo aplicado em `<html>` enquanto o tema claro está ativo. */
const ATRIBUTO_TEMA = "data-theme";

/** Temas disponíveis. O escuro é o padrão e não marca o documento. */
export type Tema = "dark" | "light";

/** Cor da barra do navegador em cada tema, espelhando o `--bg-base` correspondente. */
const COR_BARRA: Record<Tema, string> = {
    dark: "#000000",
    light: "#ffffff",
};

/**
 * Dono único do tema da aplicação: estado, persistência e o atributo aplicado em `<html>`.
 *
 * O tema escuro é o padrão e não escreve nada no documento; o claro marca
 * `data-theme="light"`, o escopo em que `styles.scss` redeclara os tokens de base.
 */
@Injectable({
    providedIn: "root",
})
export class ThemeService {
    /** Tema em vigor, restaurado do `localStorage`. */
    private readonly temaAtual = signal<Tema>(getStoredTheme());

    /** Tema em vigor, somente leitura, consumido pelos templates. */
    readonly theme = this.temaAtual.asReadonly();

    constructor() {
        /* Aplica o tema persistido antes da primeira renderização, para o reload já nascer certo */
        applyTheme(this.temaAtual());
    }

    /**
     * Alterna entre o tema escuro e o claro, persistindo a escolha.
     */
    toggle(): void {
        const tema: Tema = this.temaAtual() === "dark" ? "light" : "dark";

        this.temaAtual.set(tema);
        localStorage.setItem(CHAVE_TEMA, tema);
        applyTheme(tema);
    }
}

/**
 * Lê o tema persistido.
 *
 * @returns O tema guardado, ou `"dark"` quando ausente ou inválido.
 */
function getStoredTheme(): Tema {
    return localStorage.getItem(CHAVE_TEMA) === "light" ? "light" : "dark";
}

/**
 * Aplica o tema ao documento.
 *
 * @param tema - Tema a aplicar.
 */
function applyTheme(tema: Tema): void {
    if (tema === "light") {
        document.documentElement.setAttribute(ATRIBUTO_TEMA, "light");
    } else {
        document.documentElement.removeAttribute(ATRIBUTO_TEMA);
    }

    /* A barra do navegador no mobile não lê tokens: só esta meta a acompanha */
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", COR_BARRA[tema]);
}
