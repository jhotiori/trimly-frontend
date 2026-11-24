---
paths:
  - "src/app/features/**/services/**"
  - "src/app/features/**/models/**"
  - "src/app/features/**/components/**"
  - "src/app/infra/services/**"
  - "src/app/infra/pipes/**"
---

# Client state

## Stores: `*.store.ts`

Client-side state lives in `app/features/<domain>/services/<domain>.store.ts`, beside the HTTP
`<domain>.service.ts` and never replacing it. A store is
`@Injectable({ providedIn: "root" })`, holds a private `signal<T[]>` and exposes it as
`asReadonly()`. State is signals only: no RxJS subject, no `localStorage`; the only RxJS is
the `HttpClient` observables, piped with `map`/`tap`/`catchError`.

Stores are HTTP-backed and every mutation delegates to the service. `load()` issues one `findAll().subscribe`
(silent on error, so a `403` for a `CLIENTE` just leaves the list as it is). A constructor `effect` on
`AuthStore.token()` calls `load()` on login and empties the list on logout, so a new session never sees the previous
user's data. Each `<domain>-screen` and the dashboard also call `load()` in `ngOnInit`, so every page change hits the
backend and an expired token triggers the `401` redirect. The signal changes **only
after** the response arrives - no optimistic writes, so a rejection leaves the list untouched. The mutation
signatures are observables the caller subscribes to:

- `add(createDto): Observable<T | null>` - appends the server response, or alerts and emits
  `null`.
- `update(id, updateDto): Observable<T | null>` - immutable replace, or alerts and emits
  `null`.
- `remove(id): Observable<boolean>` - drops the entry and emits `true`, or alerts and emits
  `false`.

Every rejection is surfaced once by the store itself through
`alertService.error(extractErrorMessage(err, "<fallback PT-BR>"))`; callers only branch on
the emitted value (a modal closes only on a non-null emission). `UsuarioStore` is a read-only directory (no
mutations); sign-in and sign-up live in `AuthStore`, see [auth](auth.md).

`AlertService` (`app/infra/services/alert.service.ts`) is the single dialog surface: exactly
`confirm(titulo, texto): Promise<boolean>` and `error(mensagem): void`, both through one
token-bound `Swal.mixin`, plus the exported pure `extractErrorMessage(err, fallback)`. No
other file imports `sweetalert2`. Its theming lives in the global `styles.scss` (the
`.app-alert*` classes) because SweetAlert2 renders to `document.body`, outside view
encapsulation - the same reason the MDB modal theme lives there.

## Payloads and views

A PATCH that would set a field to its current value is rejected by the backend (`*StatusRepetidoException` on both
`agendamento` and `servico` when `status` equals the current one), so forms omit an unchanged `status` from the
update payload rather than sending it.

Display-only shapes that widen a DTO (a resolved join, for example) are co-located in the
store file as a type composing the real DTO (`AgendamentoView = AgendamentoResponseDTO &
{ ... }`), exposed through a `computed` signal. Never edit `models/**` for a view concern.

Enum members are never interpolated raw: templates format them through `EnumLabelPipe`
(`{{ status | enumLabel }}`, at `app/infra/pipes/`), so `AGENDADO` reads "Agendado" while
the enum keeps its wire value. It is the only place that casing logic lives.
