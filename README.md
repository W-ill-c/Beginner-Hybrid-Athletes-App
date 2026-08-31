# Hybrid Athlete App Tracker

A monorepo (npm workspaces) with two apps:

- `apps/web` - the React + TypeScript + Vite frontend.
- `apps/server` - a Node.js + TypeScript (Express) backend, backed by a
  local SQLite database via Prisma (see `apps/server/prisma/schema.prisma`).
  Not yet wired up to the frontend - the frontend still runs entirely on its
  own local/dummy data for now.

## Running it

```sh
npm install                              # installs both workspaces, generates the Prisma client
npm run db:migrate --workspace server    # creates apps/server/prisma/dev.db and its schema
npm run db:seed --workspace server       # loads the exercise/workout/run catalogs
npm run dev:server                       # starts the backend on http://localhost:4000
npm run dev:web                          # starts the frontend on http://localhost:5173
```

The server reads its database connection from `apps/server/.env`
(`DATABASE_URL` - copy `apps/server/.env.example` to get started; the
default already points at a local `prisma/dev.db` file, so no setup beyond
copying it is needed).

## Database

SQLite via Prisma, `apps/server/prisma/schema.prisma`:

| Table              | Purpose                                                                 |
| ------------------- | ------------------------------------------------------------------------ |
| `User`              | Account + onboarding answers + when the risk disclaimer was acknowledged |
| `Exercise`           | The exercise catalog                                                    |
| `LiftingWorkout`     | A lifting workout's id/title                                            |
| `WorkoutExercise`    | Join table: a workout's ordered list of exercises                       |
| `WorkoutActivity`    | A workout's warmup/cooldown steps (ordered, one-off - not from a shared catalog) |
| `Run`                | A numbered run (1-9)                                                    |
| `RunPhase`           | One ordered segment of a run (warmup/run/walk/cooldown + duration) - lets runs mix any number/length of segments |
| `RunCompletion`      | Whether a given user has finished a given run                           |
| `ExerciseLog`        | One logged set (weight + reps) against one exercise by one user         |
| `ScheduledWorkout`   | One occurrence of a workout/run on a date for a user - modeled for a future calendar/scheduling feature, not read from yet |

Useful commands (run from `apps/server`, or append `--workspace server` from
the repo root):

```sh
npx prisma studio        # browser GUI for the database
npx prisma migrate dev   # apply schema changes (prompts for a migration name)
npx prisma db seed       # re-run the catalog seed
```

## Backend endpoints

All under `/api`:

| Method | Path                          | Purpose                                                                |
| ------ | ------------------------------ | ------------------------------------------------------------------------ |
| POST   | `/users`                      | Create a new user                                                       |
| POST   | `/auth/login`                 | Log in                                                                   |
| GET    | `/users/:id`                  | Fetch a user's details (and today's workout, if onboarded)              |
| POST   | `/users/:id/risk-acknowledgement` | Record that the user acknowledged the injury-risk disclaimer         |
| POST   | `/onboarding`                 | Submit onboarding answers; returns today's workout for the home page    |
| GET    | `/runs`                       | The numbered running plan (warmup/run/walk/cooldown per run); pass `?userId=` to include completion state |
| POST   | `/runs/:id/complete`          | Mark a run complete for a user                                          |
| GET    | `/workouts`                   | All lifting workouts                                                    |
| PUT    | `/workouts/:id`                | Replace a workout's exercises and warmup/cooldown steps                 |
| GET    | `/exercises`                  | The exercise catalog                                                    |
| GET    | `/exercises/:id/logs`         | A user's logged sets for one exercise (`?userId=` required)             |
| POST   | `/exercises/:id/logs`         | Log a set (weight + reps) against one exercise for a user               |

## Building

```sh
npm run build:web
npm run build:server
```
