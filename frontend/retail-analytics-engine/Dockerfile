# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json ./
COPY frontend/retail-analytics-engine/package.json ./frontend/retail-analytics-engine/
COPY shared-schemas/package.json ./shared-schemas/
RUN npm install --legacy-peer-deps
COPY shared-schemas/ ./shared-schemas/
COPY frontend/retail-analytics-engine/ ./frontend/retail-analytics-engine/
RUN npm run build --workspace=shared-schemas
WORKDIR /app/frontend/retail-analytics-engine
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine
COPY --from=build /app/frontend/retail-analytics-engine/dist /usr/share/nginx/html
COPY frontend/retail-analytics-engine/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
