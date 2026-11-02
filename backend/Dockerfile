FROM composer:2.10 AS builder

WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install \
    --no-dev \
    --prefer-dist \
    --no-interaction \
    --no-progress

COPY . .
RUN composer dump-autoload --optimize --classmap-authoritative

FROM php:8.5-fpm-alpine3.24

RUN apk add --no-cache fcgi \
    && apk add --no-cache $PHPIZE_DEPS \
    && docker-php-ext-install pdo_mysql \
    && apk del $PHPIZE_DEPS

WORKDIR /var/www/html
COPY --from=builder /app .

RUN mkdir -p storage/logs \
    && touch storage/logs/app.log \
    && chown -R www-data:www-data storage \
    && chmod -R 775 storage

RUN sed -i 's/^listen = .*/listen = 0.0.0.0:9000/' \
        /usr/local/etc/php-fpm.d/www.conf \
    && sed -i 's/^listen.allowed_clients/;listen.allowed_clients/' \
        /usr/local/etc/php-fpm.d/www.conf

RUN printf '\n[www]\nping.path = /ping\n' > /usr/local/etc/php-fpm.d/zz-healthcheck.conf

EXPOSE 9000
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD SCRIPT_NAME=/ping SCRIPT_FILENAME=/ping REQUEST_METHOD=GET cgi-fcgi -bind -connect 127.0.0.1:9000 | grep -q pong || exit 1
USER www-data
CMD ["php-fpm"]
