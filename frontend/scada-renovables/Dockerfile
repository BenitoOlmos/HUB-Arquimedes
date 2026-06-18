# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json ./
COPY frontend/scada-renovables/package.json ./frontend/scada-renovables/
COPY shared-schemas/package.json ./shared-schemas/
RUN npm install --legacy-peer-deps
COPY shared-schemas/ ./shared-schemas/
COPY frontend/scada-renovables/ ./frontend/scada-renovables/
RUN npm run build --workspace=shared-schemas
WORKDIR /app/frontend/scada-renovables
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine
COPY --from=build /app/frontend/scada-renovables/dist /usr/share/nginx/html
COPY frontend/scada-renovables/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
