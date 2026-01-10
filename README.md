# AI-Guided Maintenance Assistant API

Backend API built with NestJS that generates structured, step-by-step vehicle maintenance workflows using OpenAI tool calling and strict server-side validation.

## Features

- Create maintenance tasks and auto-generate ordered steps (6-12)
- Validate AI output (schema, order, length limits) before persistence
- Retrieve tasks and steps
- Mark steps complete or uncomplete
- Health endpoints for service and database checks

## Tech Stack

- Node.js + TypeScript
- NestJS
- Prisma ORM + PostgreSQL
- OpenAI API (tool calling)

## Project Structure

```
src/
  ai/           OpenAI integration and output validation
  health/       Health endpoints
  prisma/       Prisma service
  steps/        Step endpoints and completion logic
  tasks/        Task creation and AI orchestration
  generated/    Prisma client output
```

## Requirements

- Node.js 18+
- PostgreSQL
- OpenAI API key

## Setup

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment

Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/maintenance_db
OPENAI_API_KEY=sk-xxxx
PORT=3000
```

### 3) Apply database schema

```bash
npx prisma migrate dev
npx prisma generate
```

### 4) Run the server

```bash
npm run start:dev
```

Server starts on:

```
http://localhost:3000
```

## API Endpoints

### Tasks

- `POST /tasks` - Create task and generate steps
- `GET /tasks/:id` - Fetch a task by id

Example request:

```json
{
  "title": "Replace brake pads",
  "vehicleType": "Sedan"
}
```

### Steps

- `GET /steps/task/:taskId` - List all steps for a task
- `GET /steps/:id` - Fetch a step by id
- `GET /steps/complete/:id` - Mark a step complete
- `GET /steps/uncomplete/:id` - Mark a step uncomplete
- `GET /steps/init` - Seed two demo steps (development helper)

### Health

- `GET /health` - Basic health check
- `GET /health/db` - Database connectivity check

## AI Safety and Validation

The AI integration is isolated to `src/ai` and never writes directly to the database. AI output is validated before any persistence:

- 6-12 steps required
- Strict step ordering (1..n)
- Title length 3-80 characters
- Description length 20-500 characters
- Optional safety warning length <= 160 characters

Invalid AI responses are rejected and surfaced as a `BadGatewayException`.

## Scripts

- `npm run start:dev` - Start dev server with watch mode
- `npm run build` - Build for production
- `npm run start:prod` - Run compiled app
- `npm run lint` - Lint and fix
- `npm run test` - Unit tests

## License

UNLICENSED
