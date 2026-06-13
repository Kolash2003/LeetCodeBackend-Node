# LeetcodeBackend

This repository contains a small LeetCode-style backend split into three Node.js microservices:

- `ProblemService`
- `SubmissionService`
- `EvaluationService`

Together they provide problem management, submission intake, asynchronous judging, and verdict persistence.

## Architecture

### Services

- `ProblemService`
  - Owns coding problems and test cases
  - Stores data in MongoDB
  - Sanitizes markdown content before persistence
- `SubmissionService`
  - Accepts user code submissions
  - Verifies the referenced problem through `ProblemService`
  - Stores submissions in MongoDB
  - Publishes jobs to Redis/BullMQ
- `EvaluationService`
  - Consumes queued submission jobs
  - Runs code in Docker containers
  - Compares outputs against test cases
  - Pushes verdicts back to `SubmissionService`

### Infrastructure

- MongoDB
  - One database for problems
  - One database for submissions
- Redis
  - Shared queue transport between submission and evaluation services
- Docker
  - Sandboxed code execution in the evaluation layer

## End-to-End Flow

1. A problem is created in `ProblemService`.
2. A client submits code to `SubmissionService` with `problemId`, `code`, and `language`.
3. `SubmissionService` fetches the problem definition from `ProblemService`.
4. The submission is saved with status `pending`.
5. A BullMQ job is pushed to Redis queue `submissionQueue`.
6. `EvaluationService` consumes the job.
7. The submitted code is run once per test case inside Docker.
8. `EvaluationService` computes a final verdict.
9. `EvaluationService` calls back to `SubmissionService` to update the submission record.

## Repository Layout

```text
.
├── ProblemService
├── SubmissionService
└── EvaluationService
```

Each service is independently installable and runnable.

## Ports and Defaults

| Service | Default Port | Key Dependencies |
| --- | --- | --- |
| `ProblemService` | `3000` | MongoDB |
| `SubmissionService` | `3001` | MongoDB, Redis, ProblemService |
| `EvaluationService` | `3002` | Redis, Docker, SubmissionService |

## Suggested Local Startup Order

1. Start MongoDB
2. Start Redis
3. Start `ProblemService`
4. Start `SubmissionService`
5. Start `EvaluationService`

## Minimal Local Setup

Install dependencies inside each service:

```bash
cd ProblemService && npm install
cd ../SubmissionService && npm install
cd ../EvaluationService && npm install
```

Create `.env` files for each service using the defaults documented in the service-specific README files.

Run the services in separate terminals:

```bash
cd ProblemService && npm run dev
cd SubmissionService && npm run dev
cd EvaluationService && npm run dev
```

## Service Documentation

- [ProblemService README](./ProblemService/README.md)
- [SubmissionService README](./SubmissionService/README.md)
- [EvaluationService README](./EvaluationService/README.md)

## API Summary

### ProblemService

- `POST /api/v1/problems`
- `GET /api/v1/problems`
- `GET /api/v1/problems/:id`
- `PUT /api/v1/problems/:id`
- `DELETE /api/v1/problems/:id`
- `GET /api/v1/problems/difficulty/:difficulty`
- `GET /api/v1/problems/search/:query`

### SubmissionService

- `POST /api/v1/submissions`
- `GET /api/v1/submissions/:id`
- `GET /api/v1/submissions/problem/:problemId`
- `PUT /api/v1/submissions/:id`
- `DELETE /api/v1/submissions/:id`

### EvaluationService

- `GET /api/v1/ping`
- `GET /api/v1/ping/health`

## Cross-Service Contracts

### Submission job payload

`SubmissionService` publishes jobs shaped like:

```json
{
  "submissionId": "string",
  "problem": {
    "id": "string",
    "title": "string",
    "description": "string",
    "difficulty": "easy",
    "editorial": "string",
    "testcases": [
      {
        "input": "string",
        "output": "string"
      }
    ]
  },
  "code": "string",
  "language": "python"
}
```

### Submission update callback

`EvaluationService` updates `SubmissionService` with:

```json
{
  "status": "accepted",
  "submissionData": {
    "status": "accepted",
    "output": ["AC", "AC"]
  }
}
```

## Logging and Traceability

All three services:

- generate a correlation ID per request
- use `AsyncLocalStorage` to make it available to logs
- write logs to console and rotating log files under `logs/`

## Current Gaps and Caveats

- There is no shared root-level orchestration for all services; only `EvaluationService` includes a `docker-compose.yml`.
- `ProblemService` and `SubmissionService` each expose an empty `/api/v2` router.
- `ProblemService` search routing and `SubmissionService` problem-filter routing have parameter mismatches in controller usage.
- `EvaluationService` is configured for both Python and C++, but startup image pre-pull currently covers Python only.
- No automated tests are present in the repository at the moment.

## Notes for Future Improvement

1. Add a root `docker-compose.yml` for MongoDB, Redis, and all three services.
2. Normalize environment variable names, especially `DB_URL` vs `DB_URI`.
3. Fix route/controller mismatches and validate all update endpoints.
4. Add integration tests for the full submission-to-verdict flow.
5. Harden code execution input handling beyond shell `echo` injection.
