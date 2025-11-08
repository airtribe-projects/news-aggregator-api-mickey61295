# News Aggregator API

A simple personalized news aggregator REST API built with Node.js and Express. It demonstrates:

- User registration and login with bcrypt password hashing
- JWT-based authentication for protected routes
- User preferences (categories) and per-user read/favorite tracking
- External news provider integration (NewsAPI.org) via axios
- Simple in-memory caching of fetched news and a background cache refresher
- Input validation and error handling

This project is a guided assignment to practice building RESTful APIs and related concepts.

---

## Quick start

Prerequisites: Node.js 18+ and npm

1. Install dependencies

```bash
npm install
```

2. (Optional) Set environment variables. Create an API key at https://newsapi.org and set it along with a JWT secret:

Windows (cmd.exe):

```cmd
set NEWS_API_KEY=your_newsapi_key_here
set JWT_SECRET=your_jwt_secret_here
node app.js
```

PowerShell:

```powershell
$env:NEWS_API_KEY="your_newsapi_key_here"
$env:JWT_SECRET="your_jwt_secret_here"
node app.js
```

If you don't set `NEWS_API_KEY`, the server will run and return an empty news list with a warning (useful for local development and tests).

3. Start the server

```bash
node app.js
```

4. Run tests

```bash
npm test
```

---

## Environment variables

- `NEWS_API_KEY` — API key for the external news provider (optional for local dev; required for live news)
- `JWT_SECRET` — secret used to sign JWTs (recommended to set in production)
- `PORT` — optional server port (default: 3000)

---

## API Endpoints

Base URL: `http://localhost:3000`

All responses are JSON. Protected routes require an `Authorization` header with the format:

```
Authorization: Bearer <token>
```

### Authentication

- POST `/users/signup`
  - Body: `{ name, email, password, preferences? }`
  - Validation: email format, password minimum 8 chars, preferences must be an array of strings
  - Success: `200 { message: 'user created' }`

- POST `/users/login`
  - Body: `{ email, password }`
  - Success: `200 { token: '<jwt>' }`

### Preferences

- GET `/users/preferences` (protected)
  - Returns `{ preferences: [...] }`

- PUT `/users/preferences` (protected)
  - Body: `{ preferences: ['movies','comics'] }`
  - Updates user's preferences and returns `{ preferences: [...] }`

### News

- GET `/news` (protected)
  - Fetches news for the logged-in user's preferences. If `NEWS_API_KEY` is configured, the server fetches from NewsAPI.org and caches results. If not configured, returns an empty list with a `warning` field.
  - Response: `{ news: [...], cached: true|false, warning?: '...' }`

- POST `/news/:id/read` (protected)
  - Marks an article as read. `:id` should be the article URL, URL-encoded; or POST JSON `{ url: 'https://example.com/...' }`.
  - Returns the user's read list: `{ read: [...] }`

- POST `/news/:id/favorite` (protected)
  - Marks an article as favorite (same id/url behavior as above).
  - Returns `{ favorites: [...] }`

- GET `/news/read` (protected)
  - Returns `{ read: [...] }`

- GET `/news/favorites` (protected)
  - Returns `{ favorites: [...] }`

- GET `/news/search/:keyword` (protected)
  - Searches within the cached/fetched news for the logged-in user's preferences and returns `{ results: [...] }`.

---

## Examples (curl, Windows cmd style)

Signup:

```cmd
curl -X POST http://localhost:3000/users/signup -H "Content-Type: application/json" -d "{\"name\":\"Clark Kent\",\"email\":\"clark@superman.com\",\"password\":\"Krypt()n8\",\"preferences\":[\"movies\",\"comics\"]}"
```

Login:

```cmd
curl -X POST http://localhost:3000/users/login -H "Content-Type: application/json" -d "{\"email\":\"clark@superman.com\",\"password\":\"Krypt()n8\"}"
```

Get preferences (replace `<token>`):

```cmd
curl -H "Authorization: Bearer <token>" http://localhost:3000/users/preferences
```

Get news:

```cmd
curl -H "Authorization: Bearer <token>" http://localhost:3000/news
```

Mark article read (URL-encoded id):

```cmd
curl -X POST -H "Authorization: Bearer <token>" http://localhost:3000/news/http%3A%2F%2Fexample.com%2Farticle%3Fid%3D123/read
```

Or post JSON body:

```cmd
curl -X POST -H "Authorization: Bearer <token>" -H "Content-Type: application/json" -d "{\"url\":\"https://example.com/article?id=123\"}" http://localhost:3000/news/read
```

Search news:

```cmd
curl -H "Authorization: Bearer <token>" http://localhost:3000/news/search/bitcoin
```

---

## Testing

Run the existing automated tests:

```bash
npm test
```

The test suite uses `tap` and `supertest` and covers signup, login, preferences and news access.

Note: the tests are designed to pass without `NEWS_API_KEY` set — the code returns safe fallback responses when no key is configured.

---

## Notes & next steps

- Persistence: currently users and cache are in-memory. To persist data across restarts, integrate a database (SQLite, Postgres, Mongo) or a simple file-backed store.
- Validation & security: basic input validation and JWT auth are implemented. Consider adding `express-validator`, rate-limiting, and stronger password policies.
- Caching & scaling: the cache is in-process and ephemeral. For production use, move caching to Redis or another shared cache and add pagination for news results.
- API keys and rate limits: external news APIs have free-tier limits. Implement request throttling and caching to avoid hitting provider rate limits.

---

If you want, I can:

- Add unit tests for the new endpoints (read/favorites/search)
- Persist user read/favorites to a JSON file
- Add a mapping layer to map app preferences to provider-supported categories

Happy hacking!
[![Open in Visual Studio Code](https://classroom.github.com/assets/open-in-vscode-2e0aaae1b6195c2367325f4f02e2d04e9abb55f0b24a779b69b11b9e10269abc.svg)](https://classroom.github.com/online_ide?assignment_repo_id=20998658&assignment_repo_type=AssignmentRepo)
