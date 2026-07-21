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

RUN addgroup -g 1001 -S ml-hive && \
    adduser  -S ml-hive -u 1001 -G ml-hive

COPY --from=builder --chown=ml-hive:ml-hive /app/node_modules ./node_modules
COPY --from=builder --chown=ml-hive:ml-hive /app/package.json ./
COPY --from=builder --chown=ml-hive:ml-hive /app/index.js ./
COPY --from=builder --chown=ml-hive:ml-hive /app/prisma ./prisma/
COPY --from=builder --chown=ml-hive:ml-hive /app/src ./src/

USER ml-hive

EXPOSE 8000

CMD ["node", "index.js"]
