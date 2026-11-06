/** Platform-independent falling-block rules shared by the browser and terminal. */
export type PieceType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';
export type Cell = PieceType | null;
export interface Point { x: number; y: number }
export interface ActivePiece { type: PieceType; rotation: number; x: number; y: number }
export type GameStatus = 'ready' | 'playing' | 'paused' | 'over';

const TYPES: readonly PieceType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
const START: Record<PieceType, readonly Point[]> = {
  I: [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }],
  O: [{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }],
  T: [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }],
  S: [{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
  Z: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }],
  J: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }],
  L: [{ x: 2, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }],
};

function rotations(type: PieceType): readonly (readonly Point[])[] {
  const result: Point[][] = [START[type].map(p => ({ ...p }))];
  const size = type === 'I' ? 4 : 3;
  for (let i = 1; i < 4; i++) {
    result.push(type === 'O'
      ? result[0]!.map(p => ({ ...p }))
      : result[i - 1]!.map(p => ({ x: size - 1 - p.y, y: p.x })));
  }
  return result.map(shape => Object.freeze(shape.map(point => Object.freeze(point))));
}

export const SHAPES: Readonly<Record<PieceType, readonly (readonly Point[])[]>> = Object.freeze({
  I: rotations('I'), O: rotations('O'), T: rotations('T'), S: rotations('S'),
  Z: rotations('Z'), J: rotations('J'), L: rotations('L'),
});

export const COLORS: Readonly<Record<PieceType, string>> = Object.freeze({
  I: '#61dce7', O: '#f2d36b', T: '#b99af8', S: '#9bce9f',
  Z: '#ed8d98', J: '#80a9ef', L: '#efb37d',
});

