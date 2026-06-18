# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json ./
COPY frontend/agrotech-dashboard/package.json ./frontend/agrotech-dashboard/
COPY shared-schemas/package.json ./shared-schemas/
RUN npm install --legacy-peer-deps
COPY shared-schemas/ ./shared-schemas/
COPY frontend/agrotech-dashboard/ ./frontend/agrotech-dashboard/
RUN npm run build --workspace=shared-schemas
WORKDIR /app/frontend/agrotech-dashboard
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine
COPY --from=build /app/frontend/agrotech-dashboard/dist /usr/share/nginx/html
COPY frontend/agrotech-dashboard/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
