import assert from 'node:assert/strict';
import test from 'node:test';
import { Game, SHAPES, type PieceType } from '../src/core/game.js';

function seeded(seed = 42): () => number {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function playing(): Game {
  const game = new Game(seeded());
  game.start();
  return game;
}

function emptyBoard(game: Game): void {
  game.board = Array.from({ length: game.height }, () => Array(game.width).fill(null));
}

function floorPiece(game: Game, type: PieceType, rotation = 0, left = 0): void {
  const shape = SHAPES[type][rotation]!;
  game.active = {
    type, rotation,
    x: left - Math.min(...shape.map(cell => cell.x)),
    y: game.height - 1 - Math.max(...shape.map(cell => cell.y)),
  };
}

test('a fresh game waits for start and ignores gameplay input', () => {
  const game = new Game(seeded());
  const before = JSON.stringify({ board: game.board, active: game.active, score: game.score });
  assert.equal(game.status, 'ready');
  game.move(1);
  game.rotate();
  game.softDrop();
  game.hardDrop();
  game.hold();
  game.tick(10_000);
  assert.equal(JSON.stringify({ board: game.board, active: game.active, score: game.score }), before);
  game.start();
  assert.equal(game.status, 'playing');
  assert.ok(game.active);
});

test('each seven-piece bag contains every tetromino, with deterministic randomness', () => {
  const a = playing();
  const b = playing();
  const draws: PieceType[] = [];
  for (let index = 0; index < 28; index++) {
    assert.equal(a.active?.type, b.active?.type);
    draws.push(a.active!.type);
    emptyBoard(a);
    emptyBoard(b);
    a.hardDrop();
    b.hardDrop();
  }
  for (let index = 0; index < draws.length; index += 7) {
    assert.deepEqual([...draws.slice(index, index + 7)].sort(), ['I', 'J', 'L', 'O', 'S', 'T', 'Z']);
  }
  assert.ok(a.next.length >= 5);
});

test('wall collision prevents pieces from leaving either side', () => {
  const game = playing();
  while (game.move(-1)) { /* move to the wall */ }
  assert.equal(Math.min(...game.getCells().map(cell => cell.x)), 0);
  assert.equal(game.move(-1), false);
  while (game.move(1)) { /* move to the opposite wall */ }
  assert.equal(Math.max(...game.getCells().map(cell => cell.x)), game.width - 1);
  assert.equal(game.move(1), false);
});

test('four clockwise rotations restore the shape in open space', () => {
  const game = playing();
  game.active = { type: 'T', rotation: 0, x: 3, y: 5 };
  const before = game.getCells().map(cell => `${cell.x},${cell.y}`).sort();
  for (let index = 0; index < 4; index++) assert.equal(game.rotate(1), true);
  assert.deepEqual(game.getCells().map(cell => `${cell.x},${cell.y}`).sort(), before);
  assert.equal(game.rotate(-1), true);
  assert.equal(game.rotate(1), true);
  assert.deepEqual(game.getCells().map(cell => `${cell.x},${cell.y}`).sort(), before);
});

test('rotation kicks keep a vertical I piece inside the left wall', () => {
  const game = playing();
  game.active = { type: 'I', rotation: 1, x: -2, y: 5 };
  assert.equal(game.rotate(-1), true);
  assert.ok(game.getCells().every(cell => cell.x >= 0 && cell.x < game.width));
});

test('ghost gives the same landing cells as a hard drop', () => {
  const game = playing();
  const expected = game.ghostCells();
  const type = game.active!.type;
  const initialCells = game.getCells();
  const distance = expected[0]!.y - initialCells[0]!.y;
  assert.ok(distance > 0);
  assert.equal(game.hardDrop(), distance);
  assert.equal(game.pieces, 1);
  assert.equal(game.score, distance * 2);
  for (const cell of expected) assert.equal(game.board[cell.y]![cell.x], type);
});

test('hold works once per piece and becomes available after locking', () => {
  const game = playing();
  const first = game.active!.type;
  const next = game.next[0];
  assert.equal(game.hold(), true);
  assert.equal(game.held, first);
  assert.equal(game.active!.type, next);
  assert.equal(game.canHold, false);
  assert.equal(game.hold(), false);
  game.hardDrop();
  assert.equal(game.canHold, true);
  const outgoing = game.active!.type;
  assert.equal(game.hold(), true);
  assert.equal(game.active!.type, first);
  assert.equal(game.held, outgoing);
});

test('paused games preserve board, score and active piece', () => {
  const game = playing();
  game.togglePause();
  const before = JSON.stringify(game);
  game.tick(10_000);
  game.move(1);
  game.rotate();
  game.softDrop();
  game.hardDrop();
  game.hold();
  assert.equal(JSON.stringify(game), before);
  game.togglePause();
  assert.equal(game.status, 'playing');
});

test('one completed row clears and awards 100 points at level one', () => {
  const game = playing();
  floorPiece(game, 'I');
  for (let x = 4; x < game.width; x++) game.board[19]![x] = 'J';
  game.hardDrop();
  assert.equal(game.lines, 1);
  assert.equal(game.lastClear, 1);
  assert.equal(game.score, 100);
  assert.ok(game.board.every(row => row.every(cell => cell === null)));
});

test('two adjacent completed rows clear together', () => {
  const game = playing();
  floorPiece(game, 'O');
  for (const y of [18, 19]) {
    for (let x = 2; x < game.width; x++) game.board[y]![x] = 'L';
  }
  game.hardDrop();
  assert.equal(game.lines, 2);
  assert.equal(game.lastClear, 2);
  assert.equal(game.score, 300);
  assert.ok(game.board.every(row => row.every(cell => cell === null)));
});

test('four-row clear awards 800 points and advances level at ten lines', () => {
  const game = playing();
  game.lines = 6;
  floorPiece(game, 'I', 1);
  for (let y = 16; y < 20; y++) {
    for (let x = 1; x < game.width; x++) game.board[y]![x] = 'S';
  }
  const initialSpeed = game.dropInterval;
  game.hardDrop();
  assert.equal(game.lines, 10);
  assert.equal(game.level, 2);
  assert.equal(game.lastClear, 4);
  assert.equal(game.score, 800);
  assert.ok(game.dropInterval < initialSpeed);
});

test('gravity moves a piece down after the configured interval', () => {
  const game = playing();
  const initialY = game.active!.y;
  game.tick(game.dropInterval - 1);
  assert.equal(game.active!.y, initialY);
  game.tick(1);
  assert.equal(game.active!.y, initialY + 1);
});

test('a grounded piece has a lock delay before becoming part of the board', () => {
  const game = playing();
  floorPiece(game, 'O');
  game.tick(499);
  assert.equal(game.pieces, 0);
  game.tick(1);
  assert.equal(game.pieces, 1);
  assert.equal(game.board.flat().filter(Boolean).length, 4);
});

test('grounded movement resets lock delay at most fifteen times', () => {
  const game = playing();
  floorPiece(game, 'O', 0, 3);
  for (let index = 0; index < 15; index++) {
    game.tick(499);
    assert.equal(game.pieces, 0);
    assert.equal(game.move(index % 2 === 0 ? 1 : -1), true);
  }
  game.tick(499);
  assert.equal(game.pieces, 0);
  assert.equal(game.move(-1), true);
  game.tick(1);
  assert.equal(game.pieces, 1);
});

test('gravity and locking are independent of frame duration', () => {
  const a = playing();
  const b = playing();
  const total = 60_123;
  a.tick(total);
  let remaining = total;
  while (remaining > 0) {
    const step = Math.min(17, remaining);
    b.tick(step);
    remaining -= step;
  }
  assert.equal(JSON.stringify(a), JSON.stringify(b));
});

test('stacking pieces eventually tops out, then input is ignored until restart', () => {
  const game = playing();
  for (let index = 0; index < 200 && game.status === 'playing'; index++) game.hardDrop();
  assert.equal(game.status, 'over');
  const before = JSON.stringify(game);
  game.move(-1);
  game.rotate();
  game.hardDrop();
  game.hold();
  game.tick(5000);
  assert.equal(JSON.stringify(game), before);
  game.start();
  assert.equal(game.status, 'playing');
  assert.equal(game.score, 0);
  assert.equal(game.lines, 0);
  assert.ok(game.board.every(row => row.every(cell => cell === null)));
});

test('reset returns a played game to its initial waiting state', () => {
  const game = playing();
  game.hardDrop();
  game.hold();
  game.reset();
  assert.equal(game.status, 'ready');
  assert.equal(game.score, 0);
  assert.equal(game.lines, 0);
  assert.equal(game.level, 1);
  assert.equal(game.pieces, 0);
  assert.equal(game.held, null);
  assert.ok(game.board.every(row => row.every(cell => cell === null)));
});
