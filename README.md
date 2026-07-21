# Study Calendar

A simple monthly calendar built with Vite + React. Click a day to add events,
organize them by subject, and color-code each subject with a hex value.

## Run locally
```
npm install
npm run dev
```
Then open the URL Vite prints (usually http://localhost:5173).

## Build for production
```
npm run build
```
This creates the `dist/` folder.

## Deploy to Vercel
1. Push this folder to a GitHub repo.
2. In Vercel, "Add New Project" and import the repo.
3. Vercel auto-detects Vite. Framework Preset: Vite. Build command: `npm run build`.
   Output directory: `dist`. Click Deploy.

That's it. No environment variables needed.

## How it works (the parts worth understanding)
- **State lives in React** via `useState`. There are three main pieces of state:
  `subjects` (name + color), `events` (a map of date-string -> array of events),
  and which day is `selectedKey`.
- **The grid** is built by figuring out how many days are in the viewed month and
  how many blank cells to pad at the front so the 1st lands on the right weekday.
- **Events are keyed by a date string** like `2026-7-21`, so looking up a day's
  events is a simple object lookup.

## Your next feature
Right now data is in memory only, so a refresh clears it. The natural next step is
saving to `localStorage` so it persists. That's a good small feature to implement
yourself: on every change to `events` or `subjects`, write them to localStorage,
and load them back when the app first mounts. (Look up `useEffect`.)
