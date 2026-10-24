# Notebook API

REST API for a personal notebook app. Users keep private notes and publish public posts. Admins manage users and can read every note.

| Role | Can do |
|---|---|
| User | Register, log in, create / read / update / delete their own notes, publish posts, edit their profile |
| Admin | Everything a user can, plus add / list / update / delete users, list every note, see users grouped by interest |

**Live:** https://`<render-url>`/api/health

> The API runs on a free Render instance. After a period of inactivity the first request can take up to a minute while it wakes up.

## Tech stack

| Area | Choice |
|---|---|
| Runtime | Node.js 20+, Express 4, TypeScript |
| Database | MongoDB with Mongoose |
| Auth | JWT, passwords hashed with bcrypt (cost 12) |
| Validation | Zod |
| Hardening | Helmet, CORS allow-list |

## Project structure

```
src/
  config/        env validation, database connection
  middlewares/   authenticate, authorize (roles), central error handler
  modules/       auth, users, notes, posts, admin
                 each with model, schema (validation), service, controller, routes
  scripts/       seed-admin, seed-sample, check-indexes
  utils/         token, pagination, async handler, shared validators
```

## Setup

Requirements: Node.js 20+ and a MongoDB database (a free MongoDB Atlas cluster is enough; allow your IP in Network Access).

```bash
git clone https://github.com/mehedihasansebd/notebook-api.git
cd notebook-api
npm install
cp .env.example .env
```

Fill in `.env`:

| Variable | Description |
|---|---|
| `PORT` | Port to listen on (default `5000`) |
| `MONGO_URI` | Connection string, including the database name (`.../notebook?...`) |
| `JWT_SECRET` | Long random string used to sign tokens |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `1d` |
| `CLIENT_URL` | Allowed frontend origin(s), comma separated, e.g. `http://localhost:4200` |
| `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Used only by `npm run seed:admin` |

Generate a secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Create the first admin and optional demo data, then start the server:

```bash
npm run seed:admin     # admin from the ADMIN_* variables, safe to re-run
npm run seed:sample    # optional: 6 users, 18 notes, 12 posts
npm run dev            # http://localhost:5000
```

Demo users created by `seed:sample` all use the password `Password123`:
`ayesha@example.com`, `tanvir@example.com`, `nusrat@example.com`, `imran@example.com`, `farzana@example.com`, `sabbir@example.com`.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start with auto-reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled build |
| `npm run seed:admin` | Create the admin user |
| `npm run seed:sample` | Insert demo users, notes and posts |
| `npm run check:indexes` | Show which index each key query uses |

## API

Every list is paginated: `?page=1&limit=10` (limit max 50). Responses look like `{ "data": [...], "meta": { "total", "page", "limit", "totalPages" } }`.
Protected routes need `Authorization: Bearer <token>`.

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/api/health` | public | Liveness check |
| POST | `/api/auth/register` | public | Create an account |
| POST | `/api/auth/login` | public | Get a token |
| GET | `/api/auth/me` | user | Current profile |
| PATCH | `/api/users/me` | user | Update own name and interests |
| GET | `/api/users/:id/posts` | public | Posts of one user (`$lookup`) |
| POST | `/api/notes` | user | Create a note |
| GET | `/api/notes` | user | List own notes |
| GET | `/api/notes/:id` | owner / admin | Read a note (admins can read any) |
| PATCH | `/api/notes/:id` | owner | Update a note |
| DELETE | `/api/notes/:id` | owner | Delete a note |
| GET | `/api/posts` | public | List posts |
| GET | `/api/posts/:id` | public | Read a post |
| POST | `/api/posts` | user | Publish a post |
| GET | `/api/admin/users` | admin | List users |
| POST | `/api/admin/users` | admin | Create a user |
| GET | `/api/admin/users/:id` | admin | Read a user |
| PATCH | `/api/admin/users/:id` | admin | Update a user |
| DELETE | `/api/admin/users/:id` | admin | Delete a user with their notes and posts |
| GET | `/api/admin/users/by-interests` | admin | Users grouped by interest (`?interest=chess` to filter) |
| GET | `/api/admin/notes` | admin | Every note (`?owner=<userId>` to filter) |

## Indexes

All indexes are declared with `schema.index()` in the model files. Nothing else is indexed.

