FROM node:20-alpine
RUN apk add --no-cache git
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npx prisma generate --config prisma-auth/prisma-auth.config.ts
RUN npm run build
RUN chmod +x start.sh
CMD ["./start.sh"]
