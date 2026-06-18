# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json ./
COPY frontend/smart-port-erp/package.json ./frontend/smart-port-erp/
COPY shared-schemas/package.json ./shared-schemas/
RUN npm install --legacy-peer-deps
COPY shared-schemas/ ./shared-schemas/
COPY frontend/smart-port-erp/ ./frontend/smart-port-erp/
RUN npm run build --workspace=shared-schemas
WORKDIR /app/frontend/smart-port-erp
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine
COPY --from=build /app/frontend/smart-port-erp/dist /usr/share/nginx/html
COPY frontend/smart-port-erp/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
