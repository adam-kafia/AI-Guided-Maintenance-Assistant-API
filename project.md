# AI-Guided Maintenance Assistant API (MVP)

## Project Goal
Build a backend-only **NestJS API** that demonstrates how an AI assistant can generate and manage **step-by-step maintenance workflows** using **strict backend control** and **structured AI outputs**.

This project focuses on **architecture, safety, and determinism**, not UI or conversational AI.

---

## What This Project Is
- A **production-style backend demo**
- A **controlled AI workflow** (not free-form chat)
- A showcase of:
  - NestJS modular architecture
  - Prisma + PostgreSQL data modeling
  - AI function/tool calling with structured output
  - Validation and safety boundaries

## What This Project Is Not
- No frontend
- No chatbot UI
- No generic “AI wrapper”
- No full automotive platform

Scope is intentionally narrow.

---

## Core User Flow (Locked)
1. A user creates a **maintenance task** (e.g. “Replace brake pads”)
2. The backend calls the AI to **generate structured steps**
3. The backend **validates** the AI output
4. Valid steps are **stored in the database**
5. The user retrieves steps (list or sequential)
6. The user marks steps as **completed**

MVP constraints:
- No branching flows
- No step regeneration
- No step editing

---

## AI Responsibility

### AI is responsible for:
- Generating **ordered maintenance steps**
- Providing **concise, instructional descriptions**
- Optionally including **safety warnings**

### AI is NOT responsible for:
- Writing to the database
- Managing application state
- Enforcing business rules

The backend is always the source of truth.

---

## MVP Feature Set

### Included
- Create a maintenance task
- Generate steps via AI (one-time per task)
- Persist steps
- Retrieve task and steps
- Mark steps as completed
- Validate AI output against a strict schema

### Explicitly Excluded
- Authentication / user accounts
- Frontend UI
- Editing or regenerating steps
- Multiple AI models or prompt playground
- Payments or billing

---

## Success Criteria
The MVP is complete when:
- A task can be created via API
- AI-generated steps are structured, validated, and stored
- Steps can be retrieved and marked complete
- The repository clearly demonstrates **safe AI integration**

---

## Milestones

### Milestone A — Database Ready
- Prisma configured
- PostgreSQL connected
- Initial schema and migration created

### Milestone B — CRUD Ready (No AI)
- Task and step endpoints return real DB data
- Step completion is persisted correctly

### Milestone C — AI Integration
- AI generates structured steps for a task
- Output validation and retry rules implemented
- Steps are saved atomically

### Milestone D — Polish
- README populated with real examples
- Minimal tests added
- Deployment and architecture notes included

---

## AI Safety Rules
- AI output must conform to a strict schema
- Reject invalid output (no partial writes)
- Enforce step count limits (e.g. 6–12)
- Apply defensive length limits on text fields
- Log failures with clear reasons
- Avoid sensitive data in prompts and logs
- Store only what is necessary (optionally keep a trace ID)

---

## Open Decisions
- OpenAI model selection
- Step count cap
- Whether to store raw AI responses (default: no)