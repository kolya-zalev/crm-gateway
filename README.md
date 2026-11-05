# crm-gateway

BFF (Backend for Frontend) CRM — единственный сервис, к которому обращается фронт.

- HTTP API для фронта (`:3001`)
- авторизация — [Better Auth](https://www.better-auth.com), сессии в httpOnly-cookie
- проверка прав (`SessionAuthGuard` → `Actor` → `PermissionsGuard`)
- оркестрация микросервисов по TCP (фасады склеивают данные из нескольких сервисов)
- уведомления и чат с доставкой по SSE
- фоновая очередь уведомлений (BullMQ, 8 попыток с exponential backoff)

Запуск всей системы — [crm-infra](https://github.com/kolya-zalev/crm-infra).

## Зависимости

| Что | Зачем |
|---|---|
| PostgreSQL `crm_db` | уведомления, сообщения чата |
| PostgreSQL `auth_db` | Better Auth: `user`, `session`, `account`, `verification` |
| Redis | очередь BullMQ |
| crm-users-service (TCP :4002) | пользователи, команда |
| crm-leads-service (TCP :4003) | лиды, задачи, заметки, аналитика |
| [@crm/shared](https://github.com/kolya-zalev/crm-shared) | контракты сообщений, `ServiceClient` |

## API

| Маршрут | Куда идёт |
|---|---|
| `/api/auth/*` | Better Auth: sign-up, sign-in, sign-out, get-session |
| `/api/users` | users-service: профиль, смена пароля |
| `/api/team` | users-service |
| `/api/leads` | leads-service + users-service + очередь уведомлений |
| `/api/leads/:id/notes`, `/activities`, `/tasks`, `/api/tasks` | leads-service |
| `/api/analytics` | users-service → leads-service |
| `/api/notifications` | `crm_db` + SSE |
| `/api/chat` | `crm_db` + SSE |
| `/api/roles` | роли и права из `@crm/shared` |

Документация: http://localhost:3001/api/docs (Swagger).

## Локальный запуск

Нужны запущенные PostgreSQL, Redis, users-service и leads-service.

```bash
cp .env.example .env              # заполнить
npm install
npx prisma generate                                              # crm_db
npx prisma generate --config prisma-auth/prisma-auth.config.ts   # auth_db
npm run start:dev
```

## Переменные окружения

См. `.env.example`. `BETTER_AUTH_SECRET` — `openssl rand -base64 32`, **никогда не коммитить**.
`USERS_SERVICE_HOST` / `LEADS_SERVICE_HOST` по умолчанию `localhost`.

## Две базы — две Prisma-схемы

| База | Схема | Конфиг |
|---|---|---|
| `crm_db` | `prisma/schema.prisma` | `prisma.config.ts` |
| `auth_db` | `prisma-auth/schema.prisma` | `prisma-auth/prisma-auth.config.ts` |

```bash
# новая миграция
npx prisma migrate dev --name <имя>
npx prisma migrate dev --name <имя> --config prisma-auth/prisma-auth.config.ts

# Prisma Studio
npx prisma studio
npx prisma studio --config prisma-auth/prisma-auth.config.ts --port 5556
```

## Docker

`Dockerfile` генерирует оба Prisma-клиента и собирает приложение; `start.sh` применяет миграции обеих баз и запускает `dist/main`.

## Структура

```
src/
├── auth/            Better Auth, SessionAuthGuard, PermissionsGuard, декораторы
├── leads/           LeadsFacade, LeadsClient
├── tasks/ notes/ activities/ analytics/
├── users/ team/     UsersClient, профиль
├── notifications/   сервис, SSE, producer + processor очереди
├── chat/            чат + SSE
├── roles/           роли и права
├── queues/          имена очередей
└── main.ts          Better Auth на /api/auth/*, CORS, body parser, Swagger
```
