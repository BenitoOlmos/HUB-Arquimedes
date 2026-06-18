# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json ./
COPY frontend/hospitality-erp/package.json ./frontend/hospitality-erp/
COPY shared-schemas/package.json ./shared-schemas/
RUN npm install --legacy-peer-deps
COPY shared-schemas/ ./shared-schemas/
COPY frontend/hospitality-erp/ ./frontend/hospitality-erp/
RUN npm run build --workspace=shared-schemas
WORKDIR /app/frontend/hospitality-erp
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine
COPY --from=build /app/frontend/hospitality-erp/dist /usr/share/nginx/html
COPY frontend/hospitality-erp/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
