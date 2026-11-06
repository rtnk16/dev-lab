import { emitKeypressEvents, type Key } from 'node:readline';
import { Game, COLORS, SHAPES, type PieceType } from '../core/game.js';

const MIN_COLUMNS = 56;
const MIN_ROWS = 26;
const RESET = '\x1b[0m';

const help = `BLOCKWAVE — TypeScript テトリス / ターミナル版

起動: npm run play
必要環境: Node.js 22.12 以降、対話型のターミナル (${MIN_COLUMNS} 列 × ${MIN_ROWS} 行以上)

Enter       ゲーム開始 / ゲームオーバー後の再開
← → / A D   左右に移動
↓ / S       ソフトドロップ
↑ / X       右回転
Z           左回転
Space       ハードドロップ
C           ホールド (1 ピースにつき 1 回)
P / Esc     一時停止 / 再開
R           最初からやり直す
Q / Ctrl+C  終了

--help      この説明を表示
--snapshot  対話操作なしで描画例を表示

ウィンドウが小さい間はゲームの進行が止まります。
`;

function foreground(type: PieceType): string {
  const hex = COLORS[type].replace('#', '');
  return `\x1b[38;2;${parseInt(hex.slice(0, 2), 16)};${parseInt(hex.slice(2, 4), 16)};${parseInt(hex.slice(4, 6), 16)}m`;
}

function block(type: PieceType, color: boolean, ghost = false): string {
  if (!color) return ghost ? '::' : '[]';
  return `${foreground(type)}${ghost ? '\x1b[2m░░' : '██'}${RESET}`;
}

function mini(type: PieceType | null, color: boolean): string[] {
  if (!type) return ['          ', '    —     '];
  const points = SHAPES[type][0];
  const minX = Math.min(...points.map((point) => point.x));
  const minY = Math.min(...points.map((point) => point.y));
  const maxX = Math.max(...points.map((point) => point.x));
  const occupied = new Set(points.map((point) => `${point.x - minX},${point.y - minY}`));
  const inset = ' '.repeat(Math.floor((5 - (maxX - minX + 1)) / 2) * 2);
  return [0, 1].map((y) => inset + Array.from({ length: maxX - minX + 1 }, (_, x) => occupied.has(`${x},${y}`) ? block(type, color) : '  ').join(''));
}

/** A pure frame builder also used by --snapshot; no terminal state is changed here. */
function render(game: Game, color: boolean, highScore: number): string {
  const active = new Set(game.getCells().map(({ x, y }) => `${x},${y}`));
  const ghost = new Set(game.ghostCells().map(({ x, y }) => `${x},${y}`));
  const held = mini(game.held, color);
  const previews = game.next.slice(0, 3).map((piece) => mini(piece, color));
  const status = { ready: 'READY', playing: 'PLAYING', paused: 'PAUSED', over: 'GAME OVER' }[game.status];
  const side: string[] = [
    `STATUS  ${status}`,
    '',
    `SCORE   ${String(game.score).padStart(7, '0')}`,
    `BEST    ${String(highScore).padStart(7, '0')}`,
    `LEVEL   ${String(game.level).padStart(2, '0')}`,
    `LINES   ${String(game.lines).padStart(3, '0')}`,
    '',
    `HOLD  [C]${game.canHold ? '' : '  USED'}`,
    ...held,
    '',
    'NEXT',
    ...(previews[0] ?? ['', '']),
    '',
    ...(previews[1] ?? ['', '']),
    '',
    ...(previews[2] ?? ['', '']),
  ];

  const rows = ['  B L O C K W A V E    /    TERMINAL', '', '+--------------------+'];
  for (let y = 0; y < game.height; y += 1) {
    let row = '|';
    for (let x = 0; x < game.width; x += 1) {
      const key = `${x},${y}`;
      const cell = game.board[y][x];
      if (active.has(key) && game.active) row += block(game.active.type, color);
      else if (cell) row += block(cell, color);
      else if (ghost.has(key) && game.active) row += block(game.active.type, color, true);
      else row += color ? '\x1b[38;2;38;44;56m· \x1b[0m' : '· ';
    }
    row += `|   ${side[y] ?? ''}`;
    rows.push(row);
  }
  rows.push('+--------------------+');
  if (game.status === 'ready') rows.push('Enter: START   Q: QUIT');
  else if (game.status === 'over') rows.push('Enter: PLAY AGAIN   Q: QUIT');
  else if (game.status === 'paused') rows.push('P / Esc: RESUME   R: RESTART   Q: QUIT');
  else rows.push('Arrows: MOVE   X/Z: ROTATE   Space: DROP');
  rows.push('C: HOLD   P: PAUSE   R: RESTART   Q: QUIT');
  return rows.join('\n');
}

