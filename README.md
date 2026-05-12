# PlaylistSaber

A Beat Saber playlist generator. Helps you find ranked maps to improve your PP, discover songs that work for a group of friends, or search by manual star ranges.

## Features

- **PP Improve** - fetches your scores from ScoreSaber or BeatLeader and finds new maps + improvable maps ranked by PP gain potential
- **With Friends** - takes multiple player IDs, derives each person's skill range from their top scores, and finds songs with difficulties that cover everyone
- **Ranges** - same as With Friends but with manually entered star ranges, for when you don't have profile IDs handy

## Stack

SvelteKit 2 + Svelte 5 runes, TypeScript, static adapter (SPA mode). No backend.

## Development

```sh
npm install
npm run dev
```

## Tests

```sh
npm test
```

## Build

```sh
npm run build
# output in build/
```
