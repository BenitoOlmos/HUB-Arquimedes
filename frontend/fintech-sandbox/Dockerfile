# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json ./
COPY frontend/fintech-sandbox/package.json ./frontend/fintech-sandbox/
COPY shared-schemas/package.json ./shared-schemas/
RUN npm install --legacy-peer-deps
COPY shared-schemas/ ./shared-schemas/
COPY frontend/fintech-sandbox/ ./frontend/fintech-sandbox/
RUN npm run build --workspace=shared-schemas
WORKDIR /app/frontend/fintech-sandbox
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine
COPY --from=build /app/frontend/fintech-sandbox/dist /usr/share/nginx/html
COPY frontend/fintech-sandbox/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
