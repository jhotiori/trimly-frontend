/*
    Componente raiz: só hospeda o `router-outlet` de onde todas as telas são carregadas.
*/

import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";

@Component({
    selector: "app-root",
    imports: [RouterOutlet],
    templateUrl: "./app.component.html",
})
export class AppComponent {}
