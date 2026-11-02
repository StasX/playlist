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

The containers run as `nginx`, `www-data`, and `mysql`, respectively. Nginx listens on container port 80, mapped to host port 8090. Docker health checks probe Nginx at `/healthz`, PHP-FPM through its FastCGI ping endpoint, and MariaDB using its bundled health-check script.

Nginx serves the frontend build at `/` and forwards `/api/` requests to PHP-FPM. For example, `GET /api/playlist` lists playlists. Missing static files return 404, and PHP scripts cannot be requested directly.

Nginx and PHP share `web-network`. PHP and MariaDB share the private, internal `app-network`, using `database:3306` for database connections. Only Nginx publishes a host port; neither PHP-FPM nor MariaDB is exposed to the host.

## Jenkins on Kubernetes

See [infra/jenkins/README.md](infra/jenkins/README.md) for the Helm bootstrap, persistent storage, port forwarding on localhost:8080, and pipeline prerequisites.

```powershell
.\infra\jenkins\bootstrap.ps1
```

## Local development

Use PHP 8.5 and Composer 2, matching the backend image and Jenkins build container.

Install backend dependencies, export the database variables from `.env.example` into the PHP process environment, and provide a MariaDB database initialized with `database/playlistDB.sql`. PHP reads environment variables directly; it does not load `.env` automatically.

Detailed API errors are hidden by default, including when `APP_ENV` is unset. Set `APP_ENV=development` in the PHP process environment to see exception details locally. Docker Compose passes `APP_ENV` from `.env`, defaulting to `production`. Full errors continue to be logged in `backend/storage/logs/app.log`.

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

Run PHPUnit and Infection with an isolated MariaDB test database from the repository root:

```sh
docker compose -f docker-compose.dev.yml run --build --rm tests
```

Compose waits for the database health check, then the runner installs locked Composer dependencies and runs PHPUnit with coverage followed by Infection with one worker. Run either suite separately by appending `unit` or `infection` to the command. Reports are written to `backend/phpunit-results.xml`, `backend/coverage.xml`, and `backend/storage/logs/infection*`. Infection's temporary files live in container memory to avoid filesystem errors on Windows bind mounts.

Stop the test database with `docker compose -f docker-compose.dev.yml down`. Its data lives in memory and is discarded when the database container stops. Composer dependencies use a separate named volume. The test stack publishes no ports and uses its own Compose project, separate from the application stack. Run one test command at a time because both suites delete playlist records.

For other PHP checks, run commands from `backend/`, for example `composer phpstan`.
