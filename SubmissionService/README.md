# SubmissionService

`SubmissionService` accepts code submissions, persists them, validates that the referenced problem exists, and pushes evaluation jobs to Redis/BullMQ for asynchronous execution by `EvaluationService`.

## Responsibilities

- Accept new submissions through HTTP
- Validate language and required fields
- Verify the problem exists by calling `ProblemService`
- Persist submissions in MongoDB
- Publish evaluation jobs to the shared Redis queue
- Expose APIs to fetch, delete, and update submission state

## Tech Stack

- Node.js
- TypeScript
- Express 5
- MongoDB with Mongoose
- Redis
- BullMQ
- Axios
- Zod
- Winston

## Default Runtime Configuration

The service loads environment variables from `.env`.

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `3001` | HTTP port |
| `DB_URI` | `mongodb://localhost:27017/lc_submission_db` | MongoDB connection string |
| `PROBLEM_SERVICE` | `http://localhost:3000/api/v1` | Base URL used to fetch problem details |
| `REDIS_HOST` | `localhost` | Redis host |
| `REDIS_PORT` | `6379` | Redis port |

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env`:

```bash
PORT=3001
DB_URI=mongodb://localhost:27017/lc_submission_db
PROBLEM_SERVICE=http://localhost:3000/api/v1
REDIS_HOST=localhost
REDIS_PORT=6379
```

3. Start the service:

```bash
npm run dev
```

Make sure MongoDB, Redis, and `ProblemService` are already reachable.

## API Surface

Base path: `/api/v1`

### Health

- `GET /ping`
- `GET /ping/health`

### Submissions

- `POST /submissions`
- `GET /submissions/:id`
- `GET /submissions/problem/:problemId`
- `PUT /submissions/:id`
- `DELETE /submissions/:id`

## Create Submission Payload

```json
{
  "problemId": "684c1234567890abcdef1234",
  "code": "print(sum(map(int, input().split())))",
  "language": "python"
}
```

Supported languages:

- `python`
- `cpp`

## Submission States

Defined statuses:

- `pending`
- `accepted`
- `wrong_answer`
- `time_limit_exceeded`

Each submission also stores `submissionData`, which is updated by the evaluation pipeline with final output details.

## Submission Lifecycle

1. Request validation checks `problemId`, `code`, and `language`.
2. The service calls `ProblemService` to fetch the referenced problem and test cases.
3. A submission is stored in MongoDB with default status `pending`.
4. A BullMQ job is added to the `submissionQueue` queue in Redis.
5. `EvaluationService` consumes the job and later calls back into this service.
6. `PUT /submissions/:id` updates the status and `submissionData`.

## Queue Contract

Jobs published to Redis contain:

```json
{
  "submissionId": "submission-document-id",
  "problem": {
    "id": "problem-id",
    "title": "Problem title",
    "difficulty": "easy",
    "testcases": []
  },
  "code": "user submission",
  "language": "python"
}
```

Queue name: `submissionQueue`

## Data Model

Each submission document contains:

- `problemId`
- `code`
- `language`
- `status`
- `submissionData`
- `createdAt`
- `updatedAt`

Index defined in code:

- `{ status: 1, createdAt: -1 }`

## Logging

Logs go to:

- Console
- `logs/%DATE%-app.log`

Correlation IDs are attached per request for traceability.

## Current Implementation Notes

- `GET /submissions/problem/:problemId` is wired to a controller that currently reads `req.params.id`, so the filter path and controller parameter are inconsistent.
- The update schema mentions statuses like `compiling` and `running` in its error message, but the actual enum only supports `pending`, `accepted`, `wrong_answer`, and `time_limit_exceeded`.
- `/api/v2` exists but has no routes yet.