function main(): void {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) {
    process.stdout.write(help);
    return;
  }
  if (args.includes('--snapshot')) {
    const game = new Game(() => 0.42);
    game.start();
    game.move(-1);
    process.stdout.write(`${render(game, false, 0)}\n`);
    return;
  }
  if (args.length > 0) {
    process.stderr.write(`不明なオプション: ${args.join(' ')}\n使い方: npm run play -- --help\n`);
    process.exitCode = 1;
    return;
  }
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    process.stderr.write('対話型のターミナルで npm run play を実行してください。\n描画例は npm run play -- --snapshot、操作説明は npm run play -- --help で確認できます。\n');
    process.exitCode = 1;
    return;
  }

  const game = new Game();
  const color = !process.env.NO_COLOR;
  const previousRaw = Boolean(process.stdin.isRaw);
  let highScore = 0;
  let closed = false;
  let lastTime = performance.now();
  let lastFrame = '';
  let tooSmall = false;
  let timer: ReturnType<typeof setInterval> | undefined;

  function restore(): void {
    if (closed) return;
    closed = true;
    if (timer) clearInterval(timer);
    process.stdin.setRawMode(previousRaw);
    process.stdin.pause();
    process.stdout.write(`${RESET}\x1b[?25h\x1b[?1049l`);
  }

  function quit(): void {
    restore();
    process.exit(0);
  }

  function draw(): void {
    tooSmall = (process.stdout.columns ?? MIN_COLUMNS) < MIN_COLUMNS || (process.stdout.rows ?? MIN_ROWS) < MIN_ROWS;
    const frame = tooSmall
      ? `BLOCKWAVE\n\n${MIN_COLUMNS} columns x ${MIN_ROWS} rows required.\nResize to continue. Q: quit`
      : render(game, color, highScore);
    if (frame !== lastFrame) {
      // Clear each line so a shorter score/status never leaves stale characters.
      process.stdout.write(`\x1b[H${frame.split('\n').map((line) => `${line}\x1b[K`).join('\n')}\x1b[J`);
      lastFrame = frame;
    }
  }

  emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdout.write('\x1b[?1049h\x1b[?25l\x1b[2J\x1b[H');
  process.once('exit', restore);
  process.once('SIGINT', quit);
  process.once('SIGTERM', quit);
  process.once('SIGHUP', quit);
  process.stdout.on('resize', () => {
    lastTime = performance.now();
    lastFrame = '';
    draw();
  });
  process.stdin.on('keypress', (_text: string, key: Key) => {
    if (!key) return;
    if ((key.ctrl && key.name === 'c') || key.name === 'q') {
      quit();
      return;
    }
    if (tooSmall) return;
    if (key.name === 'return') {
      if (game.status !== 'playing') game.start();
    } else if (key.name === 'r') {
      game.reset();
      game.start();
    } else if (key.name === 'p' || key.name === 'escape') game.togglePause();
    else if (key.name === 'left' || key.name === 'a') game.move(-1);
    else if (key.name === 'right' || key.name === 'd') game.move(1);
    else if (key.name === 'down' || key.name === 's') game.softDrop();
    else if (key.name === 'up' || key.name === 'x') game.rotate(1);
    else if (key.name === 'z') game.rotate(-1);
    else if (key.name === 'space') game.hardDrop();
    else if (key.name === 'c') game.hold();
    highScore = Math.max(highScore, game.score);
    draw();
  });

  timer = setInterval(() => {
    const now = performance.now();
    const elapsed = now - lastTime;
    lastTime = now;
    if (!tooSmall) game.tick(Math.min(elapsed, 250));
    highScore = Math.max(highScore, game.score);
    draw();
  }, 1000 / 30);
  draw();
}

main();
