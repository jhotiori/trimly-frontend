---
paths:
  - "src/app/features/auth/**"
  - "src/app/features/usuarios/**"
  - "src/app/infra/interceptors/**"
  - "src/app/infra/guards/**"
  - "src/app/app.config.ts"
  - "src/app/app.routes.ts"
---

# Authentication

The backend issues a JWT on `POST /api/auth/login` and `POST /api/auth/register` (always `CLIENTE`), both answering
`AuthResponseDTO` (`{ token, usuario }`). `UsuarioService.login|register` call them. The backend enforces every
role and ownership rule; frontend checks are experience only.

- `AuthStore` (`features/auth/services/`) holds `usuarioAtual` and `token` as signals, in memory only: reloading the
  page ends the session. `isAutenticado` and `isGestor` (`ADMIN` or `DONO`) derive from `usuarioAtual`.
- `login` emits `true`/`false` and shows no dialog: every failure becomes `false` and the login form shows its own
  message. `register` alerts the backend message through `AlertService` and emits `null`.
- `authInterceptor` (`infra/interceptors/`, registered with `provideHttpClient(withInterceptors([...]))`) adds
  `Authorization: Bearer <token>` only to requests under `BASE_URL` (`infra/config/endpoints.config.ts`). A `401` while
  a token is held, outside `/api/auth/login` and `/api/auth/register`, clears the session, navigates to `/login` and
  completes without rethrowing, so no store alert covers the login form. Every `<domain>-form` closes its MDB modal
  through an `effect` once `isAutenticado` turns `false`.
- `authGuard` protects `/dashboard`; there is no per-cargo route guard (gestor-only UI is gated by
  `authStore.isGestor()` in components).
