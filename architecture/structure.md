This doc defines:
- DTOs per endpoint (request/response shapes)
- What each module/class is responsible for
- The contract between the app and the AI layer

Goal: make implementation straightforward and consistent.

---

## 1) DTOs (Data Transfer Objects)

### Create Task
Endpoint: `POST /tasks`

**CreateTaskRequestDto**
- `title: string` (required, 5–120 chars)
- `vehicleType?: string` (optional, max 40 chars)

**CreateTaskResponseDto**
- `id: string`
- `title: string`
- `vehicleType?: string`
- `status: "PENDING" | "STEPS_GENERATED" | "COMPLETED"`
- `createdAt: string` (ISO)
- `updatedAt: string` (ISO)

Errors:
- `INVALID_INPUT`
- `AI_OUTPUT_INVALID`
- `AI_PROVIDER_ERROR`

---

### Get Task
Endpoint: `GET /tasks/:id`

**GetTaskResponseDto**
- `id, title, vehicleType?, status, createdAt, updatedAt`

Errors:
- `TASK_NOT_FOUND`

---

### List Steps
Endpoint: `GET /tasks/:id/steps`

**ListStepsResponseDto**
- `taskId: string`
- `count: number`
- `steps: StepItemDto[]`

**StepItemDto**
- `id: string`
- `order: number`
- `title: string`
- `description: string`
- `safetyWarning?: string | null`
- `completedAt?: string | null`

Errors:
- `TASK_NOT_FOUND`

---

### Get Step
Endpoint: `GET /tasks/:id/steps/:stepId`

**GetStepResponseDto**
- `id: string`
- `taskId: string`
- `order: number`
- `title: string`
- `description: string`
- `safetyWarning?: string | null`
- `completedAt?: string | null`

Errors:
- `TASK_NOT_FOUND`
- `STEP_NOT_FOUND`

---

### Complete Step
Endpoint: `POST /tasks/:id/steps/:stepId/complete`

**CompleteStepResponseDto**
- `id: string`
- `completedAt: string` (ISO)

Errors:
- `TASK_NOT_FOUND`
- `STEP_NOT_FOUND`
- `STEP_ALREADY_COMPLETED`

---

### Uncomplete Step (Optional)
Endpoint: `POST /tasks/:id/steps/:stepId/uncomplete`

**UncompleteStepResponseDto**
- `id: string`
- `completedAt: null`

Errors:
- `TASK_NOT_FOUND`
- `STEP_NOT_FOUND`
- `STEP_NOT_COMPLETED`

---

## 2) Validation Rules (centralize these)

### Request validation
- `title`: required, trim, 5–120
- `vehicleType`: optional, trim, max 40

### AI step validation
- step count: 6–12
- `order`: sequential starting from 1
- `title`: 3
# Step 4 — DTOs, Module Responsibilities, and AI Contract (MVP)

This document turns the API spec into implementation-ready structure:
- DTOs per endpoint (request/response)
- Clear responsibility split (Controller vs Service vs AI layer)
- AI output contract + validation rules

---

## Module Boundaries (Keep It Clean)

### `TasksModule`
Owns:
- Creating a task
- Orchestrating step generation (calls AI layer)
- Updating task status

Does **not** own:
- Step completion logic (belongs to StepsModule)

### `StepsModule`
Owns:
- Listing steps for a task
- Getting a step
- Completing/uncompleting a step
- Determining when a task becomes `COMPLETED` (optional rule)

### `AiModule`
Owns:
- Calling the AI provider
- Returning structured output only
- No DB access, no Prisma calls, no business rules

### `PrismaModule`
Owns:
- PrismaClient lifecycle and reuse
- Exposes Prisma service to other modules

### `Common/`
Owns:
- Error format + error codes
- Validation helpers / limits
- Exception filters (global)

---

## Controller vs Service Responsibilities

### Controllers (Thin)
Controllers should:
- Validate input (DTO/class-validator)
- Parse params (id/stepId)
- Call service methods
- Return response DTOs

Controllers should NOT:
- Call Prisma directly
- Contain orchestration logic
- Contain AI calls

### Services (Business Logic)
Services should:
- Orchestrate DB operations
- Enforce business rules
- Translate between DB models and response DTOs
- Ensure atomic operations (transaction when needed)

---

## DTOs (Requests / Responses)

