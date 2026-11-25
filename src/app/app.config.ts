/*
    Providers globais da aplicação: roteador, cliente HTTP com o interceptor de autenticação e animações.
*/

import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { type ApplicationConfig, inject, provideAppInitializer, provideZoneChangeDetection } from "@angular/core";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { provideRouter } from "@angular/router";

import { routes } from "./app.routes";
import { authInterceptor } from "./infra/interceptors/auth.interceptor";
import { ThemeService } from "./infra/services/theme.service";

export const appConfig: ApplicationConfig = {
    providers: [
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(routes),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideAnimationsAsync(),
        /*
            Instancia o tema no boot. Sem isto ele só seria aplicado ao montar a barra lateral,
            e a tela de login, que não a renderiza, abriria sempre no tema escuro.
        */
        provideAppInitializer(() => {
            inject(ThemeService);
        }),
    ],
};
