# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json ./
COPY frontend/his-triage-tactico/package.json ./frontend/his-triage-tactico/
COPY shared-schemas/package.json ./shared-schemas/
RUN npm install --legacy-peer-deps
COPY shared-schemas/ ./shared-schemas/
COPY frontend/his-triage-tactico/ ./frontend/his-triage-tactico/
RUN npm run build --workspace=shared-schemas
WORKDIR /app/frontend/his-triage-tactico
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine
COPY --from=build /app/frontend/his-triage-tactico/dist /usr/share/nginx/html
COPY frontend/his-triage-tactico/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
