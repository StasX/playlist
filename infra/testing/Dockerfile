FROM php:8.5-cli-alpine

WORKDIR /build
COPY infra/php/prepare-php.sh /build/infra/php/prepare-php.sh
RUN sh infra/php/prepare-php.sh

WORKDIR /app
