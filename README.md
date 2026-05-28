# Node.js Starter Boilerplate

A clean starter boilerplate for Node.js applications with PostgreSQL support, Sequelize + TypeScript, repository pattern, modular architecture, and structured logging.

## Features

- PostgreSQL support
- Sequelize ORM with TypeScript definitions
- Repository pattern for data access
- Modular directory structure
- Centralized configuration
- Structured logging

## Getting Started

### Prerequisites

- Node.js 18+ or compatible
- PostgreSQL database
- npm or yarn

### Installation

```bash
git clone https://github.com/ItzSamdam/nodejs-starter-boilerplate.git
cd nodejs-starter-boilerplate
pnpm install
```

### Configure Environment

Copy the `.env` file from `.env.example` in the project root, then update the database settings as needed:

```bash
cp .env.example .env
```

```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_database
DB_USER=your_user
DB_PASSWORD=your_password
```

## Project Structure

The boilerplate follows a modular approach that keeps features separated and scalable.

- `src/cronJobs/` - scheduled tasks and background jobs
- `src/modules/` - feature modules and Sequelize model definitions
- `src/routes/` - route registration and API endpoints
- `src/shared/` - shared services and common business logic
- `src/shared/config/` - centralized application configuration
- `src/shared/database/` - database initialization, models, and data access helpers
- `src/shared/email-templates/` - email template definitions
- `src/shared/exceptions/` - custom error and exception handling
- `src/shared/middlewares/` - Express middleware
- `src/shared/types/` - shared TypeScript types and interfaces
- `src/shared/utils/` - utility helpers
- `src/app.ts` - application bootstrap
- `src/server.ts` - server entrypoint

## Sequelize + TypeScript

This boilerplate uses Sequelize with TypeScript support for typed models and database interaction.

- Define models using TypeScript classes and interfaces
- Use Sequelize migrations or sync methods for schema management
- Repository pattern wraps model access for clean separation

## Repository Pattern

The repository pattern is used to abstract database access and keep controllers/services decoupled from ORM details.

Example repository responsibilities:

- CRUD operations
- Query logic
- Data mapping between entities and models

## Logging

A structured logging setup is included to capture application events and errors.

- Centralized logger utility
- Consistent log format
- Request and error logging support

## Running

```bash
pnpm run build
pnpm start
```

For development:

```bash
pnpm run dev
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Open a pull request

## License

MIT
