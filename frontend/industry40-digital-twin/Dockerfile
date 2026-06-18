# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json ./
COPY frontend/industry40-digital-twin/package.json ./frontend/industry40-digital-twin/
COPY shared-schemas/package.json ./shared-schemas/
RUN npm install --legacy-peer-deps
COPY shared-schemas/ ./shared-schemas/
COPY frontend/industry40-digital-twin/ ./frontend/industry40-digital-twin/
RUN npm run build --workspace=shared-schemas
WORKDIR /app/frontend/industry40-digital-twin
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine
COPY --from=build /app/frontend/industry40-digital-twin/dist /usr/share/nginx/html
COPY frontend/industry40-digital-twin/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
