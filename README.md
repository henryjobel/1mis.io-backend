# 1mis.io Backend (Single API for Frontend + SuperAdmin)

NestJS backend with multi-tenant store APIs and super-admin APIs in one service.

## Stack
- NestJS (REST)
- PostgreSQL + Prisma
- Redis + BullMQ fix
- JWT + RBAC
- Gemini integration flow (async jobs)
 fix
## Quick Start
1. `cp .env.example .env`
2. `docker compose up -d`
3. `npm install`
4. `npm run prisma:generate`
5. `npm run prisma:push`
6. `npm run seed`
7. `npm run start:dev`

Default API port: `4000`
a
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
- `GET /api/users/me`
- `PATCH /api/users/me`

### Store Owner
- `POST /api/stores`
- `GET /api/stores`
- `GET /api/stores/:id`
- `PATCH /api/stores/:id`
- `POST /api/stores/:id/publish`
- `PATCH /api/stores/:id/tracking`
- `PATCH /api/stores/:id/theme`

- `GET /api/stores/:id/dashboard/overview`

- `POST /api/stores/:id/products`
- `GET /api/stores/:id/products`
- `PATCH /api/stores/:id/products/:productId`
- `PATCH /api/stores/:id/products/:productId/delivery`
- `DELETE /api/stores/:id/products/:productId`

- `GET /api/stores/:id/orders`
- `PATCH /api/stores/:id/orders/:orderId/status`

- `GET /api/stores/:id/customers`
- `GET /api/stores/:id/reviews`
- `GET /api/stores/:id/payments/transactions`
- `GET /api/stores/:id/notifications/logs`

- `GET /api/stores/:id/shipping/config`
- `PATCH /api/stores/:id/shipping/config`
- `GET /api/stores/:id/shipping/shipments`
- `GET /api/stores/:id/shipping/orders`

### AI Generation
- `POST /api/stores/:id/ai/generate`
- `GET /api/stores/:id/ai/jobs/:jobId`
- `GET /api/stores/:id/ai/jobs/:jobId/result`
- `POST /api/stores/:id/ai/jobs/:jobId/apply`
- `GET /api/stores/:id/ai/history`
- `POST /api/stores/:id/ai/history/undo`
- `POST /api/stores/:id/ai/history/:historyId/revert`
- `POST /api/stores/:id/ai/sections/apply`
- `GET /api/stores/:id/ai/sections/history`
- `POST /api/stores/:id/ai/sections/history/:historyId/revert`

### Billing (Phase 1)
- `GET /api/plans`
- `GET /api/stores/:id/subscription`
- `GET /api/stores/:id/subscription/invoices`
- `GET /api/stores/:id/subscription/events`
- `POST /api/stores/:id/subscription/renew`
- `POST /api/stores/:id/subscription/sslcommerz/init`
- `POST /api/stores/:id/subscription/cancel`
- `POST /api/webhooks/sslcommerz/subscription`
- `POST /api/webhooks/sslcommerz/subscription/ipn`
- `POST|GET /api/webhooks/sslcommerz/subscription/success`
- `POST|GET /api/webhooks/sslcommerz/subscription/fail`
- `POST|GET /api/webhooks/sslcommerz/subscription/cancel`
- `GET /api/webhooks/sslcommerz/subscription/mock/:invoiceId`

SSLCommerz callback behavior:
- `GET` callback routes redirect to owner billing page (`OWNER_DASHBOARD_BILLING_URL`).
- `POST` callback routes process server-to-server provider events.
- If `SSLCOMMERZ_STORE_ID` / `SSLCOMMERZ_STORE_PASSWORD` are empty, init uses local mock checkout URL.
- For paid callbacks in live mode, backend validates `val_id` via SSLCommerz validation API before activating subscription.

### Compliance
- `POST /api/stores/:id/compliance/gdpr/export`
- `POST /api/stores/:id/compliance/gdpr/delete-request`
- `GET /api/stores/:id/compliance/requests`

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
- `GET /api/super-admin/security/incidents`
- `GET /api/super-admin/security/incidents/:id`
- `GET /api/super-admin/health`
- `POST /api/super-admin/health/:service/restart`
- `GET /api/super-admin/ai-usage`
- `GET /api/super-admin/flags`
- `PATCH /api/super-admin/flags/:key`
- `GET /api/super-admin/audit-logs`
- `GET /api/super-admin/settings`
- `PATCH /api/super-admin/settings/:key`

### Standard List Query Contract
- Supported query params: `page`, `limit`, `q`, `status`, `from`, `to`, `sort`
- Standard response shape:
  - `{ items, page, limit, total, totalPages }`
- Implemented on owner list endpoints:
  - `GET /api/stores/:id/products`
  - `GET /api/stores/:id/orders`
  - `GET /api/stores/:id/customers`
  - `GET /api/stores/:id/reviews`
  - `GET /api/stores/:id/payments/transactions`
  - `GET /api/stores/:id/shipping/shipments`
  - `GET /api/stores/:id/shipping/orders`
  - `GET /api/stores/:id/notifications/logs`

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

## Migration Notes (MVP)
- `User.businessName` is now persisted from signup and profile update contracts.
- Shipping config payload now supports top-level `methods`, `charges`, and `rates`.
- New settings keys used in `PlatformSetting`:
  - `product_delivery:{storeId}:{productId}`
  - `ai_section_history:{storeId}:{historyId}`
  - `gdpr_request:{storeId}:{requestId}`
- Owner UI alias compatibility:
  - incoming order status `completed` is normalized to persisted `delivered`
  - selected owner endpoints return `status` (UI-friendly) plus `rawStatus`

## Integration Checklist
- Owner Frontend:
  - Wire overview cards + recent orders + website/payment status to `GET /api/stores/:id/dashboard/overview`.
  - Wire delivery module to shipping config + shipping orders + product delivery toggle endpoints.
  - Replace local section prompt editor with `/api/stores/:id/ai/sections/*` flow.
  - Use `/api/users/me` for profile settings (`name`, `businessName`, `email`).
  - Wire GDPR actions to compliance endpoints.
  - Switch table modules to standard list query + paginated response shape.
- SuperAdmin Frontend:
  - Use `GET /api/super-admin/audit-logs?format=dashboard` for normalized timeline.
  - Use `GET /api/super-admin/security/incidents/:id` for incident details drawer/page.
  - Use incident compatibility fields (`resolutionNote`, `resolvedAt`) in detail/update flows.
- Postman:
  - Use `postman/1mis-backend-remaining-gaps.postman_collection.json` for new endpoints and sample payloads.

## Notes
- `docker` is required locally for Postgres/Redis.
- Audit log hooks are added on sensitive write actions.
