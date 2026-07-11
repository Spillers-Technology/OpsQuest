FROM node:22-alpine AS dependencies

WORKDIR /app

COPY package.json package-lock.json ./
# Prefer better-sqlite3's prebuilt binary; install Alpine build tools only when
# npm has to compile the native module for this platform.
RUN npm ci --omit=dev \
    || (apk add --no-cache --virtual .build-deps python3 make g++ \
        && npm ci --omit=dev \
        && apk del .build-deps)
RUN npm cache clean --force

FROM node:22-alpine

ENV NODE_ENV=production \
    SQLITE_PATH=/app/data/opsquest.db

WORKDIR /app

COPY --from=dependencies /app/node_modules ./node_modules
COPY --chown=node:node . .
RUN mkdir -p /app/data && chown node:node /app/data

USER node

EXPOSE 3000
VOLUME ["/app/data"]

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:3000/health || exit 1

CMD ["npm", "start"]