| Collection | Index | Serves |
|---|---|---|
| users | `{ email: 1 }` unique | login, duplicate-email check |
| users | `{ interests: 1 }` | filtering users by interest |
| notes | `{ owner: 1, _id: -1 }` | a user's notes, newest first, paginated |
| posts | `{ author: 1, _id: -1 }` | the `$lookup` join, per-author posts |

Single-document reads (profile, one note, one post) use the default `_id` index. Every list is sorted by `_id` descending, which is newest first, so no `createdAt` index is needed.

## Aggregations

- **Users grouped by interest** (`GET /api/admin/users/by-interests`): one `User.aggregate()` call with `$unwind`, `$group`, `$sort` and `$facet` (paging and total in the same call). With `?interest=` the first stage is a `$match` served by the `interests` index.
- **Posts of one user** (`GET /api/users/:id/posts`): one pipeline with `$match` on the user and a `$lookup` into `posts`, joined on `author` through the posts index.

## Verify everything

Start the API with the admin and demo data seeded, then run these checks. `ADMIN_EMAIL` and `ADMIN_PASSWORD` are the values from your `.env`.

```bash
API=http://localhost:5000/api
login() { curl -s -X POST $API/auth/login -H "Content-Type: application/json" \
  -d "{\"email\":\"$1\",\"password\":\"$2\"}" | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])"; }

ADMIN_TOKEN=$(login "$ADMIN_EMAIL" "$ADMIN_PASSWORD")
USER_TOKEN=$(login ayesha@example.com Password123)
```

| # | Check | Command | Expected |
|---|---|---|---|
| 1 | Health | `curl $API/health` | `{"status":"ok",...}` |
| 2 | Register | `curl -X POST $API/auth/register -H "Content-Type: application/json" -d '{"name":"Test User","email":"test@example.com","password":"secret123","interests":["chess"]}'` | 201 with `token`, no password in the user |
| 3 | Wrong password | login with a bad password | 401 `Invalid email or password` |
| 4 | Create a note | `curl -X POST $API/notes -H "Authorization: Bearer $USER_TOKEN" -H "Content-Type: application/json" -d '{"title":"Hello","content":"First note"}'` | 201 with the note |
| 5 | Notes pagination | `curl "$API/notes?page=1&limit=2" -H "Authorization: Bearer $USER_TOKEN"` | 2 items, newest first, `meta.totalPages` set |
| 6 | Isolation | take another user's note id from check 11, then `GET $API/notes/<id>` with `$USER_TOKEN` | 404 |
| 7 | Admin reads any note | same request with `$ADMIN_TOKEN` | 200 |
| 8 | Owner-only edit | `PATCH $API/notes/<that id>` with `$ADMIN_TOKEN` | 404 |
| 9 | Role guard | `curl $API/admin/users -H "Authorization: Bearer $USER_TOKEN"` | 403 |
| 10 | List users | `curl "$API/admin/users?page=1&limit=3" -H "Authorization: Bearer $ADMIN_TOKEN"` | 3 users and `meta` |
| 11 | Every note | `curl "$API/admin/notes?limit=3" -H "Authorization: Bearer $ADMIN_TOKEN"` | notes with `owner` name and email |
| 12 | Manage users | `POST $API/admin/users` (name, email, password, role), `PATCH $API/admin/users/<id>` with `{"role":"admin"}`, `DELETE $API/admin/users/<id>` | 201, 200, 204 |
| 13 | No self-delete | `DELETE` your own admin id | 400 |
| 14 | Public posts | `curl "$API/posts?limit=3"` (no token) | posts with author name |
| 15 | `$lookup` | `curl "$API/users/<userId>/posts"` (no token) | the user and their posts |
| 16 | Group by interest | `curl $API/admin/users/by-interests -H "Authorization: Bearer $ADMIN_TOKEN"` | groups with `interest`, `count`, `users` |
| 17 | Filter | add `?interest=chess` | only the chess group |
| 18 | Validation | `curl $API/notes/abc -H "Authorization: Bearer $USER_TOKEN"` and `curl "$API/notes?limit=500" -H "Authorization: Bearer $USER_TOKEN"` | 400 both times |
| 19 | Indexes | `npm run check:indexes` | every line says `IXSCAN`, none `COLLSCAN` |

In MongoDB Atlas (Browse Collections, Indexes tab) the indexes from the table above should be listed: `email_1`, `interests_1`, `owner_1__id_-1`, `author_1__id_-1`, plus the default `_id_`.