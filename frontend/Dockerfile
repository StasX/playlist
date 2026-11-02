FROM node:26.5.0-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.31.3-alpine3.24
RUN apk update && apk upgrade --no-cache
RUN sed -i 's@^pid .*;@pid /tmp/nginx.pid;@; /^user /d' /etc/nginx/nginx.conf \
    && chown -R nginx:nginx /var/cache/nginx /etc/nginx/conf.d
COPY --chown=nginx:nginx nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist/ /var/www/html/public/
USER nginx
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1:80/healthz || exit 1
