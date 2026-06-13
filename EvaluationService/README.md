# EvaluationService

`EvaluationService` is the asynchronous judge. It consumes submission jobs from Redis, runs submitted code against the problem test cases inside Docker containers, computes the final verdict, and updates `SubmissionService`.

## Responsibilities

- Start BullMQ workers
- Consume jobs from `submissionQueue`
- Run user code inside isolated Docker containers
- Compare program output against expected test case output
- Derive final verdicts
- Push verdicts back to `SubmissionService`

## Tech Stack

- Node.js
- TypeScript
- Express 5
- Redis
- BullMQ
- Docker via `dockerode`
- Axios
- Winston

## Default Runtime Configuration

The service loads environment variables from `.env`.

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `3002` | HTTP port |
| `SUBMISSION_SERVICE` | `http://localhost:3001/api/v1` | Callback base URL for status updates |
| `PROBLEM_SERVICE` | `http://localhost:3000/api/v1` | Reserved service reference in config |
| `REDIS_HOST` | `localhost` | Redis host |
| `REDIS_PORT` | `6379` | Redis port |
| `DOCKER_SOCKET` | `/var/run/docker.sock` | Docker socket path used for image access checks |

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env`:

```bash
PORT=3002
SUBMISSION_SERVICE=http://localhost:3001/api/v1
PROBLEM_SERVICE=http://localhost:3000/api/v1
REDIS_HOST=localhost
REDIS_PORT=6379
DOCKER_SOCKET=/var/run/docker.sock
```

3. Ensure Docker is available to the process.

4. Start the service:

```bash
npm run dev
```

On startup the service:

- starts the BullMQ worker
- attempts to pull required Docker images
- exits if image pull requirements fail

## API Surface

Base path: `/api/v1`

### Health

- `GET /ping`
- `GET /ping/health`

The service does not expose submission-management endpoints. Its main job is background processing.

## Evaluation Flow

1. A worker subscribes to `submissionQueue`.
2. Each job contains the submission ID, code, language, and the full problem payload including test cases.
3. For every test case, the worker runs the submitted code in a Docker container.
4. The worker compares actual output with expected output.
5. Per-test results are mapped to:
   - `AC`
   - `WA`
   - `TLE`
   - `Error`
6. A final verdict is derived with priority:
   - `time_limit_exceeded`
   - `wrong_answer`
   - `accepted`
7. The worker updates `SubmissionService` through `PUT /submissions/:id`.

## Language Runtime Configuration

Configured language limits:

| Language | Docker Image | Timeout |
| --- | --- | --- |
| `python` | `python:3.8-slim` | `4000ms` |
| `cpp` | `gcc:latest` | `1000ms` |

## Container Isolation Model

Containers are created with the following restrictions:

- memory limit
- process limit (`PidsLimit`)
- CPU quota
- `no-new-privileges`
- `NetworkMode: "none"`

This is the project’s main safety boundary during code execution.

## Docker Compose

The service includes a local `docker-compose.yml` that mounts the Docker socket into the container so the worker can create sibling execution containers.

## Logging

Logs go to:

- Console
- `logs/%DATE%-app.log`

## Current Implementation Notes

- Startup currently pulls only `python:3.8-slim`, even though C++ execution is configured with `gcc:latest`. C++ may require a manual image pull unless startup logic is extended.
- The code runner injects source code and input through shell commands built with `echo`, which is simple but fragile for quotes and shell-sensitive payloads.
- Final verdict mapping treats runtime execution failures as `wrong_answer`.
- `/api/v2` exists but has no routes yet.
