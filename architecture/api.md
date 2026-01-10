# API Specification — AI-Guided Maintenance Assistant (MVP)

This document defines the HTTP API contract for the MVP.
The backend is authoritative — all AI output is validated before persistence.

---

## Domain Overview

### Task
Represents a maintenance request (e.g. “Replace brake pads”).

### Step
An ordered instruction generated for a task.

### Task Status
- `PENDING` — task created, steps not generated
- `STEPS_GENERATED` — steps generated and stored
- `COMPLETED` — all steps completed

---

## Create Task & Generate Steps
### POST /tasks

Creates a task and generates maintenance steps via AI.

#### Request
```json
{
  "title": "Replace brake pads",
  "vehicleType": "Sedan"
}
```

#### Response — 201
```json
{
  "id": "TASK_ID",
  "title": "Replace brake pads",
  "vehicleType": "Sedan",
  "status": "STEPS_GENERATED",
  "createdAt": "2026-01-09T10:00:00.000Z",
  "updatedAt": "2026-01-09T10:00:10.000Z"
}
```

#### Errors
- 400 INVALID_INPUT
- 422 AI_OUTPUT_INVALID
- 502 AI_PROVIDER_ERROR
- 500 INTERNAL_ERROR

---

## Get Task
### GET /tasks/:id

#### Response — 200
```json
{
  "id": "TASK_ID",
  "title": "Replace brake pads",
  "vehicleType": "Sedan",
  "status": "STEPS_GENERATED",
  "createdAt": "2026-01-09T10:00:00.000Z",
  "updatedAt": "2026-01-09T10:00:10.000Z"
}
```

#### Errors
- 404 TASK_NOT_FOUND

---

## List Steps for Task
### GET /tasks/:id/steps

#### Response — 200
```json
{
  "taskId": "TASK_ID",
  "count": 8,
  "steps": [
    {
      "id": "STEP_ID",
      "order": 1,
      "title": "Prepare tools and secure vehicle",
      "description": "Park on level ground and gather all required tools.",
      "safetyWarning": "Use jack stands when lifting the vehicle.",
      "completedAt": null
    }
  ]
}
```

#### Errors
- 404 TASK_NOT_FOUND

---

## Get Step
### GET /tasks/:id/steps/:stepId

#### Response — 200
```json
{
  "id": "STEP_ID",
  "taskId": "TASK_ID",
  "order": 3,
  "title": "Remove the wheel",
  "description": "Loosen lug nuts and remove the wheel carefully.",
  "safetyWarning": null,
  "completedAt": null
}
```

#### Errors
- 404 TASK_NOT_FOUND
- 404 STEP_NOT_FOUND

---

## Complete Step
### POST /tasks/:id/steps/:stepId/complete

Marks a step as completed.

#### Response — 200
```json
{
  "id": "STEP_ID",
  "completedAt": "2026-01-09T10:12:00.000Z"
}
```

#### Errors
- 404 TASK_NOT_FOUND
- 404 STEP_NOT_FOUND
- 409 STEP_ALREADY_COMPLETED

---

## Uncomplete Step (Optional)
### POST /tasks/:id/steps/:stepId/uncomplete

Reverts a completed step.

#### Response — 200
```json
{
  "id": "STEP_ID",
  "completedAt": null
}
```

#### Errors
- 404 TASK_NOT_FOUND
- 404 STEP_NOT_FOUND
- 409 STEP_NOT_COMPLETED

---

## Automatic Task Completion

When all steps for a task have `completedAt != null`,
the task status is automatically updated to `COMPLETED`.

---

## Error Response Format
```json
{
  "error": {
    "code": "AI_OUTPUT_INVALID",
    "message": "AI returned steps that did not match the expected schema",
    "details": {
      "reason": "missing field: steps[2].title"
    }
  }
}
```

---

## Validation Rules (MVP)

- title: required, 5–120 characters
- vehicleType: optional, max 40 characters
- AI step count: 6–12
- step.order: must be sequential starting at 1
- step.title: 3–80 characters
- step.description: 20–500 characters
- safetyWarning: optional, max 160 characters

---

## Notes

- AI is used only for step generation.
- AI output is never trusted without validation.
- No step editing or regeneration in MVP.
