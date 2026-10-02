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

## Auth

Without Supabase environment variables, accounts stay in a local demo. That demo stores passwords in plain text in this browser. Do not use a real password with it.

Set these public values to use Supabase Auth. They are not secret keys. Never put the service role key in `VITE_*` variables.

```dotenv
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Signup passwords must be 8–20 characters and include an uppercase letter, a lowercase letter, a number, and a symbol. In the Supabase dashboard, set the same minimum length under Authentication, and turn on email confirmation if you want new accounts to verify before they can sign in.

Guest likes stay in this browser under `deezire_liked_songs`. A signed-in collection is stored in the `liked_songs` table, one row per song, tied to that user's id. Run `supabase/liked_songs.sql` in the Supabase SQL editor before liking songs while signed in. Guest likes are not moved into the account automatically. Signing out returns to the guest collection.

An older API provider remains available when Supabase is not configured:

```dotenv
VITE_AUTH_PROVIDER=api
VITE_AUTH_API_URL=https://your-backend.example/api/auth
```
