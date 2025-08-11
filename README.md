# Weather App API

This project is a RESTful API service developed with NestJS that allows users to query location-based weather data. The system incorporates modern and scalable backend architecture principles such as Role-Based Access Control (RBAC), external API integration (OpenWeather API), caching (Redis), database management (PostgreSQL & Prisma), and metric monitoring (Prometheus & Grafana).

## Features

- **RESTful API:** Clean, modular, and scalable API built with NestJS.
- **Role-Based Access Control (RBAC):** Secure endpoints with `admin` and `user` roles.
- **Authentication:** Secure user authentication with JWT (JSON Web Tokens).
- **Database:** Efficient database management and optimization with PostgreSQL and Prisma ORM.
- **External API Integration:** Fetching real-time weather data from the OpenWeather API.
- **Caching:** Improving performance and efficiently using API limits by caching frequent requests with Redis.
- **Configuration Management:** Centralized and environment-based configuration with `@nestjs/config`.
- **Validation:** Automatic validation of incoming requests via DTOs using `class-validator` and `class-transformer`.
- **API Documentation:** Auto-generated and interactive API documentation with Swagger (OpenAPI).
- **Security:** Protection against brute-force attacks with Throttling (rate limiting).
- **Monitoring and Metrics:** Collection of metrics with Prometheus and visualization with Grafana.
- **Containerization:** Easy setup and deployment with Docker and Docker Compose.

## System Architecture

The application is built on a monolithic NestJS architecture. Inter-service communication and separation of responsibilities are achieved through a modular structure. The following diagram illustrates the main components of the system and their interactions.

```mermaid
graph TD
    subgraph "Client"
        UserInterface["User / Admin"]
    end

    subgraph "Weather API Application (NestJS)"
        API["REST API <br> (Throttling, Guards)"]
        Auth["Auth Module <br> (JWT)"]
        User["User Module"]
        Weather["Weather Module"]
        Metrics["Metrics Module"]
        Cache["Cache Service <br> (Redis)"]
        DB["Database Service <br> (Prisma)"]
    end

    subgraph "External Services"
        OpenWeather["OpenWeather API"]
        Postgres[(PostgreSQL DB)]
        Redis[(Redis Cache)]
        Prometheus[Prometheus]
        Grafana[Grafana]
    end

    UserInterface -- "HTTPS" --> API
    API --> Auth
    API --> User
    API --> Weather
    API -- "Records Metrics" --> Metrics

    Auth -- "Validates User" --> DB
    User -- "Manages Users" --> DB
    Weather -- "Manages Weather Data" --> DB
    Weather -- "Caches Data" --> Cache
    Weather -- "Fetches Weather" --> OpenWeather

    Cache -- "Uses" --> Redis
    DB -- "Uses" --o Postgres

    Prometheus -- "Scrapes" --> Metrics
    Grafana -- "Visualizes" --> Prometheus
```

## Project Folder Structure

The project follows the standard modular structure of NestJS. The main logic is located under the `src/` directory.

```
/
├── prisma/               # Prisma schema and migration files
│   └── schema.prisma
├── src/
│   ├── common/           # Shared modules (guards, filters, decorators)
│   ├── module/           # Application's main modules
│   │   ├── auth/         # Authentication (login)
│   │   ├── cache/        # Redis cache service
│   │   ├── config/       # Environment variables and configuration
│   │   ├── database/     # Database connection (Prisma)
│   │   ├── metrics/      # Prometheus metrics
│   │   ├── user/         # User management
│   │   └── weather/      # Weather querying
│   ├── main.ts           # Application entry point
│   └── app.module.ts     # Main application module
├── .env.example          # Template for required environment variables
├── docker-compose.yml    # Docker Compose configuration
└── package.json          # Project dependencies and scripts
```

## Installation and Setup

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18+)
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)

### 1. Clone the Project

```bash
git clone <repository-url>
cd weather-app
```

### 2. Set Up Environment Variables

Copy the `.env.example` file to create a new file named `.env` and edit the values according to your configuration.

```bash
cp env.example .env
```

### 3. Running with Docker (Recommended)

You can start all services (PostgreSQL, Redis, Grafana, Prometheus, and Weather-App) with a single command using Docker and Docker Compose.

```bash
npm run docker:up
```

