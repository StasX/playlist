#!/bin/sh
set -eu

composer install --prefer-dist --no-interaction --no-progress
mkdir -p storage/logs

case "${1:-all}" in
    all)
        vendor/bin/phpunit --configuration phpunit.xml --log-junit phpunit-results.xml --coverage-clover coverage.xml
        vendor/bin/infection --configuration=infection.json5 --threads=1 --no-progress
        ;;
    unit)
        vendor/bin/phpunit --configuration phpunit.xml --log-junit phpunit-results.xml --coverage-clover coverage.xml
        ;;
    infection)
        vendor/bin/infection --configuration=infection.json5 --threads=1 --no-progress
        ;;
    *)
        exec "$@"
        ;;
esac
