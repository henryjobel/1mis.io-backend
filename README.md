# 1mis.io Backend (Single API for Frontend + SuperAdmin)

NestJS backend with multi-tenant store APIs and super-admin APIs in one service.

## Stack
- NestJS (REST)
- PostgreSQL + Prisma
- Redis + BullMQ
- JWT + RBAC
- Gemini integration flow (async jobs)

## Quick Start
1. `cp .env.example .env`
2. `docker compose up -d`
3. `npm install`
4. `npm run prisma:generate`
5. `npm run prisma:push`
6. `npm run seed`
7. `npm run start:dev`

Default API port: `4000`

## Security + Auth
- JWT access + refresh
- Refresh token rotation + revoke on logout
- RBAC roles (`owner, staff, super_admin, ops, support, finance`)
- Store isolation guard
- Helmet + throttler
- Password reset placeholder endpoints (token flow)

## API Map

### Auth/User
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET /api/auth/me`
- `PATCH /api/users/me`

### Store Owner
- `POST /api/stores`
- `GET /api/stores`
- `GET /api/stores/:id`
- `PATCH /api/stores/:id`
- `POST /api/stores/:id/publish`
- `PATCH /api/stores/:id/tracking`
- `PATCH /api/stores/:id/theme`

- `POST /api/stores/:id/products`
- `GET /api/stores/:id/products`
- `PATCH /api/stores/:id/products/:productId`
- `DELETE /api/stores/:id/products/:productId`

- `GET /api/stores/:id/orders`
- `PATCH /api/stores/:id/orders/:orderId/status`

### AI Generation
- `POST /api/stores/:id/ai/generate`
- `GET /api/stores/:id/ai/jobs/:jobId`
- `GET /api/stores/:id/ai/jobs/:jobId/result`

### Super Admin
- `GET /api/super-admin/overview`
- `GET /api/super-admin/stores`
- `PATCH /api/super-admin/stores/:id/status`
- `GET /api/super-admin/lifecycle`
- `GET /api/super-admin/lifecycle/:storeId`
- `GET /api/super-admin/admins`
- `POST /api/super-admin/admins/invite`
- `GET /api/super-admin/subscriptions`
- `GET /api/super-admin/payment-ops`
- `GET /api/super-admin/payment-ops/:storeId`
- `GET /api/super-admin/tickets`
- `GET /api/super-admin/tickets/:id`
- `GET /api/super-admin/health`
- `POST /api/super-admin/health/:service/restart`
- `GET /api/super-admin/ai-usage`
- `GET /api/super-admin/flags`
- `PATCH /api/super-admin/flags/:key`
- `GET /api/super-admin/audit-logs`
- `GET /api/super-admin/settings`
- `PATCH /api/super-admin/settings/:key`

## AI Queue Flow
1. Client calls `POST /api/stores/:id/ai/generate`
2. API stores `AiGenerationJob` with `queued`
3. BullMQ enqueues worker task
4. Worker calls Gemini API (or fallback when key missing)
5. Zod validates strict JSON result
6. Job ends `completed` or `failed`

## Tests
- Unit: `npm test`
- E2E smoke: `npm run test:e2e`

## Notes
- `docker` is required locally for Postgres/Redis.
- Audit log hooks are added on sensitive write actions.
