---
name: disponibilidade-edit-delete-gestor
author: jhotiori
date: 2026-09-20
---

# TASK
Gestores (`DONO`/`ADMIN`) cannot edit a disponibilidade from the frontend today; deletion
already exists but needs re-verification against the same gating rule. Extend
`DisponibilidadeFormComponent` to a dual-mode (create/edit) modal, mirroring
`ServicoFormComponent`'s already-established pattern, and wire an edit action into
`DisponibilidadeItemComponent`, gated by `authStore.isGestor()`. This spec is
planning-only: no `src/` files are modified while authoring it. All Open Questions below
are now resolved (2026-09-20); implementation is deliberately held for a separate,
later pass — do not execute this spec yet.

# GOAL
A gestor can edit a disponibilidade's dia da semana / horário from the same card that
already offers delete, through the existing `disponibilidade-form` modal extended to
support both create and edit, with no change to the create flow or to any other role's
view.

# PLAN
`DisponibilidadeStore.update()` / `DisponibilidadeService.update()` already exist and are
unused by any component — no store/service change needed. Extend
`DisponibilidadeFormComponent` to accept an optional `disponibilidade` (assigned through
the modal's `data`, same mechanism `ServicoFormComponent` uses), patch the form in
`ngOnInit`, and branch `submit()` between `store.add()` and `store.update()`. Add an
`edit()` method + button to `DisponibilidadeItemComponent`, gated by the same
`authStore.isGestor()` check the delete button already uses. Re-verify the existing
delete path unchanged. Flag the cross-repo backend-validation question and the
form-component duplication (`isEditing`/`close()`/`isInvalid()`/`OnInit` repeated
verbatim across `agendamento-form`, `servico-form`, and now `disponibilidade-form`) as
Open Questions rather than acting on them here.

# SPECS

## SPEC-001 - Dual-mode disponibilidade-form (create + edit)

### Goal
- `DisponibilidadeFormComponent` creates a disponibilidade when opened without data, and
  updates the one it receives when opened with `data: { disponibilidade }` — same contract
  `servico-item.component.ts:67-72` uses for `ServicoFormComponent`.

### Problem
- SITUATION: `disponibilidade-form.component.ts:22-100` only ever calls
  `store.add()`; it has no field to receive an existing disponibilidade, no `OnInit`
  patch, and its template (`disponibilidade-form.component.html:2,58-60`) hardcodes the
  create-only title "Nova Disponibilidade" and button "Cadastrar".
- IMPACT: a gestor has no way to change a disponibilidade's dia/horário once created;
  the only correction path is delete + recreate, losing the original id.

### Plan
- `disponibilidade-form.component.ts`: add `import type { DisponibilidadeResponseDTO }
  from "../../models/disponibilidade-response.dto";`, `implements OnInit`, and a
  `disponibilidade?: DisponibilidadeResponseDTO;` field — mirrors
  `servico-form.component.ts:24,44`.
- Add `get isEditing(): boolean { return this.disponibilidade !== undefined; }` —
  mirrors `servico-form.component.ts:65-67`.
- Add `ngOnInit()` that `patchValue`s `diaSemana`/`horaInicio`/`horaFim` from
  `this.disponibilidade` when present — mirrors `servico-form.component.ts:72-85`.
- `submit()` (`disponibilidade-form.component.ts:61-80`): when `this.disponibilidade` is
  set, call `store.update(this.disponibilidade.id, { diaSemana, horaInicio, horaFim })`
  instead of `store.add()`; close only on non-null emission, same as today.
- `disponibilidade-form.component.html`: title (`:2`) and submit button label (`:58-60`)
  switch on `isEditing` — e.g. "Editar Disponibilidade"/"Salvar" vs. "Nova
  Disponibilidade"/"Cadastrar", matching `servico-form.component.html`'s equivalent
  bindings (read that file's exact binding shape before implementing, to match style).

### Acceptance
- MUST: opening the modal with no `data` behaves exactly as today (create, empty form,
  "Cadastrar").
- MUST: opening the modal with `data: { disponibilidade }` pre-fills all three fields and
  calls `update`, not `add`, on submit.
- MUST: only fields the update DTO already supports (`diaSemana`, `horaInicio`,
  `horaFim`) are sent — no new fields invented.
- MUST NOT: change `DisponibilidadeCreateDTO`, `DisponibilidadeUpdateDTO`, `DisponibilidadeStore`,
  or `DisponibilidadeService` — their `add`/`update` signatures already fit this use case.
- MUST NOT: alter the create flow's current behavior, wording default, or the sidebar's
  `openDisponibilidadeForm()` call (`sidebar.component.ts:63-65` stays create-only, no `data`).
- MUST NOT: break existing create-flow behavior for any role.

### Constraints
- DO: follow the `<domain>-form` TSDoc/structure convention exactly as
  `servico-form.component.ts` demonstrates it (PT-BR, `@example` only where useful).
- DO: keep the HTML change minimal — only the title/button-label bindings needed for
  `isEditing`; no other markup, spacing, or class changes.
- DO NOT: invent a partial-diff payload — Open Question 1 is resolved (no no-op/overlap
  validation on the backend), so `submit()` always sends all three fields
  (`diaSemana`, `horaInicio`, `horaFim`) on update, unlike `servico-form`'s
  status-omission special case.

### Tasks
- [ ] `disponibilidade-form.component.ts:1` — add `OnInit` to the `@angular/core` import
      and the `DisponibilidadeResponseDTO` type import.
- [ ] `disponibilidade-form.component.ts:22` — `export class DisponibilidadeFormComponent
      implements OnInit {`.
- [ ] `disponibilidade-form.component.ts` — add `disponibilidade?: DisponibilidadeResponseDTO;`
      field (placement mirrors `servico-form.component.ts:44`).
- [ ] `disponibilidade-form.component.ts` — add `isEditing` getter.
- [ ] `disponibilidade-form.component.ts` — add `ngOnInit()` patching the form from
      `this.disponibilidade` when set.
- [ ] `disponibilidade-form.component.ts:61-80` — branch `submit()` between `store.add()`
      (no `disponibilidade`) and `store.update(this.disponibilidade.id, ...)` (editing).
- [ ] `disponibilidade-form.component.html:2` — conditional modal title.
- [ ] `disponibilidade-form.component.html:58-60` — conditional submit button label.

## SPEC-002 - Edit action on disponibilidade-item

### Goal
- The disponibilidade card offers an edit button next to the existing delete button,
  visible only to `DONO`/`ADMIN`, opening the extended form pre-filled with that card's
  data.

### Problem
- SITUATION: `disponibilidade-item.component.ts` has no `MdbModalService` injection and
  no `edit()` method; `disponibilidade-item.component.html:8-16` renders only the delete
  button inside the `@if (authStore.isGestor())` block.
- IMPACT: even once SPEC-001 lands, nothing in the UI opens the form in edit mode for a
  specific disponibilidade.

### Plan
- `disponibilidade-item.component.ts`: add `MdbModalModule`/`MdbModalService` imports and
  injection, a `CONFIG_MODAL` constant, and an `edit()` method calling
  `this.modalService.open(DisponibilidadeFormComponent, { ...CONFIG_MODAL, data: {
  disponibilidade: this.disponibilidade } })` — copies `servico-item.component.ts:1-2,14,26,43,64-72`
  verbatim in shape.
- `disponibilidade-item.component.html:8-16`: add an edit button (pencil icon, "Editar
  disponibilidade" aria-label) before the delete button, inside the same
  `@if (authStore.isGestor())` block — mirrors `servico-item.component.html:5-8`.

### Acceptance
- MUST: edit button renders only when `authStore.isGestor()` is `true` — identical
  condition to the delete button already there, no new/duplicate role check introduced.
- MUST: clicking edit opens `DisponibilidadeFormComponent` with `data.disponibilidade`
  set to that card's exact `DisponibilidadeResponseDTO`.
- MUST NOT: change the delete button's markup, handler, or confirmation copy.
- MUST NOT: break existing card rendering for non-gestor roles (no edit/delete visible).

### Constraints
- DO: match `servico-item.component.ts`'s field/method order and TSDoc style exactly,
  substituting `servico` → `disponibilidade` domain terms (PT-BR labels, English
  method/verb names per `CLAUDE.md`).
- DO: re-verify after the edit is wired that the delete button's condition/behavior is
  unchanged (rename/insertion happens in the same `@if` block).

### Tasks
- [ ] `disponibilidade-item.component.ts:1-2` — import `MdbModalModule`, `MdbModalService`.
- [ ] `disponibilidade-item.component.ts` — import `DisponibilidadeFormComponent`.
- [ ] `disponibilidade-item.component.ts` — add `CONFIG_MODAL` constant (same shape as
      `servico-item.component.ts:14`).
- [ ] `disponibilidade-item.component.ts:14-17` — add `MdbModalModule` to `imports`.
- [ ] `disponibilidade-item.component.ts:24` — inject `MdbModalService`.
- [ ] `disponibilidade-item.component.ts` — add `edit()` method.
- [ ] `disponibilidade-item.component.html:8-16` — add the edit button before the
      delete button, inside the existing `@if (authStore.isGestor())` block.

## SPEC-003 - Delete re-verification

### Goal
- Confirm the existing delete path already satisfies the "gestor-only" requirement
  unmodified after SPEC-001/SPEC-002 land.

### Problem
- SITUATION: `disponibilidade-item.component.ts:57-68` and
  `disponibilidade-item.component.html:8-16` already implement delete gated by
  `authStore.isGestor()` — this predates the task. Confirmed: no backend overlap/no-op
  validation applies to a disponibilidade PATCH (Open Question 1, resolved), so no
  further investigation is needed there.
- IMPACT: inserting the new edit button into the same `@if (authStore.isGestor())`
  block as the delete button (SPEC-002) is a plausible place to accidentally regress
  delete's markup or handler.

### Plan
- Re-verify (not re-implement) that `disponibilidade-item.component.ts:57-68` and
  `disponibilidade-item.component.html:8-16` still restrict delete to
  `authStore.isGestor()`, unchanged, after SPEC-002's edit button is inserted.

### Acceptance
- MUST: delete continues to work exactly as today after SPEC-001/SPEC-002 land — no
  regression from the edit-button insertion sharing its `@if` block.
- MUST NOT: silently narrow or widen who can delete a disponibilidade.

### Constraints
- DO: treat this as verification only — no code change expected here unless the
  re-check surfaces a real regression risk from SPEC-002's edit button insertion.

### Tasks
- [ ] Re-check `disponibilidade-item.component.ts:57-68` +
      `disponibilidade-item.component.html:8-16` after SPEC-002 lands: delete button
      still renders only for `authStore.isGestor()`, handler unchanged.

# OPEN QUESTIONS (all resolved 2026-09-20)
1. **Backend update-validation for disponibilidade** — RESOLVED: No. No overlap,
   ordering, or no-op validation rule applies to a disponibilidade PATCH. SPEC-001's
   `submit()` update branch always sends all three fields (`diaSemana`, `horaInicio`,
   `horaFim`); no partial-diff logic is needed.
2. **Form-component duplication** (`isEditing`/`ngOnInit` patch-on-edit/`close()`/
   `isInvalid()` duplicated across `agendamento-form`, `servico-form`, and (after
   SPEC-001) `disponibilidade-form`) — RESOLVED: not pursued for now. No shared `core/`
   helper is introduced by this spec or its implementation pass.
3. **Optimization pass** — RESOLVED: yes, run it. A safe QoL/perf pass (no risky or
   breaking changes, no micro-optimizations) over `disponibilidade-form.component.ts`,
   `disponibilidade-item.component.ts`, and their templates happens after SPEC-001/
   SPEC-002 implementation lands, as a separate later step — still not part of this
   spec's authoring.
4. **Dead code in touched files** — RESOLVED: acknowledged, no action needed now. None
   identified during this investigation (`disponibilidade.store.ts`,
   `disponibilidade.service.ts`, `disponibilidade-item.component.ts`,
   `disponibilidade-form.component.ts` were all read; every method is called from at
   least one confirmed site). Re-check during implementation in case this changes; any
   dead/unused non-HTTP code found then still requires explicit user approval before
   removal, never silent deletion.

# CONSTRAINTS
- TypeScript only; touch `.html` only where a TS change strictly requires a new binding
  (SPEC-001's title/button-label conditionals, SPEC-002's edit button) — no other
  markup/CSS/SCSS changes.
- `authStore.isGestor()` is the single gating check for both edit and delete — already
  covers exactly `DONO`+`ADMIN`; never introduce a second/duplicate role check.
- Never modify `DisponibilidadeStore`, `DisponibilidadeService`, or the DTOs — their
  `update`/`remove` contracts already fit this feature.
- Any rename or logic removal touched by SPEC-001/SPEC-002 must be re-verified for
  correctness before being considered done (see each SPEC's re-check task).
- Never break existing create-flow or delete-flow behavior, for any role.
- This spec is planning-only: no `src/` files were modified while authoring it. All
  Open Questions are resolved; SPEC-001/SPEC-002/SPEC-003 tasks still execute only in a
  later, separate implementation pass — do not execute this spec yet.
- The QoL/perf optimization pass (Open Question 3) runs after SPEC-001/SPEC-002
  implementation lands, as its own later step, never bundled into their implementation.
