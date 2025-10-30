# 多階段構建，優化 image 大小
FROM node:24-alpine AS base

# 安裝相依套件階段
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 複製 package 檔案
COPY package.json package-lock.json* ./
RUN npm ci

# 建置應用程式階段
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 設定環境變數（build time）
ENV NEXT_TELEMETRY_DISABLED=1

# 建置 Next.js (prisma generate is included in build script)
RUN npm run build

# 生產環境階段
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 創建非 root 使用者
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 複製必要檔案
COPY --from=builder /app/public ./public

# 複製 Prisma schema 和 generated client
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/generated ./generated

# 複製 standalone 檔案
RUN mkdir .next
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]