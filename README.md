# Ear Trainer

An offline Electron app for interval recognition. Hear two synthesized notes, select their interval, and track accuracy and streaks.

## Run

Requires Node.js and npm.

```powershell
npm install
npm start
```

## Features

- Beginner (5), intermediate (8), and advanced (13) interval pools.
- Ascending, descending, or harmonic playback.
- Soft triangle-wave keys or pure sine tones; adjustable volume.
- Replay, answer feedback, local progress and settings.
- Space plays when focus is outside controls; Enter advances after answering.
- No accounts, remote assets, or audio downloads.

## Development

`npm test` checks tuning, interval generation, and difficulty pools.
`main.cjs` creates a sandboxed Electron window. `music.js` holds musical logic.
`renderer.js` handles exercise state, Web Audio synthesis, and localStorage.

This is a development prototype, not a packaged installer. Sound is synthesized, not sampled piano audio.

`npm run test:ui` runs a hidden Electron smoke check and writes preview.png; its progress uses a separate temporary profile.
