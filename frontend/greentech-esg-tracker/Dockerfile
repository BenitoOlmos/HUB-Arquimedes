# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json ./
COPY frontend/greentech-esg-tracker/package.json ./frontend/greentech-esg-tracker/
COPY shared-schemas/package.json ./shared-schemas/
RUN npm install --legacy-peer-deps
COPY shared-schemas/ ./shared-schemas/
COPY frontend/greentech-esg-tracker/ ./frontend/greentech-esg-tracker/
RUN npm run build --workspace=shared-schemas
WORKDIR /app/frontend/greentech-esg-tracker
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine
COPY --from=build /app/frontend/greentech-esg-tracker/dist /usr/share/nginx/html
COPY frontend/greentech-esg-tracker/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
