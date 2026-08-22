# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

IKaody — an Angular prototype (French UI) for a QR-code-based money transfer flow: enter an amount → generate a QR code → recipient scans it → confirmation. There is no backend; everything is simulated client-side. See README.md for the full product framing, including what a real financial app would additionally need (backend validation, single-use QR, auth, signing).

## Commands

```bash
npm install     # install dependencies
npm start       # ng serve — dev server at http://localhost:4200
npm run build   # ng build — production build to dist/ikaody
npm test        # ng test — Karma/Jasmine unit tests (Chrome)
```

There is no lint config and no `ng lint` script configured in this repo — don't assume ESLint is set up. Karma/Jasmine testing was added via `tsconfig.spec.json`, `karma.conf.js`, `src/test.ts`, and the `test` architect target in `angular.json`; spec files are colocated as `*.spec.ts` next to the code they test (e.g. `src/app/services/transfer.service.spec.ts`).

## Architecture

Angular 17, standalone components (no NgModules), routed via `provideRouter` in `src/app/app.config.ts`. Routes are defined in `src/app/app.routes.ts`:

- `/connexion` → `AuthComponent` — simulated login/signup toggle, the only route not behind `authGuard`
- `/` → `HomeComponent` — balance (derived from history) + recent transactions + links to send/receive
- `/envoyer` → `SendComponent` — amount entry → QR generation
- `/recevoir` → `ReceiveComponent` — camera scan or image import → confirmation
- `/historique` → `HistoryComponent` — full transaction list

Each page lives under `src/app/pages/<name>/` as a self-contained triplet (`.ts` + `.html` + `.css`). All routes except `/connexion` carry `canActivate: [authGuard]` (`src/app/guards/auth.guard.ts`), which redirects to `/connexion` when there's no session.

### Core data flow

Three root-provided services drive the whole app, and all are stateless with respect to a backend — everything is local:

- **`AuthService`** (`src/app/services/auth.service.ts`) simulates accounts and sessions entirely in `localStorage` (`ikaody-users`, `ikaody-session`), including storing passwords in plaintext — there is no backend, so this is a prototype convenience, not a real auth system. `register()`/`login()` return `{ success, error? }`; `getSession()`/`isAuthenticated()` read the current session.
- **`TransferService`** (`src/app/services/transfer.service.ts`) creates/encodes/decodes `Transfer` objects. A transfer is JSON-encoded directly into the QR payload (`{ type: 'virevolt-transfer', id, amount, sender, createdAt }`) — the QR *is* the transaction, there's no server round-trip. `decode()` validates the shape before trusting scanned input.
- **`HistoryService`** (`src/app/services/history.service.ts`) persists a `HistoryEntry[]` to `localStorage` under the key `ikaody-history` (capped at 50 entries, most-recent-first). Sent transfers are recorded with status `'pending'` (no backend to confirm the recipient scanned it); received transfers are always `'completed'`. `HomeComponent` recomputes the displayed balance from this history on top of a hardcoded `startingBalance`, rather than storing a balance directly — treat history as the source of truth, not a cache.

### QR code handling

- **Generating** (`SendComponent`): uses the `qrcode` package's `QRCode.toCanvas()` against a `<canvas #qrCanvas>`, rendered once via an `ngAfterViewChecked` guard (`qrRendered` flag) since the canvas only exists after `step` flips to `'qr'`. Also supports Web Share API (`navigator.share`/`canShare`), clipboard image copy, and canvas-to-PNG download, all with feature-detection fallbacks and French user-facing error text.
- **Scanning** (`ReceiveComponent`): uses `html5-qrcode`'s `Html5Qrcode`, either live camera (`start()` with `facingMode: 'environment'`) or file import (`scanFile()`). Scanner lifecycle is manual — start on `ngOnInit`/`useCameraInstead`/`scanAnother`, stop on `ngOnDestroy` and before switching to file mode; `isScannerActive()` guards against calling `stop()` on an already-stopped scanner. `qrcode` and `html5-qrcode` are both CommonJS and are allow-listed in `angular.json` (`allowedCommonJsDependencies`).

### Conventions

- User-facing strings (labels, error messages, date formatting via `toLocaleDateString('fr-FR', ...)`) are in French; keep new UI text consistent with this.
- Components use constructor-based DI (not `inject()`), `CommonModule` + `RouterLink` imports per standalone component, and colocated `templateUrl`/`styleUrl`.
- Amounts are formatted with `TransferService.formatAmount()` (`toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })`) — reuse it rather than formatting currency ad hoc.
