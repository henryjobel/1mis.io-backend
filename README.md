# 1mis.io Backend (Single API for Frontend + SuperAdmin)

NestJS backend with multi-tenant store APIs and super-admin APIs in one service.

## Stack
- NestJS (REST)
- PostgreSQL + Prisma
- Redis + BullMQ
- JWT + RBAC
- Gemini integration flow (async job pipeline placeholder)

## Quick Start
1. Copy env file:
   - `cp .env.example .env`
2. Start infra:
   - `docker compose up -d`
3. Install deps:
   - `npm install`
4. Generate Prisma client:
   - `npm run prisma:generate`
5. Push schema:
   - `npm run prisma:push`
6. Seed default admin:
   - `npm run seed`
7. Run API:
   - `npm run start:dev`

Default API port: `4000`

## Core Modules
- `auth`: signup/login/refresh/me
- `users`: profile update
- `stores`: store CRUD, publish, tracking config, theme config
- `products`: product CRUD
- `orders`: list + status updates
- `ai-generation`: async AI job create/status/result
- `super-admin`: platform operations endpoints
- `queue`: BullMQ queue/worker wiring
- `prisma`: DB client layer
- `common`: guards/decorators/audit service

## API Map

### Auth/User
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
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
3. BullMQ enqueues a worker task
4. Worker marks `running`, processes prompt (Gemini placeholder), saves result
5. Job ends as `completed` or `failed`
6. Client polls status/result endpoints

## Security
- JWT access + refresh token flow
- RBAC via roles: `owner, staff, super_admin, ops, support, finance`
- Store isolation guard for store-scoped endpoints

## Notes
- Gemini call is currently a safe placeholder pipeline; swap in real SDK call in `src/ai-generation/ai-generation.service.ts`.
- Queue has fallback mode when Redis is not available.
