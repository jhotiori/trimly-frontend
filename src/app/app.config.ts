import { provideHttpClient } from "@angular/common/http";
import { type ApplicationConfig, inject, provideAppInitializer, provideZoneChangeDetection } from "@angular/core";
import { provideAnimations } from "@angular/platform-browser/animations";
import { provideRouter } from "@angular/router";

import { routes } from "./app.routes";
import { ThemeService } from "./core/services/theme.service";

export const appConfig: ApplicationConfig = {
    providers: [
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(routes),
        provideHttpClient(),
        provideAnimations(),
        /*
            Instancia o tema no boot. Sem isto ele só seria aplicado ao montar a barra lateral,
            e a tela de login, que não a renderiza, abriria sempre no tema escuro.
        */
        provideAppInitializer(() => {
            inject(ThemeService);
        }),
    ],
};
