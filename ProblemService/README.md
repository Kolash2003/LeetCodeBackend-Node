# ProblemService

`ProblemService` is the catalog service for the platform. It stores LeetCode-style problem statements, difficulty, optional editorial content, and the test cases used later by the evaluation pipeline.

## Responsibilities

- Expose CRUD APIs for coding problems
- Store problem metadata and test cases in MongoDB
- Sanitize markdown-based `description` and `editorial` fields before persistence
- Provide problem details to `SubmissionService` during submission intake

## Tech Stack

- Node.js
- TypeScript
- Express 5
- MongoDB with Mongoose
- Zod for request validation
- Winston with daily rotating log files

## Default Runtime Configuration

The service loads environment variables from `.env`.

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `3000` | HTTP port |
| `DB_URL` | `mongodb://localhost:27017/lc_problem_db` | MongoDB connection string |

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env`:

```bash
PORT=3000
DB_URL=mongodb://localhost:27017/lc_problem_db
```

3. Start the service:

```bash
npm run dev
```

The server connects to MongoDB on startup.

## API Surface

Base path: `/api/v1`

### Health

- `GET /ping`
- `GET /ping/health`

### Problems

- `POST /problems`
- `GET /problems`
- `GET /problems/:id`
- `PUT /problems/:id`
- `DELETE /problems/:id`
- `GET /problems/difficulty/:difficulty`
- `GET /problems/search/:query`

## Problem Payload Shape

```json
{
  "title": "Two Sum",
  "description": "Given an array of integers...",
  "difficulty": "easy",
  "editorial": "Use a hash map.",
  "testcases": [
    {
      "input": "4\n2 7 11 15\n9",
      "output": "0 1"
    }
  ]
}
```

## Data Model

Each problem document contains:

- `title`
- `description`
- `difficulty`: `easy | medium | hard`
- `editorial`
- `testcases[]`
- `createdAt`
- `updatedAt`

Indexes defined in code:

- Unique index on `title`
- Secondary index on `difficulty`

## Request Flow

1. Express receives JSON requests.
2. A correlation ID is attached with `AsyncLocalStorage`.
3. Zod validates request bodies or params where middleware is applied.
4. `ProblemService` sanitizes markdown content.
5. `ProblemRepository` persists and fetches data through Mongoose.
6. Errors are returned through shared error middleware.

## Markdown Sanitization

Before saving a problem:

- Markdown is converted to HTML with `marked`
- HTML is sanitized with `sanitize-html`
- Sanitized HTML is converted back to markdown with `turndown`

This reduces the chance of persisting unsafe HTML in descriptions or editorials.

## Logging

Logs go to:

- Console
- `logs/%DATE%-app.log`

Each log entry includes a correlation ID where available.

## Current Implementation Notes

- `GET /problems/search/:query` is registered with a path parameter, but the controller currently reads `req.query.q`. As written, searches will not use `:query` unless that controller is corrected.
- `POST /problems` allows `testcases` to be optional at validation layer, but the Mongoose schema requires them. Invalid payloads will fail at persistence time rather than validation time.
- `PUT /problems/:id` is not currently protected by a request-body validator.
- `/api/v2` exists but has no routes yet.
