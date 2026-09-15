# Deezire

Every feeling has a soundtrack. Deezire turns a mood into a mix of real Deezer tracks, with 30-second previews.

## Run locally

Use Node.js 22.12+ (or Node 24).

```bash
npm ci
npm run dev
```

Open [Deezire locally](http://localhost:3000). Use the Vite server: opening `index.html` directly does not provide routing, modules, or the Deezer proxy.

```bash
npx vitest run
npx tsc --noEmit
npm run eslint
npm run build
```

The archive contains source, configuration, fonts, and tests. Install dependencies with `npm ci`; generated build output, dependency folders, and Git history are omitted.

## What’s included

- Purple-and-black design, original CSS frequency artwork, local Space Grotesk and DM Sans fonts, and a responsive layout.
- Eight moods, typed input, and a clear Feel it / Shift it choice.
- Album-art-led results, a searchable liked collection, confirmation and undo for song removal, and a persistent player.
- One shared audio element, actual playback progress, seeking in Now Playing, shuffle, and queue navigation. Preview completion advances to the next playable track; sequential playback stops at the end of the queue.
- A mobile-only cold-load splash, global reduced-motion support, visible labels and focus styles, and native modal dialogs.
- Optional `/login` and `/signup` routes with a local demo auth provider and a separate liked collection for each account.

See **REDESIGN_NOTES.md** for changes, verification, limitations, and the requested UX self-audit.

## Mood analysis and music requests

The original Deezer search pipeline, emotion classifier, theme utilities, storage guards, link helper, session utility, and shared types are unchanged.

Opening the app or choosing a mood chip never starts the large emotion-model download. A typed submission starts it only if the existing `connectionAllowsPreload()` policy allows the connection. Keyword matching works immediately while the model loads or if it fails. The transformer runtime remains dynamically imported in its own chunk.

The existing classifier may use browser caching for the downloaded model. Its runtime and model files are separate from the initial interface assets. The model is not a guaranteed interpretation of a feeling; users can choose another mood.

Music requests still go through `/api/deezer`. `vite.config.ts` preserves the development proxy, and `vercel.json` preserves the original Deezer rewrite as the first rule. An SPA fallback after it enables direct links to the auth, liked, about, and not-found routes. This follows [Vercel’s Vite SPA guidance](https://vercel.com/docs/frameworks/frontend/vite#using-vite-to-make-spas).

Recent mood text, query, and mix are stored in this browser using the existing guards. Music searches send translated search terms to Deezer; unrecognized wording may be included. The About page explains this to users.

## Auth: explicitly a development stub

Default configuration needs no environment variables or API keys.

**Use a made-up password. This is not secure authentication.** The local provider stores demo passwords in plain text in browser storage so the prototype can check later sign-ins. There is no hashing, encryption, email verification, password reset, server authorization, or cloud synchronization. The UI says it is a local demo and asks users not to use a real password. Do not treat it as a production account system.

All auth operations go through `src/services/auth.ts`: `signUp`, `signIn`, `signOut`, and `getSession`. `AppProvider` composes `AuthProvider` and the existing app state. Every original `useApp()` member remains available.

Guest likes keep the original `deezire_liked_songs` key. Accounts use `deezire_liked_songs:user:<id>`. Signing in does not migrate or erase guest likes. Signing out restores the guest collection; returning to an account restores that account’s collection. Undo state cannot carry a removed song into another account.

### Switch to a future backend

An API provider is included behind the same interface. After implementing a server backed by Supabase Auth or MongoDB, configure these build-time values (see `.env.example`):

```dotenv
VITE_AUTH_PROVIDER=api
VITE_AUTH_API_URL=https://your-backend.example/api/auth
```

The backend must implement this contract:

| Method | Endpoint | Request | Success response |
| --- | --- | --- | --- |
| POST | `/sign-up` | `{ "email": "...", "password": "..." }` | `{ "user": { "id": "stable-id", "email": "..." } }` |
| POST | `/sign-in` | Same credentials object | Same user object |
| POST | `/sign-out` | No body | Any successful status |
| GET | `/session` | No body | Same user object, or HTTP 401 when signed out |

The client uses `credentials: include` and a 15-second timeout. The server owns secure HttpOnly sessions, validation, authorization, CSRF protection, and any required CORS settings. Do not place private API keys or database credentials in `VITE_*` variables. A Supabase deployment needs an adapter implementing this contract; the setting is not a direct Supabase SDK connection. Account-liked-song cloud sync is separate future backend work.

Build and deploy only through your existing Vercel workflow when ready. No deployment was made during this redesign.
