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

const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

run.addEventListener('click', async () => {
  run.disabled = true;
  state.textContent = 'running';
  log.textContent = '';
  for (const [text, kind] of lines) {
    const row = document.createElement('span');
    row.className = kind;
    row.textContent = text + '\n';
    log.append(row);
    if (!calm) await wait(380);
  }
  state.textContent = 'done';
  run.textContent = 'Check again';
  run.disabled = false;
});
