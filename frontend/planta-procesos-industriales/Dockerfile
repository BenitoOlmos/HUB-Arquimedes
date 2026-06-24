# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json ./
COPY frontend/planta-procesos-industriales/package.json ./frontend/planta-procesos-industriales/
RUN npm install --legacy-peer-deps
COPY frontend/planta-procesos-industriales/ ./frontend/planta-procesos-industriales/
WORKDIR /app/frontend/planta-procesos-industriales
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine
COPY --from=build /app/frontend/planta-procesos-industriales/dist /usr/share/nginx/html
COPY frontend/planta-procesos-industriales/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
