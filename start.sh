set -e
npx prisma migrate deploy
npx prisma migrate deploy --config prisma-auth/prisma-auth.config.ts
exec node dist/main
