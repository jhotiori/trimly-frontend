/*
    Ponto de entrada do navegador: inicializa o componente raiz com a configuração da aplicação.
*/

import { bootstrapApplication } from "@angular/platform-browser";
import { AppComponent } from "./app/app.component";
import { appConfig } from "./app/app.config";

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
