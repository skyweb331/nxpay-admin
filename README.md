# nxpay-admin

Staff back office for NxPay: customers, transactions, failed payouts, fee schedules, support,
admin users, audit / webhook logs and sandbox tools.

Built from the Vite + MUI + Tailwind starter, organised like limelite-frontend
(Apollo Client 4, GraphQL codegen, React Hook Form + zod).

## Requirements

- Node `22.22.3` (`nvm use`)
- A running `nxpay-backend` on `http://localhost:4000/graphql`

## Run without Docker

```bash
nvm use
npm ci
cp .env.example .env   # adjust VITE_API_URL if needed
npm run dev            # http://localhost:3001
```

## Scripts

| Script              | Purpose                                                    |
| ------------------- | ---------------------------------------------------------- |
| `npm run dev`       | Vite dev server on port 3001 (`PORT` env overrides)        |
| `npm run build`     | Type-check and build to `dist/`                            |
| `npm run typecheck` | Type-check only                                            |
| `npm run lint`      | ESLint                                                     |
| `npm run codegen`   | Regenerate `src/gql` from `../nxpay-backend/schema.graphql` |

`codegen` reads the schema file the backend writes on startup in development. Set `CODEGEN_SCHEMA`
to point it elsewhere (for example `http://localhost:4000/graphql`).

## Notes

- `.npmrc` sets `ignore-scripts=true`; run `npx husky` once after cloning to install git hooks.
- `npm audit` reports advisories for `braces` via `@graphql-codegen/cli`. It is a dev-only tool
  that processes our own glob patterns and no patched `braces` release exists yet.
