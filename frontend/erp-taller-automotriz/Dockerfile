# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json ./
COPY frontend/erp-taller-automotriz/package.json ./frontend/erp-taller-automotriz/
RUN npm install --legacy-peer-deps
COPY frontend/erp-taller-automotriz/ ./frontend/erp-taller-automotriz/
WORKDIR /app/frontend/erp-taller-automotriz
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine
COPY --from=build /app/frontend/erp-taller-automotriz/dist /usr/share/nginx/html
COPY frontend/erp-taller-automotriz/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
