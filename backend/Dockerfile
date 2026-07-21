# ---- Build Stage ----
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts

COPY prisma ./prisma/
RUN npx prisma generate

COPY . .
RUN npm prune --production

# ---- Production Stage ----
FROM node:22-alpine AS production

RUN apk add --no-cache openssl

WORKDIR /app

RUN addgroup -g 1001 -S fundo && \
    adduser  -S fundo -u 1001 -G fundo

COPY --from=builder --chown=fundo:fundo /app/node_modules ./node_modules
COPY --from=builder --chown=fundo:fundo /app/package.json ./
COPY --from=builder --chown=fundo:fundo /app/index.js ./
COPY --from=builder --chown=fundo:fundo /app/prisma ./prisma/
COPY --from=builder --chown=fundo:fundo /app/src ./src/

USER fundo

EXPOSE 8000

CMD ["node", "index.js"]
