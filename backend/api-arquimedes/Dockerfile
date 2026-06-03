# Stage 1: Build
FROM node:20-alpine AS build
RUN apk add --no-cache openssl
WORKDIR /app
COPY package.json ./
COPY backend/api-arquimedes/package.json ./backend/api-arquimedes/
COPY shared-schemas/package.json ./shared-schemas/
RUN npm install
COPY shared-schemas/ ./shared-schemas/
COPY backend/api-arquimedes/ ./backend/api-arquimedes/
RUN npm run build --workspace=shared-schemas
WORKDIR /app/backend/api-arquimedes
RUN npx prisma generate
RUN npm run build
RUN npx tsc prisma/seed.ts --target es2020 --module commonjs

# Stage 2: Runtime
FROM node:20-alpine AS runner
RUN apk add --no-cache openssl
WORKDIR /app
COPY package.json ./
COPY backend/api-arquimedes/package.json ./backend/api-arquimedes/
COPY shared-schemas/package.json ./shared-schemas/
RUN npm install --ignore-scripts
COPY --from=build /app/shared-schemas/dist ./shared-schemas/dist
COPY --from=build /app/backend/api-arquimedes/dist ./backend/api-arquimedes/dist
COPY --from=build /app/backend/api-arquimedes/prisma ./backend/api-arquimedes/prisma
COPY --from=build /app/node_modules/@prisma /app/node_modules/@prisma
COPY --from=build /app/node_modules/.prisma /app/node_modules/.prisma

WORKDIR /app/backend/api-arquimedes
EXPOSE 20001
CMD ["node", "dist/index.js"]
