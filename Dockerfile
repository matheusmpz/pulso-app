# Pulso — front-end (somente o front; a API e o banco têm o próprio compose no pulso-api)

# ---------- 1) Build ----------
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN npm run build

# ---------- 2) Servidor estático ----------
FROM nginx:1.27-alpine

# SPA + cache dos assets
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
# Gera /config.js na subida do container a partir de API_URL / WS_URL
COPY docker/40-pulso-config.sh /docker-entrypoint.d/40-pulso-config.sh
RUN chmod +x /docker-entrypoint.d/40-pulso-config.sh

COPY --from=build /app/dist /usr/share/nginx/html

# URL da API vista pelo NAVEGADOR (não pelo container)
ENV API_URL=http://localhost:8080
ENV WS_URL=

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD wget -qO- http://127.0.0.1/healthz || exit 1
