FROM mariadb:12
RUN apt-get update \
    && apt-get upgrade -y \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY playlistDB.sql /docker-entrypoint-initdb.d/init.sql
USER mysql
EXPOSE 3306
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
    CMD healthcheck.sh --connect --innodb_initialized || exit 1