// SRS kick coordinates use positive Y upward; convert when applying to the board.
type Kick = readonly [number, number];
const NORMAL_KICKS: Record<string, readonly Kick[]> = {
  '0>1': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  '1>0': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
  '1>2': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
  '2>1': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  '2>3': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
  '3>2': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  '3>0': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  '0>3': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
};
const I_KICKS: Record<string, readonly Kick[]> = {
  '0>1': [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
  '1>0': [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
  '1>2': [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
  '2>1': [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
  '2>3': [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
  '3>2': [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
  '3>0': [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
  '0>3': [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
};

export class Game {
  readonly width = 10;
  readonly height = 20;
  board: Cell[][] = [];
  active: ActivePiece | null = null;
  next: PieceType[] = [];
  held: PieceType | null = null;
  canHold = true;
  status: GameStatus = 'ready';
  score = 0;
  lines = 0;
  level = 1;
  pieces = 0;
  lastClear = 0;

  private bag: PieceType[] = [];
  private gravityElapsed = 0;
  private lockElapsed = 0;
  private lockResets = 0;
  private readonly lockDelay = 500;
  private readonly maxLockResets = 15;

  constructor(private readonly random: () => number = Math.random) { this.reset(); }

  get dropInterval(): number { return Math.max(65, 1000 * Math.pow(0.8, this.level - 1)); }

  reset(): void {
    this.board = Array.from({ length: this.height }, () => Array<Cell>(this.width).fill(null));
    this.active = null;
    this.next = [];
    this.bag = [];
    this.held = null;
    this.canHold = true;
    this.status = 'ready';
    this.score = this.lines = this.pieces = this.lastClear = 0;
    this.level = 1;
    this.resetTimers();
    this.fillQueue();
  }

  start(): void {
    if (this.status === 'over') this.reset();
    if (this.status === 'ready') {
      this.status = 'playing';
      this.spawnNext();
    } else if (this.status === 'paused') {
      this.status = 'playing';
    }
  }

  togglePause(): void {
    if (this.status === 'playing') this.status = 'paused';
    else if (this.status === 'paused') this.status = 'playing';
  }

  getCells(piece: ActivePiece | null = this.active): Point[] {
    if (!piece) return [];
    return SHAPES[piece.type][piece.rotation]!.map(p => ({ x: p.x + piece.x, y: p.y + piece.y }));
  }

  ghostCells(): Point[] {
    if (!this.active) return [];
    const ghost = { ...this.active };
    while (this.fits({ ...ghost, y: ghost.y + 1 })) ghost.y++;
    return this.getCells(ghost);
  }

  move(dx: number): boolean {
    if (!this.playable() || !Number.isInteger(dx) || dx === 0) return false;
    // Process each column so a multi-cell request cannot jump through a stack.
    let moved = false;
    for (let i = 0; i < Math.min(Math.abs(dx), this.width); i++) {
      const candidate = { ...this.active!, x: this.active!.x + Math.sign(dx) };
      if (!this.fits(candidate)) break;
      const grounded = this.grounded();
      this.active = candidate;
      this.afterAdjustment(grounded);
      moved = true;
    }
    return moved;
  }

  rotate(direction: 1 | -1 = 1): boolean {
    if (!this.playable() || (direction !== 1 && direction !== -1)) return false;
    if (this.active!.type === 'O') return false;
    const from = this.active!.rotation;
    const to = (from + direction + 4) % 4;
    const kicks = (this.active!.type === 'I' ? I_KICKS : NORMAL_KICKS)[`${from}>${to}`]!;
    for (const [dx, dy] of kicks) {
      const candidate = { ...this.active!, rotation: to, x: this.active!.x + dx, y: this.active!.y - dy };
      if (!this.fits(candidate)) continue;
      const grounded = this.grounded();
      this.active = candidate;
      this.afterAdjustment(grounded);
      return true;
    }
    return false;
  }

  softDrop(): boolean {
    if (!this.playable()) return false;
    const candidate = { ...this.active!, y: this.active!.y + 1 };
    if (!this.fits(candidate)) return false;
    this.active = candidate;
    this.score++;
    this.gravityElapsed = 0;
    if (this.lockResets < this.maxLockResets) this.lockElapsed = 0;
    return true;
  }

  hardDrop(): number {
    if (!this.playable()) return 0;
    let distance = 0;
    while (this.fits({ ...this.active!, y: this.active!.y + 1 })) {
      this.active!.y++;
      distance++;
    }
    this.score += distance * 2;
    this.lock();
    return distance;
  }

  hold(): boolean {
    if (!this.playable() || !this.canHold) return false;
    const outgoing = this.active!.type;
    if (this.held) this.spawn(this.held);
    else this.spawnNext();
    this.held = outgoing;
    this.canHold = false;
    return true;
  }

  /** Advance real time, splitting at gravity and lock events for stable timing. */
  tick(deltaMs: number): void {
    if (!this.playable() || !Number.isFinite(deltaMs) || deltaMs <= 0) return;
    let remaining = deltaMs;
    while (remaining > 0 && this.playable()) {
      const grounded = this.grounded();
      const untilGravity = Math.max(0, this.dropInterval - this.gravityElapsed);
      const untilLock = grounded ? Math.max(0, this.lockDelay - this.lockElapsed) : Infinity;
      const step = Math.min(remaining, untilGravity, untilLock);
      this.gravityElapsed += step;
      if (grounded) this.lockElapsed += step;
      remaining -= step;

      if (grounded && this.lockElapsed >= this.lockDelay) {
        this.lock();
      } else if (this.gravityElapsed >= this.dropInterval) {
        this.gravityElapsed -= this.dropInterval;
        const candidate = { ...this.active!, y: this.active!.y + 1 };
        if (this.fits(candidate)) this.active = candidate;
      }
    }
  }

  private playable(): boolean { return this.status === 'playing' && this.active !== null; }

  private fits(piece: ActivePiece): boolean {
    return this.getCells(piece).every(({ x, y }) =>
      x >= 0 && x < this.width && y < this.height && (y < 0 || this.board[y]![x] === null));
  }

  private grounded(): boolean {
    return this.active !== null && !this.fits({ ...this.active, y: this.active.y + 1 });
  }

  private afterAdjustment(wasGrounded: boolean): void {
    if (wasGrounded && this.lockResets < this.maxLockResets) {
      this.lockElapsed = 0;
      this.lockResets++;
    }
  }

  private resetTimers(): void {
    this.gravityElapsed = this.lockElapsed = this.lockResets = 0;
  }

  private fillQueue(): void {
    while (this.next.length < 5) {
      if (this.bag.length === 0) {
        this.bag = [...TYPES];
        for (let i = this.bag.length - 1; i > 0; i--) {
          const value = this.random();
          const safe = Number.isFinite(value) ? Math.max(0, Math.min(0.9999999999999999, value)) : 0;
          const j = Math.floor(safe * (i + 1));
          [this.bag[i], this.bag[j]] = [this.bag[j]!, this.bag[i]!];
        }
      }
      this.next.push(this.bag.pop()!);
    }
  }

  private spawnNext(): void {
    this.fillQueue();
    const type = this.next.shift()!;
    this.fillQueue();
    this.spawn(type);
  }

  private spawn(type: PieceType): void {
    this.active = { type, rotation: 0, x: 3, y: -1 };
    this.resetTimers();
    if (!this.fits(this.active)) this.status = 'over';
  }

  private lock(): void {
    if (!this.active) return;
    const cells = this.getCells();
    this.pieces++;
    this.lastClear = 0;
    // A piece with cells above the visible playfield has topped out.
    if (cells.some(p => p.y < 0)) {
      for (const { x, y } of cells) if (y >= 0) this.board[y]![x] = this.active.type;
      this.active = null;
      this.status = 'over';
      return;
    }
    for (const { x, y } of cells) this.board[y]![x] = this.active.type;
    const survivors = this.board.filter(row => row.some(cell => cell === null));
    const cleared = this.height - survivors.length;
    this.lastClear = cleared;
    if (cleared > 0) {
      this.board = [
        ...Array.from({ length: cleared }, () => Array<Cell>(this.width).fill(null)),
        ...survivors,
      ];
      this.score += [0, 100, 300, 500, 800][cleared]! * this.level;
      this.lines += cleared;
      this.level = 1 + Math.floor(this.lines / 10);
    }
    this.canHold = true;
    this.spawnNext();
  }
}
