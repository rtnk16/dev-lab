import { Game, COLORS, SHAPES, type PieceType, type Point } from '../core/game.js';
import './style.css';

const $ = <T extends HTMLElement>(id: string): T => document.getElementById(id) as T;
const game = new Game();
const board = $<HTMLCanvasElement>('board');
const hold = $<HTMLCanvasElement>('hold');
const next = $<HTMLCanvasElement>('next');
const overlay = $('overlay');
const helpDialog = $<HTMLDialogElement>('help-dialog');
const terminalDialog = $<HTMLDialogElement>('terminal-dialog');
const repeats = new Map<string, { action: Action; next: number; interval: number }>();
type Action = 'left' | 'right' | 'down' | 'cw' | 'ccw' | 'drop' | 'hold' | 'pause';
let best = 0;
let guide = true;
let sound = false;
try {
  const stored = Number(localStorage.getItem('blockwave.best') ?? 0);
  best = Number.isFinite(stored) ? Math.max(0, stored) : 0;
  guide = localStorage.getItem('blockwave.guide') !== 'false';
  sound = localStorage.getItem('blockwave.sound') === 'true';
} catch { /* The game also works when browser storage is unavailable. */ }
function save(key: string, value: string): void {
  try { localStorage.setItem(`blockwave.${key}`, value); } catch { /* Optional preference. */ }
}
let audio: AudioContext | null = null;
function tone(kind: 'move' | 'drop' | 'hold' | 'clear' | 'start'): void {
  if (!sound) return;
  try {
    audio ??= new AudioContext();
    void audio.resume();
    const frequencies = { move: 190, drop: 100, hold: 330, clear: 660, start: 440 };
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    const now = audio.currentTime;
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequencies[kind], now);
    oscillator.frequency.exponentialRampToValueAtTime(frequencies[kind] * (kind === 'clear' ? 2 : .65), now + .12);
    gain.gain.setValueAtTime(.055, now);
    gain.gain.exponentialRampToValueAtTime(.001, now + .15);
    oscillator.connect(gain).connect(audio.destination);
    oscillator.start(now);
    oscillator.stop(now + .16);
  } catch { /* Sound is optional. */ }
}

function setupCanvas(canvas: HTMLCanvasElement, width: number, height: number): CanvasRenderingContext2D {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  const ctx = canvas.getContext('2d')!;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  return ctx;
}
const ctx = setupCanvas(board, 300, 600);
const holdCtx = setupCanvas(hold, 160, 90);
const nextCtx = setupCanvas(next, 160, 300);