> Notes:
> - IDs are strings (Mongo ObjectId) at API boundary.
> - Dates are ISO strings in responses.
> - Keep DTOs stable; internal Prisma types can evolve separately.

### 1) Create Task & Generate Steps — `POST /tasks`

#### Request DTO: `CreateTaskDto`
Fields:
- `title` (string, required, 5–120 chars)
- `vehicleType` (string, optional, max 40 chars)

#### Response DTO: `TaskResponseDto`
Fields:
- `id` (string)
- `title` (string)
- `vehicleType` (string | null)
- `status` (`PENDING` | `STEPS_GENERATED` | `COMPLETED`)
- `createdAt` (ISO string)
- `updatedAt` (ISO string)

#### Behavior rules
- Create task with status `PENDING`
- Call AI to generate steps
- Validate AI output
- Insert steps
- Update task status to `STEPS_GENERATED`
- If AI fails or output invalid: return error and do not save partial steps

---

### 2) Get Task — `GET /tasks/:id`

#### Response DTO: `TaskResponseDto` (same as above)

---

### 3) List Steps — `GET /tasks/:id/steps`

#### Response DTO: `TaskStepsResponseDto`
Fields:
- `taskId` (string)
- `count` (number)
- `steps` (array of `StepResponseDto`)

#### Step DTO: `StepResponseDto`
Fields:
- `id` (string)
- `order` (number)
- `title` (string)
- `description` (string)
- `safetyWarning` (string | null)
- `completedAt` (ISO string | null)

---

### 4) Get Step — `GET /tasks/:id/steps/:stepId`

#### Response DTO: `StepDetailResponseDto`
Fields:
- `id`, `taskId`, `order`, `title`, `description`, `safetyWarning`, `completedAt`

---

### 5) Complete Step — `POST /tasks/:id/steps/:stepId/complete`

#### Response DTO: `StepCompletionResponseDto`
Fields:
- `id` (string)
- `completedAt` (ISO string)

#### Behavior rules
- If already completed: return `409 STEP_ALREADY_COMPLETED`
- Otherwise set `completedAt = now()`
- Optional: if all steps completed → update task status to `COMPLETED`

---

### 6) Uncomplete Step (Optional) — `POST /tasks/:id/steps/:stepId/uncomplete`

#### Response DTO: `StepCompletionResponseDto`
Fields:
- `id` (string)
- `completedAt` (null)

#### Behavior rules
- If not completed: return `409 STEP_NOT_COMPLETED`
- Otherwise set `completedAt = null`
- Optional: if task was `COMPLETED` and now not all steps completed → set task status back to `STEPS_GENERATED`

---

## Error Handling Contract

All errors should follow:

```json
{
  "error": {
    "code": "TASK_NOT_FOUND",
    "message": "Task not found",
    "details": {}
  }
}
```

### Recommended error codes
- `INVALID_INPUT` (400)
- `TASK_NOT_FOUND` (404)
- `STEP_NOT_FOUND` (404)
- `STEP_ALREADY_COMPLETED` (409)
- `STEP_NOT_COMPLETED` (409)
- `AI_PROVIDER_ERROR` (502)
- `AI_OUTPUT_INVALID` (422)
- `INTERNAL_ERROR` (500)

---

## AI Contract (Structured Output)

### AI Input
- `title` (task title)
- optional `vehicleType`
- optional constraints (step count range, brevity, safety emphasis)

### AI Output Schema (what you validate)
- `steps`: array of objects
  - `order`: number (1..N)
  - `title`: string (3–80 chars)
  - `description`: string (20–500 chars)
  - `safetyWarning`: optional string (<=160 chars)

### AI Validation Rules (must enforce)
- step count between 6 and 12
- orders are sequential starting at 1
- no empty strings, enforce max lengths
- reject unknown fields (optional but ideal)
- on validation failure: throw `AI_OUTPUT_INVALID` and do not write steps

### Retry Strategy (simple MVP)
- 1 retry if provider error/timeouts
- no retry for invalid schema unless you explicitly re-prompt (optional)

---

## Implementation Checklist (in order)
1. Create DTO files per endpoint
2. Implement TasksService orchestration (create task → generate steps → persist)
3. Implement StepsService (list/get/complete/uncomplete)
4. Add global exception filter for error format
5. Add AI validator (schema + defensive limits)

---

## Definition of Done for Step 4
- DTOs defined (names + fields)
- Module responsibilities are clear
- AI output contract is written and validation rules are explicit