- The application will be running at `http://localhost:3000`.
- Prometheus will be accessible at `http://localhost:9090`.
- Grafana will be accessible at `http://localhost:8080`.

To stop the services:

```bash
npm run docker:down
```

### 4. Running Locally (Without Docker)

If you are running the services (PostgreSQL, Redis) on your local machine, you can start the application locally.

```bash
# Install dependencies
npm install

# Run Prisma migrations
npx prisma migrate dev

# Start in development mode
npm run start:dev
```

## Roles and Permissions

The system has two different user roles:

- **`user`:**
  - Can only view their own weather query history.
  - Can make new weather queries.
- **`admin`:**
  - Can list all users.
  - Can create new users.
  - Can query the weather history of any user by `userId`.

## API Endpoints

Once the application is started, you can access the API documentation at `http://localhost:3000/api/docs`.

### Auth

| Method | Endpoint      | Description                  | Role   |
| ------ | ------------- | ---------------------------- | ------ |
| `POST` | `/auth/login` | User login and get JWT token | Public |

### Users

| Method | Endpoint | Description         | Role    |
| ------ | -------- | ------------------- | ------- |
| `GET`  | `/users` | Lists all users     | `admin` |
| `POST` | `/users` | Creates a new user  | `admin` |

### Weather

| Method | Endpoint                    | Description                                  | Role           |
| ------ | --------------------------- | -------------------------------------------- | -------------- |
| `GET`  | `/weather`                  | Gets weather data for a specified city       | `user`, `admin` |
| `GET`  | `/weather/history`          | Gets the query history of the logged-in user | `user`, `admin` |
| `GET`  | `/weather/history/user/:id` | Gets the query history of a specific user    | `admin`        |

### Metrics

| Method | Endpoint    | Description                     | Role   |
| ------ | ----------- | ------------------------------- | ------ |
| `GET`  | `/metrics`  | Serves Prometheus metrics       | Public |


## Running Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage report
npm run test:cov
```

## Monitoring

The project has monitoring capabilities with Prometheus and Grafana.

- **Prometheus:** Accessible at `http://localhost:9090`. It automatically scrapes the `http://weather-app:3000/api/v1/metrics` endpoint.
- **Grafana:** Accessible at `http://localhost:8080`. You can use a pre-configured dashboard by importing the `grafana-dashboard.json` file that comes with the project.

## Environment Variables

Below is a description of the variables that should be in the `.env` file.

| Variable                  | Description                                            | Example Value                                                             |
| ------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------- |
| `NODE_ENV`                | Application environment (`development` or `production`)  | `development`                                                             |
| `DATABASE_URL`            | PostgreSQL database connection string                  | `postgresql://admin123:password123@localhost:5432/weather_app?schema=public` |
| `PORT`                    | The port the application will run on                   | `3000`                                                                    |
| `JWT_SECRET`              | Secret key used to sign JWT tokens                     | `mysecretkeyforauthentication123456`                                      |
| `JWT_SALT_ROUNDS`         | Number of salt rounds for password hashing             | `12`                                                                      |
| `CORS_ORIGIN`             | Allowed origins (comma-separated)                      | `http://localhost:3000,http://localhost:3001`                             |
| `OPENWEATHER_API_KEY`     | OpenWeatherMap API key                                 | `3a0f9539558ffcb32f6d0967fe7f4991`                                         |
| `OPENWEATHER_GEOCODING_URL`| OpenWeatherMap Geocoding API URL                       | `http://api.openweathermap.org/geo/1.0/direct`                            |
| `OPENWEATHER_WEATHER_URL` | OpenWeatherMap Weather API URL                         | `https://api.openweathermap.org/data/2.5/weather`                         |
| `REDIS_HOST`              | Redis server address                                   | `localhost`                                                               |
| `REDIS_PORT`              | Redis server port                                      | `6379`                                                                    |
| `REDIS_PASSWORD`          | Redis password                                         | `redis_password_123`                                                      |
| `CACHE_TTL`               | Cache data Time-To-Live in seconds                     | `300`                                                                     |
| `CACHE_MAX_ITEMS`         | Maximum number of items to keep in cache               | `1000`                                                                    |

## License

This project is licensed under the MIT License. See the `LICENSE` file for more details.
