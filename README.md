 # AI-Guided Maintenance Assistant API

Backend API for an AI-powered maintenance assistant that generates clear, step-by-step repair instructions for vehicle owners.

This project demonstrates **clean backend architecture**, **controlled AI integration**, and **safe persistence of AI-generated data**.

---

## ✨ Features

- Create maintenance tasks (e.g. “Replace brake pads”)
- Automatically generate 6–12 structured repair steps using AI
- Strict validation of AI output before database persistence
- Step completion tracking
- Atomic database transactions (no partial writes)
- Mock AI mode for local development (no API cost)
- Clean NestJS module boundaries

---

## 🏗️ Tech Stack

- **Node.js**
- **NestJS**
- **Prisma ORM**
- **PostgreSQL**
- **OpenAI API** (function calling)
- **TypeScript**

---

## 📁 Project Structure

```
src/
├── ai/              # AI integration (isolated, validated)
│   ├── ai.service.ts
│   ├── types/
│   └── validators/
├── tasks/           # Task creation + AI orchestration
├── steps/           # Step listing & completion
├── prisma/          # Prisma service & schema
├── common/          # Shared errors & utilities
└── main.ts
```

---

## 🚀 Getting Started

### 1) Install dependencies
```bash
npm install
```

### 2) Set up environment variables
Create a `.env` file:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/maintenance_db
OPENAI_API_KEY=sk-xxxx
AI_MODE=mock
```

> `AI_MODE=mock` allows development without OpenAI billing.

---

### 3) Apply database schema
```bash
npx prisma migrate dev
npx prisma generate
```

---

### 4) Run the server
```bash
npm run start:dev
```

Server will start on:
```
http://localhost:3000
```

---

## 📌 API Overview

### Create Task (AI generates steps)
```
POST /tasks
```

```json
{
  "title": "Replace brake pads",
  "vehicleType": "Sedan"
}
```

---

### Get Task
```
GET /tasks/:id
```

---

### List Steps
```
GET /tasks/:id/steps
```

---

### Complete Step
```
POST /tasks/:id/steps/:stepId/complete
```

---

## 🤖 AI Design (Important)

AI integration is **fully isolated** from business logic:

- AI returns **data only**, never decisions
- All AI output is:
  - Schema validated
  - Length constrained
  - Order enforced
- Invalid AI responses are rejected and **never persisted**

### AI Modes

| Mode | Behavior |
|------|---------|
| `mock` | Deterministic steps for local development |
| `real` | OpenAI function calling |

---

## 🛡️ Data Safety & Consistency

- AI generation + DB writes are wrapped in a **single transaction**
- Either **everything succeeds** or **nothing is written**
- Prevents partial or corrupted state

---

## 🧪 Testing Strategy (Minimal MVP)

- Core service logic tested
- AI validator tested independently
- Endpoints verified manually (Postman)

---

## 📌 Roadmap

- Authentication
- User-specific task history
- Async AI generation
- WebSocket progress updates

---

## 📄 License

MIT License
