# IP Geolocation Monorepo

Monorepo containing backend API (Express serverless) and Next.js frontend.

## Structure
- `api/` Node + Express server prepared for Vercel serverless (`api/src/index.ts` export default app)
- `web/` Next.js 14 App Router frontend

## Features
- JWT auth with HttpOnly cookie
- User seeding (3 default users) on start
- IP lookup via ip-api.com
- History per user (SQLite locally, Upstash Redis in production)
- Map display with Leaflet
- History CRUD with multi-select delete
- Dark/light mode scaffold (set CSS variables; you can extend with a toggle component)

## Environment Variables
Create `.env` files in both `api` and `web` based on provided `.env.example` files.

### API `.env`
```
NODE_ENV=development
PORT=4000
JWT_SECRET=
IP_GEOLOCATION_API_KEY=
UPSTASH_REDIS_URL=
COOKIE_DOMAIN=localhost
```

### Web `.env`
```
NEXT_PUBLIC_API_BASE=http://localhost:4000/api
```

## Development
Install dependencies from root:
```
npm install
```
Run both api and web concurrently:
```
npm run dev
```
API runs at http://localhost:4000, Web at http://localhost:3000.

Seeding happens automatically at API start. You can also run:
```
npm --workspace api run seed
```
Default users:
- user1@example.com / password1
- user2@example.com / password2
- user3@example.com / password3

## Build
```
npm run build
```

## Deploy to Vercel
The included `vercel.json` sets up:
- Serverless functions for Express app (`api/src/index.ts`)
- Next.js frontend in `web/`

Steps:
1. Push repo to GitHub (public).
2. In Vercel import the repo.
3. Ensure Root Project is selected, framework auto-detect for Next.js.
4. Add environment variables for Production (and Preview) matching `.env.example` values.
5. Deploy.

### Upstash Redis
Provide `UPSTASH_REDIS_URL` (rediss://...) and set `NODE_ENV=production` in Vercel. The store automatically switches from SQLite to Redis.

## Security Notes
- JWT stored in HttpOnly, SameSite=Strict cookie; Secure flag auto in production.
- No tokens exposed to client beyond session cookie.
- CORS restricted to localhost:3000 in dev; adjust for production domain.

## TODO / Possible Enhancements
- Add CSRF token pattern (double submit cookie) if performing state-changing requests from cross-origin contexts.
- Password hashing (currently plain for brevity) using bcrypt.
- Add dark mode toggle component persisting preference in localStorage.
- Input validation / rate limiting.
- More robust error handling & logging.

---
Enjoy hacking!
