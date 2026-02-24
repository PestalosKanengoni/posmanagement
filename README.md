# POS Management System — Angular 17

A standalone Angular 17 application for Merchant Analysts to manage POS terminal requests.

## Features
- **Login** with auth guard protecting dashboard routes
- **Requests tab** — view all POS requests, filter by status, search by serial/merchant
- **Status lifecycle** — Pending → Configured → Deployed with live stat counters
- **Configure modal** — reactive form to set MID, TID, bank account, payment network, currency
- **All Machines tab** — search configured/deployed terminals by serial, merchant, model, or MID
- **Toast notifications** — system-wide feedback service
- **Signals-based state** — Angular 17 signals used for reactive stats and filtering

## Project Structure

```
src/app/
├── app.component.ts            # Root component (router-outlet + toast)
├── app.config.ts               # Application config (providers)
├── app.routes.ts               # Root routes (lazy-loaded features)
│
├── core/
│   ├── models/
│   │   └── pos-machine.model.ts    # PosMachine, PosStats, ConfigurePayload, User interfaces
│   ├── services/
│   │   ├── auth.service.ts         # Login/logout, session management
│   │   ├── pos.service.ts          # POS CRUD operations (swap mock with HttpClient)
│   │   └── toast.service.ts        # Global notification service
│   ├── guards/
│   │   └── auth.guard.ts           # Protects /dashboard routes
│   └── interceptors/
│       └── auth.interceptor.ts     # Attaches Bearer token to HTTP requests
│
├── shared/
│   └── components/
│       ├── badge/                  # <app-badge [status]="..." />
│       ├── stat-card/              # <app-stat-card label hint value variant />
│       └── toast/                  # Fixed toast overlay, reads from ToastService
│
└── features/
    ├── auth/
    │   ├── auth.routes.ts
    │   └── login/                  # Login page component
    └── dashboard/
        ├── dashboard.routes.ts
        ├── dashboard-shell.component.*   # Topbar + router-outlet
        └── components/
            ├── requests/               # Main requests table + stats
            ├── machines/               # All machines search table
            └── config-modal/           # Configure POS reactive form modal

```

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm start
# → http://localhost:4200

# Production build
npm run build
```

## Demo Credentials
- **Email:** analyst@bank.com  
- **Password:** password

## Connecting to a Real API

All API calls are in `src/app/core/services/pos.service.ts`.  
Replace each Observable body with an `HttpClient` call:

```typescript
// Before (mock):
fetchAll(): Observable<PosMachine[]> {
  return of([...MOCK_DATA]).pipe(delay(300));
}

// After (real API):
fetchAll(): Observable<PosMachine[]> {
  return this.http.get<PosMachine[]>(`${environment.apiUrl}/pos`);
}
```

Inject `HttpClient` into the service constructor and import `HttpClientModule` (already configured via `provideHttpClient()` in `app.config.ts`).

The `authInterceptor` in `core/interceptors/auth.interceptor.ts` automatically attaches the Bearer token to every request.

## Angular 17 Patterns Used
- **Standalone components** — no NgModule needed
- **Signals** — `signal()`, `computed()` for reactive state in PosService
- **`@if` / `@for`** — new control flow syntax
- **Lazy loading** — `loadComponent()` and `loadChildren()` for routes
- **Functional guards** — `authGuard` as `CanActivateFn`
- **Functional interceptors** — `authInterceptor` as `HttpInterceptorFn`
