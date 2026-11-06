# BLOCKWAVE

[日本語](README_jp.md) · [Repository](../../README.md)

- A TypeScript Tetris game that runs in a web browser and an interactive terminal.
- Both clients use the same game engine for movement, rotation, gravity, hold, line clearing, and scoring.
- The browser interface is in Japanese and supports keyboard and touch controls.

## Requirements

- Node.js 22.12 or later and npm.
- For the terminal client, an interactive terminal with ANSI color support and at least 56 columns × 26 rows.

## Setup and Play

For a first checkout, clone the repository and install the project's dependencies:

```sh
git clone https://github.com/rtnk16/dev-lab.git
cd dev-lab/projects/blockwave
npm ci
```

If you already have a checkout, open the repository root, then run `cd projects/blockwave` and `npm ci`. If you downloaded the repository ZIP, extract it and open `dev-lab-main` first, then use the same commands. The browser's source download button downloads the whole repository, including this project.

Start the browser client:

```sh
npm run dev
```

Open the URL printed by Vite in your browser, then click the start button or press `Enter`.

Start the terminal client:

```sh
npm run play
```

The game opens in the terminal. Press `Enter` to start and `Q` to exit. The terminal client compiles automatically before launch.

## Controls and Rules

| Key | Action |
| --- | --- |
| ← / A, → / D | Move left or right |
| ↓ / S | Soft drop |
| ↑ / X | Rotate clockwise |
| Z | Rotate counterclockwise |
| Space | Hard drop |
| C | Hold |
| P / Esc | Pause or resume |
| Enter | Start, resume, or play again after game over |
| R | Restart |
| Q / Ctrl+C | Exit the terminal client |

- Fill a horizontal row to clear it. Clearing multiple rows together awards more points.
- Every 10 cleared lines increases the level and falling speed.
- Hold can be used once until the current piece locks in place.
- Pieces come from shuffled sets of all seven shapes, so every set contains each shape once.
- The landing guide shows where the current piece will land. Hold and next-piece previews help plan ahead.

### Browser

- Use the on-screen buttons on a smartphone.
- Open the help dialog for controls or the terminal dialog for setup instructions and the repository ZIP.
- Sound and the landing guide can be toggled. These preferences and the best score are stored in `localStorage` in that browser.
- Switching tabs or moving focus away from the window pauses the game automatically.

### Terminal

- Shrinking the window below 56 columns × 26 rows freezes the game until enough space is available again.
- Exiting restores the terminal's cursor, display, and input mode.
- The best score lasts for the current process only. Set `NO_COLOR=1` to disable ANSI block colors.

## Build and Validate

Run these commands from `projects/blockwave`:

```sh
npm run typecheck
npm test
npm run build
```

- `typecheck` checks TypeScript without generating files.
- `test` compiles and runs engine tests for piece distribution, collisions, rotation, hold, line clearing, scoring, timing, pause, and game over.
- `build` produces browser files in `dist/` and terminal files in `build/`.
- `npm run preview` serves the browser build locally.
- Generated files, test output, and dependency caches are ignored by Git.

After a build, these terminal commands also work without interactive input:

```sh
node build/terminal/index.js --help
node build/terminal/index.js --snapshot
```

`--help` prints Japanese controls and requirements. `--snapshot` prints a deterministic board preview and exits.

## Troubleshooting

- If installation reports an unsupported Node.js version, check `node --version`, install Node.js 22.12 or later, then rerun `npm ci`.
- Run commands from `projects/blockwave`. Start the terminal client with `npm run play`. For controls without starting a game, use `npm run play -- --help`.

## Structure

```text
projects/blockwave/
├── src/
│   ├── core/game.ts       Shared game rules, independent of DOM and Node.js APIs
│   ├── web/               Browser rendering, input, and styles
│   └── terminal/index.ts  Terminal rendering and input
├── tests/game.test.ts     Engine tests
├── public/               Static assets
├── index.html            Browser interface
├── package.json          Commands and dependencies
├── package-lock.json     Locked dependency versions
├── README.md
└── README_jp.md
```

The clients translate input into engine actions and render the resulting state. The engine accepts a random-number function so tests can reproduce a particular piece sequence.
