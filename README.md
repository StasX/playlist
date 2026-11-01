# Playlist Manager

A playlist manager originally written with jQuery in 2017–2018, with a Slim PHP API and MariaDB database.

## Project structure

- `frontend/`: static HTML, JavaScript, SCSS, public assets, npm dependencies, and Webpack configuration. Webpack generates the deployable site in `frontend/dist/`.
- `backend/`: PHP API controllers, models, bootstrap and routes, Composer dependencies, tests, and PHP quality tools.
- `backend/public/index.php`: API entry point executed by PHP-FPM.
- `database/`: MariaDB image and initialization SQL.
- `frontend/nginx/`: web server configuration.
- Each service has its own Dockerfile and build context. Root `docker-compose.yml` and `Jenkinsfile` handle orchestration and CI.

## Run with Docker

Copy `.env.example` to `.env`, adjust the database credentials, then run from the repository root:

```sh
docker compose up --build
```

Open http://localhost:8090.

Nginx serves the frontend build at `/` and forwards `/api/` requests to PHP-FPM. For example, `GET /api/playlist` lists playlists. Missing static files return 404, and PHP scripts cannot be requested directly.

Nginx and PHP share `web-network`. PHP and MariaDB share the private, internal `app-network`, using `database:3306` for database connections. Only Nginx publishes a host port; neither PHP-FPM nor MariaDB is exposed to the host.

## Jenkins on Kubernetes

See [infra/jenkins/README.md](infra/jenkins/README.md) for the Helm bootstrap, persistent storage, port forwarding on localhost:8080, and pipeline prerequisites.

```powershell
.\infra\jenkins\bootstrap.ps1
```

## Local development

Install backend dependencies, export the database variables from `.env.example` into the PHP process environment, and provide a MariaDB database initialized with `database/playlistDB.sql`. PHP reads environment variables directly; it does not load `.env` automatically.

Start the API in one terminal:

```sh
cd backend
composer install
php -S 127.0.0.1:8001 -t public public/index.php
```

Start the frontend in another terminal:

```sh
cd frontend
npm ci
npm run start-dev
```

The development server serves the frontend at http://localhost:8000, rebuilds on changes, and proxies `/api` to the local API on port 8001. `npm run build` produces the static production build; Docker uses Nginx to serve it.

Run PHP checks from `backend/`, for example `composer test` and `composer phpstan`. The route tests require a separate test database configured by `backend/phpunit.xml`; existing API/test inconsistencies still need to be resolved.
