# Multi-stage build для оптимизации размера образа

# Стадия 1: Установка зависимостей
FROM node:18-alpine AS deps
WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

# Стадия 2: Сборка приложения
FROM node:18-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Стадия 3: Production образ
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Устанавливаем PM2 глобально
RUN npm install -g pm2

# Копируем только необходимое для запуска
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./

# Создаём непривилегированного пользователя
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 && \
    mkdir -p /home/nextjs/.pm2 && \
    chown -R nextjs:nodejs /app /home/nextjs

USER nextjs

EXPOSE 3000

CMD ["pm2-runtime", "start", "npm", "--", "run", "start"]