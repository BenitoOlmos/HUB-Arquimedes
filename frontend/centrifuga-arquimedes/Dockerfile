# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY frontend/centrifuga-arquimedes/package*.json ./frontend/centrifuga-arquimedes/
COPY shared-schemas/package*.json ./shared-schemas/
RUN npm ci --legacy-peer-deps
COPY shared-schemas/ ./shared-schemas/
COPY frontend/centrifuga-arquimedes/ ./frontend/centrifuga-arquimedes/
RUN npm run build --workspace=shared-schemas
WORKDIR /app/frontend/centrifuga-arquimedes
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine
COPY --from=build /app/frontend/centrifuga-arquimedes/dist /usr/share/nginx/html
COPY frontend/centrifuga-arquimedes/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