function block(context: CanvasRenderingContext2D, x: number, y: number, size: number, type: PieceType, ghost = false): void {
  const padding = size > 24 ? 1.6 : 1.2;
  context.beginPath();
  context.roundRect(x + padding, y + padding, size - padding * 2, size - padding * 2, 2.5);
  if (ghost) {
    context.fillStyle = `${COLORS[type]}0d`;
    context.fill();
    context.strokeStyle = `${COLORS[type]}70`;
    context.lineWidth = 1;
    context.stroke();
    return;
  }
  const gradient = context.createLinearGradient(x, y, x + size, y + size);
  gradient.addColorStop(0, COLORS[type]);
  gradient.addColorStop(1, `${COLORS[type]}c9`);
  context.fillStyle = gradient;
  context.fill();
  context.strokeStyle = '#ffffff25';
  context.lineWidth = 1;
  context.stroke();
  context.fillStyle = '#ffffff20';
  context.fillRect(x + padding + 2, y + padding + 2, size - padding * 2 - 4, 1);
  context.fillStyle = '#10071a17';
  context.fillRect(x + padding + 2, y + size - padding - 3, size - padding * 2 - 4, 1);
}
function cells(points: Point[], type: PieceType, ghost = false): void {
  points.filter(p => p.y >= 0).forEach(p => block(ctx, p.x * 30, p.y * 30, 30, type, ghost));
}
const demo: Array<[number, number, PieceType]> = [
  [0,19,'J'],[1,19,'J'],[2,19,'J'],[3,19,'O'],[4,19,'O'],[5,19,'I'],[6,19,'I'],[7,19,'I'],[8,19,'I'],
  [0,18,'J'],[1,18,'S'],[2,18,'S'],[3,18,'O'],[4,18,'O'],[7,18,'L'],[8,18,'L'],[9,18,'L'],
  [0,17,'S'],[1,17,'S'],[5,17,'T'],[6,17,'T'],[7,17,'T'],[9,17,'L'],[6,16,'T'],
  [0,16,'Z'],[1,16,'Z'],[1,15,'Z'],[2,15,'Z']
];
function renderBoard(): void {
  ctx.clearRect(0, 0, 300, 600);
  ctx.fillStyle = '#131018';
  ctx.fillRect(0, 0, 300, 600);
  ctx.strokeStyle = '#b59bc00a';
  ctx.lineWidth = .7;
  ctx.beginPath();
  for (let x = 0; x <= 300; x += 30) { ctx.moveTo(x, 0); ctx.lineTo(x, 600); }
  for (let y = 0; y <= 600; y += 30) { ctx.moveTo(0, y); ctx.lineTo(300, y); }
  ctx.stroke();
  if (game.status === 'ready') {
    ctx.globalAlpha = .64;
    demo.forEach(([x,y,type]) => block(ctx, x*30, y*30, 30, type));
    ctx.globalAlpha = 1;
    return;
  }
  game.board.forEach((row,y) => row.forEach((type,x) => { if (type) block(ctx, x*30,y*30,30,type); }));
  if (game.active) {
    if (guide) cells(game.ghostCells(), game.active.type, true);
    cells(game.getCells(), game.active.type);
  }
}
function mini(context: CanvasRenderingContext2D, type: PieceType, centerX: number, centerY: number, size = 21): void {
  const shape = SHAPES[type][0];
  const xs = shape.map(p => p.x), ys = shape.map(p => p.y);
  const middleX = (Math.min(...xs) + Math.max(...xs) + 1) / 2;
  const middleY = (Math.min(...ys) + Math.max(...ys) + 1) / 2;
  shape.forEach(p => block(context, centerX + (p.x - middleX)*size, centerY + (p.y-middleY)*size, size, type));
}
let sidebarSignature = '';
function renderSidebars(): void {
  const signature = `${game.held}:${game.canHold}:${game.next.join('')}`;
  if (sidebarSignature === signature) return;
  sidebarSignature = signature;
  holdCtx.clearRect(0,0,160,90);
  if (game.held) {
    holdCtx.globalAlpha = game.canHold ? 1 : .4;
    mini(holdCtx, game.held, 80, 48, 22);
    holdCtx.globalAlpha = 1;
  } else {
    holdCtx.strokeStyle = '#4b3c59';
    holdCtx.lineWidth = 1;
    holdCtx.setLineDash([3,4]);
    holdCtx.strokeRect(48,29,64,33);
    holdCtx.setLineDash([]);
    holdCtx.fillStyle = '#65556e';
    holdCtx.font = '16px monospace';
    holdCtx.textAlign = 'center';
    holdCtx.fillText('+',80,51);
  }
  hold.setAttribute('aria-label',game.held ? `ホールド中: ${game.held}` : 'ホールド中のブロックはありません');
  $('hold-hint').textContent = !game.held ? 'ブロックをキープ' : game.canHold ? 'C キーで入れ替え' : '次のブロックで使用可能';
  nextCtx.clearRect(0,0,160,300);
  game.next.slice(0,5).forEach((type, i) => {
    if (i === 0) {
      nextCtx.fillStyle = '#b99af807';
      nextCtx.beginPath();nextCtx.roundRect(5,3,150,58,5);nextCtx.fill();
    }
    nextCtx.globalAlpha = i===0 ? 1 : .72;
    mini(nextCtx,type,80,32+i*58,i===0 ? 23 : 20);
  });
  nextCtx.globalAlpha = 1;
  next.setAttribute('aria-label', `次のブロック: ${game.next.slice(0,5).join(', ')}`);
}
function padded(value: number, length: number): string { return String(value).padStart(length,'0'); }
let uiSignature = '';
let previousStatus: string = '';
function renderUI(): void {
  if (game.score > best) { best=game.score;save('best',String(best)); }
  const signature = `${game.score}:${game.lines}:${game.level}:${game.status}:${best}`;
  if (signature===uiSignature) return;
  uiSignature=signature;
  $('score').textContent=padded(game.score,6);
  $('best').textContent=padded(best,6);
  $('level').textContent=padded(game.level,2);
  $('lines').textContent=padded(game.lines,2);
  $('progress').style.width=`${game.lines%10*10}%`;
  $('level-hint').textContent=`あと${10-game.lines%10}ラインでレベルアップ`;
  board.setAttribute('aria-label',`10列20行のテトリス盤面。スコア${game.score}、レベル${game.level}、消去${game.lines}ライン。`);
  $('play-state').textContent={ready:'READY WHEN YOU ARE',playing:'FINDING THE FLOW',paused:'TAKE A BREATHER',over:'ONE MORE GAME?'}[game.status];
  $('play-dot').style.background=game.status==='playing'?'#9bce9f':'#ad98d5';
  const pause=$<HTMLButtonElement>('pause');
  pause.disabled=game.status==='ready'||game.status==='over';
  pause.textContent=game.status==='paused'?'▷':'Ⅱ';
  pause.setAttribute('aria-label',game.status==='paused'?'ゲームを再開':'ゲームを一時停止');
  overlay.classList.toggle('hidden',game.status==='playing');
  const content={ready:['FIND YOUR FLOW','さあ、はじめよう。','次の一手は、あなた次第。','ゲームをはじめる'],paused:['TAKE A BREATHER','ちょっと、ひと息。','準備ができたら、続きをどうぞ。','ゲームを再開する'],over:['NICE FLOW','また、もう一回。',`${game.lines} LINES  /  ${padded(game.score,6)} POINTS`,'もう一度あそぶ']} as const;
  if (game.status!=='playing') {
    const entry=content[game.status];
    $('overlay-eyebrow').textContent=entry[0];$('overlay-title').textContent=entry[1];
    $('overlay-description').textContent=entry[2];$('start-label').textContent=entry[3];
    $('enter-hint').innerHTML=`<kbd>Enter</kbd> キーでも${game.status==='paused'?'再開':'スタート'}`;
  }
  if (previousStatus!==game.status) {
    $('announcer').textContent={ready:'ゲーム開始待ちです。',playing:'ゲームを開始しました。',paused:'一時停止しました。',over:`ゲームオーバー。スコア${game.score}点です。`}[game.status];
    previousStatus=game.status;
  }
}
let seenPieces=0,toastUntil=0;
function afterChange(): void {
  if (game.pieces!==seenPieces) {
    seenPieces=game.pieces;
    if (game.lastClear>0) {
      $('clear-toast').textContent=['','SINGLE','DOUBLE','TRIPLE','TETRIS!'][game.lastClear];
      $('clear-toast').classList.add('show');toastUntil=performance.now()+1000;tone('clear');
      $('announcer').textContent=`${game.lastClear}ライン消去。スコア${game.score}点。`;
    }
  }
  renderUI();renderSidebars();renderBoard();
}
function begin(): void { repeats.clear();game.start();tone('start');afterChange(); }
function restart(): void {
  repeats.clear();game.reset();game.start();seenPieces=0;
  $('clear-toast').classList.remove('show');tone('start');afterChange();
}
function pauseGame(): void { repeats.clear();game.togglePause();afterChange(); }
function action(value: Action): void {
  if (value==='pause') { pauseGame();return; }
  if (game.status!=='playing') return;
  let changed=false;
  if (value==='left') changed=game.move(-1);
  else if (value==='right') changed=game.move(1);
  else if (value==='down') changed=game.softDrop();
  else if (value==='cw') changed=game.rotate(1);
  else if (value==='ccw') changed=game.rotate(-1);
  else if (value==='hold') changed=game.hold();
  else if (value==='drop') { game.hardDrop();changed=true; }
  if (changed) tone(value==='drop'?'drop':value==='hold'?'hold':'move');
  afterChange();
}
function openDialog(dialog: HTMLDialogElement): void {
  if (game.status==='playing') pauseGame();
  repeats.clear();dialog.showModal();
}
$('start').addEventListener('click',begin);
$('pause').addEventListener('click',pauseGame);
$('restart').addEventListener('click',restart);
$('help').addEventListener('click',()=>openDialog(helpDialog));
$('terminal').addEventListener('click',()=>openDialog(terminalDialog));
$('source-info').addEventListener('click',()=>openDialog(terminalDialog));
document.querySelectorAll<HTMLButtonElement>('.dialog-close,.dialog-done').forEach(button=>button.addEventListener('click',()=>button.closest('dialog')?.close()));
[helpDialog,terminalDialog].forEach(dialog=>dialog.addEventListener('click',event=>{
  if(event.target===dialog) { const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close(); }
}));
function preferences(): void {
  $('ghost-toggle').setAttribute('aria-pressed',String(guide));
  $('sound').setAttribute('aria-pressed',String(sound));
  $('sound').setAttribute('aria-label',sound?'サウンドをオフにする':'サウンドをオンにする');
}
$('ghost-toggle').addEventListener('click',()=>{guide=!guide;save('guide',String(guide));preferences();renderBoard();});
$('sound').addEventListener('click',()=>{sound=!sound;save('sound',String(sound));preferences();if(sound)tone('start');});
const keyMap:Record<string,Action>={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowDown:'down',KeyS:'down',ArrowUp:'cw',KeyX:'cw',KeyZ:'ccw',Space:'drop',KeyC:'hold',KeyP:'pause',Escape:'pause'};
document.addEventListener('keydown',event=>{
  if (event.ctrlKey||event.metaKey||event.altKey||helpDialog.open||terminalDialog.open) return;
  if ((event.code==='Enter'||event.code==='Space') && event.target instanceof Element && event.target.closest('button,a,input,select,textarea,[contenteditable]')) return;
  if (event.code==='Enter'||event.code==='KeyR') {
    event.preventDefault();if(event.repeat)return;
    if(event.code==='KeyR')restart();else if(game.status!=='playing')begin();return;
  }
  const mapped=keyMap[event.code];if(!mapped)return;
  event.preventDefault();if(event.repeat)return;
  action(mapped);
  if (['left','right','down'].includes(mapped) && game.status==='playing') {
    repeats.set(event.code,{action:mapped,next:performance.now()+(mapped==='down'?40:145),interval:mapped==='down'?40:38});
  }
});
document.addEventListener('keyup',event=>repeats.delete(event.code));
document.querySelectorAll<HTMLButtonElement>('[data-action]').forEach(button=>{
  button.addEventListener('click',event=>{
    if(event.detail===0)action(button.dataset.action as Action);
  });
  button.addEventListener('pointerdown',event=>{
    event.preventDefault();button.setPointerCapture(event.pointerId);
    const mapped=button.dataset.action as Action;action(mapped);
    if(['left','right','down'].includes(mapped)&&game.status==='playing') repeats.set(`touch${event.pointerId}`,{action:mapped,next:performance.now()+145,interval:mapped==='down'?40:38});
  });
  ['pointerup','pointercancel','lostpointercapture'].forEach(name=>button.addEventListener(name,event=>{repeats.delete(`touch${(event as PointerEvent).pointerId}`);}));
});
function pauseOnLeave():void {repeats.clear();if(game.status==='playing')pauseGame();}
window.addEventListener('blur',pauseOnLeave);
document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseOnLeave();});
let lastFrame=performance.now();
function frame(now:number):void {
  const elapsed=Math.min(now-lastFrame,100);lastFrame=now;
  if(game.status==='playing') {
    for(const repeat of repeats.values())if(now>=repeat.next){action(repeat.action);repeat.next=now+repeat.interval;}
    game.tick(elapsed);afterChange();
  }
  if(toastUntil&&now>toastUntil){$('clear-toast').classList.remove('show');toastUntil=0;}
  requestAnimationFrame(frame);
}
preferences();afterChange();requestAnimationFrame(frame);
