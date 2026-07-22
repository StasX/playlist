FROM node:20.6.0-alpine3.18 AS frontend-builder

WORKDIR /app

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN rm -rf node_modules && \
    rm -f package.json package-lock.json


FROM composer:2.10 AS backend-builder
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install \
    --no-dev \
    --prefer-dist \
    --no-interaction \
    --no-progress \
    --optimize-autoloader \
    --classmap-authoritative
COPY --from=frontend-builder /app .

FROM php:8.3-fpm-alpine3.24
RUN apk update && apk upgrade --no-cache && \
    docker-php-ext-install pdo_mysql
WORKDIR /var/www/html

COPY --from=backend-builder /app .

# Configure PHP-FPM to listen on all interfaces
RUN sed -i 's/^listen = .*/listen = 0.0.0.0:9000/' /usr/local/etc/php-fpm.d/www.conf && \
    sed -i 's/^listen.allowed_clients/;listen.allowed_clients/' /usr/local/etc/php-fpm.d/www.conf

EXPOSE 9000

CMD ["php-fpm"]
