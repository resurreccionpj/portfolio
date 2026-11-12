const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------- sound (synthesized, no files) ---------- */
const soundBtn = document.getElementById('sound');
let sound = !calm;
try {
  const saved = localStorage.getItem('sound');
  if (saved) sound = saved === 'on';
} catch {}

let ctx;
function ensureAudio() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  ctx ||= new AC();
  if (ctx.state === 'suspended') ctx.resume();
}

function blip(freq, dur = 0.05, vol = 0.06) {
  if (!sound || !ctx) return;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(freq, t);
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

function paintSound() {
  soundBtn.textContent = sound ? 'Sound: on' : 'Sound: off';
}
paintSound();

soundBtn.addEventListener('click', () => {
  sound = !sound;
  try { localStorage.setItem('sound', sound ? 'on' : 'off'); } catch {}
  paintSound();
  if (sound) {
    ensureAudio();
    blip(660);
  }
});

/* ---------- lab status log ---------- */
const run = document.getElementById('run');
const log = document.getElementById('log');
const state = document.getElementById('state');

const lines = [
  ['$ lab status', 'cmd'],
  ['traefik        https        ok', 'ok'],
  ['hub            fastapi      ok', 'ok'],
  ['llama.cpp      rtx 4070     idle', 'ok'],
  ['observability  full stack   ok', 'ok'],
  ['all systems ready', 'done'],
];

run.addEventListener('click', async () => {
  run.disabled = true;
  state.textContent = 'running';
  log.textContent = '';
  if (sound) ensureAudio();
  for (const [i, [text, kind]] of lines.entries()) {
    const row = document.createElement('span');
    row.className = kind;
    row.textContent = text + '\n';
    log.append(row);
    if (kind === 'done') {
      blip(880, 0.1);
      setTimeout(() => blip(1320, 0.18), 110);
    } else {
      blip(kind === 'cmd' ? 520 : 600 + i * 60);
    }
    if (!calm || sound) await wait(380);
  }
  state.textContent = 'done';
  run.textContent = 'Check again';
  run.disabled = false;
});

/* ---------- interactive lab ---------- */
const stage = document.getElementById('stage');
const rig = document.getElementById('rig');
const racks = [...document.querySelectorAll('.rack')];
const title = document.getElementById('rack-title');
const text = document.getElementById('rack-text');

const info = {
  edge: ['Edge', 'Traefik terminates HTTPS in front of everything, with basic auth and security headers.'],
  apps: ['Apps', 'One FastAPI hub serves chat, finance, nutrition, a calendar, a system and GPU monitor and a heartbeat poller.'],
  ai: ['AI', 'Qwen on llama.cpp, which I tried on my RTX 4070. The hub can also route to hosted models when a task needs more.'],
  obs: ['Observability', 'Full-stack observability across the lab, so I can see how each project behaves.'],
};

const idle = [title.textContent, text.textContent];

const BASE = 35;
let target = BASE;
let current = BASE;
let raf = 0;
let dragging = false;
let moved = false;
let startX = 0;
let startTarget = 0;

function frame() {
  current += (target - current) * (calm ? 1 : 0.12);
  if (Math.abs(target - current) < 0.05) current = target;
  rig.style.setProperty('--ry', current + 'deg');
  raf = current === target ? 0 : requestAnimationFrame(frame);
}

function turnTo(deg) {
  target = deg;
  if (!raf) raf = requestAnimationFrame(frame);
}

stage.addEventListener('pointerdown', (e) => {
  if (e.pointerType === 'mouse' && e.button !== 0) return;
  dragging = true;
  moved = false;
  startX = e.clientX;
  startTarget = target;
  stage.classList.add('drag');
});

stage.addEventListener('pointermove', (e) => {
  if (dragging) {
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 6) moved = true;
    if (moved) turnTo(startTarget + dx * 0.7);
  } else if (e.pointerType === 'mouse') {
    const r = stage.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    turnTo(BASE + (x - 0.5) * 300);
  }
});

function endDrag() {
  dragging = false;
  stage.classList.remove('drag');
}
addEventListener('pointerup', endDrag);
addEventListener('pointercancel', endDrag);

stage.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') { e.preventDefault(); turnTo(target - 25); }
  if (e.key === 'ArrowRight') { e.preventDefault(); turnTo(target + 25); }
});

document.querySelectorAll('[data-turn]').forEach((b) =>
  b.addEventListener('click', () => turnTo(target + Number(b.dataset.turn) * 35))
);

racks.forEach((b) =>
  b.addEventListener('click', (e) => {
    if (moved && e.detail !== 0) { moved = false; return; }
    moved = false;
    const wasOn = b.getAttribute('aria-pressed') === 'true';
    racks.forEach((r) => r.setAttribute('aria-pressed', String(!wasOn && r === b)));
    rig.classList.toggle('has-sel', !wasOn);
    const [name, desc] = wasOn ? idle : info[b.dataset.rack];
    title.textContent = name;
    text.textContent = desc;
  })
);
