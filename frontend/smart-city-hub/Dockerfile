# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json ./
COPY frontend/smart-city-hub/package.json ./frontend/smart-city-hub/
COPY shared-schemas/package.json ./shared-schemas/
RUN npm install --legacy-peer-deps
COPY shared-schemas/ ./shared-schemas/
COPY frontend/smart-city-hub/ ./frontend/smart-city-hub/
RUN npm run build --workspace=shared-schemas
WORKDIR /app/frontend/smart-city-hub
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine
COPY --from=build /app/frontend/smart-city-hub/dist /usr/share/nginx/html
COPY frontend/smart-city-hub/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
