FROM mariadb:12
RUN apt-get update \
    && apt-get upgrade -y \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY playlistDB.sql /docker-entrypoint-initdb.d/init.sql
