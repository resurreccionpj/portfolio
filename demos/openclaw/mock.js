/* Mock API for the OpenClaw Local demo pages. Everything here is made up and lives in memory.
   It answers the same routes the FastAPI hub does, so the original pages run unchanged. */
(() => {
  const pad = (n) => String(n).padStart(2, '0');
  const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const ago = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return iso(d); };
  const ahead = (n) => ago(-n);
  const rnd = (a, b) => a + Math.random() * (b - a);
  const r1 = (v) => Math.round(v * 10) / 10;
  const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  /* ---------------------------------------------------------------- monitor */
  const monitorStatus = () => ({
    overall: 'healthy',
    containers: ['traefik', 'hub', 'openclaw', 'datasette'].map((name, i) => ({
      name, running: true, health: 'healthy', started_at: ['6 days', '6 days', '2 days', '6 days'][i], restart_count: i === 2 ? 1 : 0,
    })),
    llm: { healthy: true, model: 'Qwen3.5-9B-Q4_K_M.gguf', n_ctx: 32768, slots_idle: 3, slots_processing: 1, health_status: 'ok' },
    host: {
      cpu_count: 12, cpu_load_1m: r1(rnd(0.4, 1.6)), cpu_load_5m: r1(rnd(0.5, 1.2)), cpu_load_15m: r1(rnd(0.5, 1.0)), cpu_temp: `${Math.round(rnd(48, 58))}°C`,
      cpu_percent: rnd(6, 24), mem_percent: rnd(38, 46), mem_used_gb: r1(rnd(12, 14.5)), mem_total_gb: 32,
      disk_percent: 41.2, disk_used_gb: 411, disk_total_gb: 998, net_rx_kbps: r1(rnd(8, 60)), net_tx_kbps: r1(rnd(4, 35)),
      net_interfaces: [{ name: 'eth0', rx_mb: 18420, tx_mb: 6310 }, { name: 'docker0', rx_mb: 2210, tx_mb: 3120 }],
    },
    gpu: [{ available: true, name: 'NVIDIA GeForce RTX 4070', temp_c: Math.round(rnd(46, 63)), power_draw_w: rnd(38, 120), power_limit_w: 200,
      util_pct: rnd(4, 52), vram_percent: 71, vram_used_mb: 8700, vram_total_mb: 12282 }],
    cstats: [
      ['traefik', 0.4, 38, 512, 8], ['hub', 3.2, 410, 2048, 21], ['openclaw', 1.8, 690, 4096, 34], ['datasette', 0.2, 96, 512, 6],
    ].map(([name, cpu, mem, limit, pids]) => ({
      name, running: true, cpu_pct: r1(cpu * rnd(0.7, 1.4)), mem_pct: r1((mem / limit) * 100), mem_usage_mb: mem, mem_limit_mb: limit, pids,
      net_rx_kbps: r1(rnd(0.5, 14)), net_tx_kbps: r1(rnd(0.2, 9)), net_rx_mb: r1(rnd(40, 900)), net_tx_mb: r1(rnd(20, 500)), blk_read_mb: r1(rnd(10, 400)), blk_write_mb: r1(rnd(5, 200)),
    })),
    sessions: { active_sessions: 3, total_sessions: 27, last_activity: 'a few minutes ago', agents: ['main'], recent_errors: [] },
    service_health: { 'core-api': true, chat: true, monitor: true, heartbeat: true, calendar: true, finance: true, nutrition: true, landing: true },
  });

  /* -------------------------------------------------------------- heartbeat */
  const heartbeat = () => ({
    running: false, running_tasks: [],
    state: {
      lastChecks: { calendar: new Date(Date.now() - 22 * 60000).toISOString(), finance: new Date(Date.now() - 3 * 3600000).toISOString(), nutrition: null },
      notes: 'Sample notes: nothing needs attention right now.',
    },
    last_event: { type: 'heartbeat', result: 'ok', summary: 'Checked the calendar and found nothing urgent.', at: new Date(Date.now() - 22 * 60000).toISOString() },
    tasks: [
      { name: 'Calendar check', bullets: ['Look at the next 24 hours', 'Flag clashes and tight gaps', 'Remind me about anything before 9:00'] },
      { name: 'Spending check', bullets: ['Compare this month with last month', 'Mention only large changes'] },
      { name: 'Meal log nudge', bullets: ['If lunch is not logged by 14:00, ask once'] },
    ],
  });

  /* ------------------------------------------------------------------- chat */
  const sessions = [
    { id: 's1', preview: 'Help me plan the week around two deadlines', message_count: 6, modified: ago(0) + ' 09:41', messages: [
      { role: 'user', content: 'Help me plan the week around two deadlines.' },
      { role: 'assistant', content: 'Sure. Tell me the two deadlines and how long each task takes, and I will block out time on your calendar.' } ] },
    { id: 's2', preview: 'Summarize last month’s spending', message_count: 4, modified: ago(2) + ' 20:15', messages: [
      { role: 'user', content: 'Summarize last month’s spending.' },
      { role: 'assistant', content: 'Rent and groceries were the two biggest items. Dining out was down a little from the month before.' } ] },
    { id: 's3', preview: 'Write a Docker Compose healthcheck', message_count: 8, modified: ago(5) + ' 14:02', messages: [
      { role: 'user', content: 'Write a Docker Compose healthcheck for a FastAPI service.' },
      { role: 'assistant', content: 'Here is one:\n\n```yaml\nhealthcheck:\n  test: ["CMD", "curl", "-f", "http://localhost:8000/health"]\n  interval: 30s\n  timeout: 5s\n  retries: 3\n```' } ] },
  ];

  const replyFor = (text) => {
    const t = (text || '').toLowerCase();
    if (/status|health|lab|monitor|gpu/.test(t)) return 'Everything looks healthy.\n\n- **Traefik**, **hub**, **openclaw** and **datasette** are all up\n- The local model is online on the **RTX 4070**\n- Disk is at about 41%\n\n*This is a demo reply. The live system reads real numbers from the monitor.*';
  if (/budget|spend|expense|money|finance/.test(t)) return 'Here is a quick read on spending this month:\n\n1. **Rent** is the largest item\n2. **Groceries** come second\n3. Dining out is a little lower than last month\n\n*Demo reply with sample numbers.*';
    if (/calorie|food|meal|nutrition|protein/.test(t)) return 'You are on track for the day. Protein is a bit under goal, so a Greek yogurt or an egg snack would close the gap.\n\n*Demo reply.*';
    if (/calendar|schedule|meeting|week/.test(t)) return 'Your week looks manageable. Tuesday has the tightest gap between meetings, so I would move the focus block to Wednesday morning.\n\n*Demo reply.*';
    if (/code|docker|python|bug|debug|refactor/.test(t)) return 'Coding questions are routed to a coding model.\n\n```python\ndef health():\n    return {"status": "ok"}\n```\n\n*Demo reply. Nothing was run.*';
    return 'Hi! This page is a **demo copy** of my chat screen, so replies are scripted.\n\nThe real one runs on a local **Qwen** model through llama.cpp on my RTX 4070, and can hand harder questions to hosted models.\n\nTry asking about the lab status, spending, meals, my calendar or code.';
  };

  const sse = (text) => {
    const enc = new TextEncoder();
    const words = text.split(/(\s+)/);
    return new Response(new ReadableStream({
      async start(c) {
        await wait(350);
        for (const w of words) {
          if (!w) continue;
          c.enqueue(enc.encode('data: ' + JSON.stringify({ choices: [{ delta: { content: w } }] }) + '\n\n'));
          await wait(w.trim() ? 28 : 0);
        }
        c.enqueue(enc.encode('data: ' + JSON.stringify({ usage: { total_tokens: 900 + text.length }, choices: [] }) + '\n\n'));
        c.enqueue(enc.encode('data: [DONE]\n\n'));
        c.close();
      },
    }), { status: 200, headers: { 'Content-Type': 'text/event-stream' } });
  };

  /* --------------------------------------------------------------- calendar */
  const calEvents = [
    [0, '09:30', '10:00', 'Team stand-up', 'Online'], [0, '13:00', '14:00', 'Lunch with Sam', 'Cafe nearby'],
    [1, '10:00', '11:30', 'Design review', 'Meeting room 2'], [1, '15:30', '16:00', 'Dentist reminder', ''],
    [2, null, null, 'Pay electricity bill', ''], [3, '09:00', '12:00', 'Focus block: write report', ''],
    [3, '18:30', '20:00', 'Badminton', 'Sports hall'], [4, '14:00', '15:00', 'Planning session', 'Online'],
    [5, null, null, 'Grocery run', ''], [6, '11:00', '12:30', 'Family brunch', 'Home'],
    [8, '10:00', '10:45', 'Check-in with manager', 'Online'], [9, '16:00', '17:00', 'Car service', 'Service centre'],
    [11, null, null, 'Friend’s birthday', ''], [13, '09:00', '11:00', 'Quarterly review', 'Meeting room 1'],
  ].map(([d, time, end, title, location], i) => ({ id: 'ev' + i, date: ahead(d), time, end_time: end, all_day: !time, title, location, description: '', html_link: '' }));

  const weekRange = (mode) => {
    const now = new Date(); const dow = (now.getDay() + 6) % 7; // Monday = 0
    const start = new Date(now); const end = new Date(now);
    if (mode === 'next') { start.setDate(now.getDate() + (7 - dow)); end.setDate(start.getDate() + 6); }
    else { end.setDate(now.getDate() + (6 - dow)); }
    return [iso(start), iso(end)];
  };

  /* -------------------------------------------------------------- nutrition */
  const foods = [
    { id: 1, food_name: 'Oatmeal with banana', serving_size: '1 bowl', calories: 320, protein_g: 9, carbs_g: 58, fat_g: 6, fiber_g: 7, meal: 'breakfast' },
    { id: 2, food_name: 'Scrambled eggs', serving_size: '2 eggs', calories: 180, protein_g: 12, carbs_g: 2, fat_g: 14, fiber_g: 0, meal: 'breakfast' },
    { id: 3, food_name: 'Pandesal', serving_size: '2 pieces', calories: 190, protein_g: 6, carbs_g: 36, fat_g: 3, fiber_g: 2, meal: 'breakfast' },
    { id: 4, food_name: 'Greek yogurt', serving_size: '1 cup', calories: 150, protein_g: 15, carbs_g: 8, fat_g: 5, fiber_g: 0, meal: 'snack' },
    { id: 5, food_name: 'Chicken adobo with rice', serving_size: '1 plate', calories: 640, protein_g: 38, carbs_g: 62, fat_g: 24, fiber_g: 2, meal: 'lunch' },
    { id: 6, food_name: 'Sinigang na baboy', serving_size: '1 bowl', calories: 380, protein_g: 28, carbs_g: 18, fat_g: 20, fiber_g: 3, meal: 'lunch' },
    { id: 7, food_name: 'Grilled fish with rice', serving_size: '1 plate', calories: 520, protein_g: 40, carbs_g: 58, fat_g: 12, fiber_g: 2, meal: 'lunch' },
    { id: 8, food_name: 'Chicken salad', serving_size: '1 bowl', calories: 360, protein_g: 34, carbs_g: 14, fat_g: 18, fiber_g: 5, meal: 'lunch' },
    { id: 9, food_name: 'Tinola with rice', serving_size: '1 plate', calories: 470, protein_g: 32, carbs_g: 52, fat_g: 14, fiber_g: 3, meal: 'dinner' },
    { id: 10, food_name: 'Beef and vegetable stir-fry', serving_size: '1 plate', calories: 560, protein_g: 36, carbs_g: 44, fat_g: 24, fiber_g: 6, meal: 'dinner' },
    { id: 11, food_name: 'Pasta primavera', serving_size: '1 plate', calories: 520, protein_g: 17, carbs_g: 78, fat_g: 16, fiber_g: 6, meal: 'dinner' },
    { id: 12, food_name: 'Mango', serving_size: '1 cup', calories: 100, protein_g: 1, carbs_g: 25, fat_g: 0.6, fiber_g: 2.6, meal: 'snack' },
    { id: 13, food_name: 'Banana', serving_size: '1 medium', calories: 105, protein_g: 1.3, carbs_g: 27, fat_g: 0.4, fiber_g: 3.1, meal: 'snack' },
    { id: 14, food_name: 'Mixed nuts', serving_size: '30 g', calories: 180, protein_g: 5, carbs_g: 7, fat_g: 16, fiber_g: 2, meal: 'snack' },
  ];
  let goals = { calories: 2100, protein_g: 130, carbs_g: 230, fat_g: 70, fiber_g: 30 };
  let nextEntry = 1;
  const entries = [];
  const times = { breakfast: '07:45:00', lunch: '12:30:00', dinner: '19:15:00', snack: '15:40:00' };
  const logFood = (date, f, servings, time) => entries.push({
    id: nextEntry++, date, time: time || times[f.meal], meal_type: f.meal, food_name: f.food_name, serving_size: f.serving_size,
    calories: f.calories * servings, protein_g: f.protein_g * servings, carbs_g: f.carbs_g * servings, fat_g: f.fat_g * servings,
    fiber_g: f.fiber_g * servings, sugar_g: 0, sodium_mg: 0, notes: '',
  });
  for (let d = 34; d >= 0; d--) {
    const date = ago(d); const pick = (list, k) => list[(d * 3 + k) % list.length];
    const by = (m) => foods.filter((f) => f.meal === m);
    logFood(date, pick(by('breakfast'), 0), 1);
    if (d % 2) logFood(date, pick(by('breakfast'), 1), 1);
    logFood(date, pick(by('lunch'), 1), 1);
    logFood(date, pick(by('dinner'), 2), 1);
    if (d % 3 !== 1) logFood(date, pick(by('snack'), 0), 1);
    if (d < 1) { entries.pop(); } // keep today a little lighter so there is room to log
  }
  const sum = (list) => list.reduce((a, e) => ({ calories: a.calories + e.calories, protein_g: a.protein_g + e.protein_g, carbs_g: a.carbs_g + e.carbs_g,
    fat_g: a.fat_g + e.fat_g, fiber_g: a.fiber_g + e.fiber_g }), { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0 });
  const nutritionSummary = (day) => {
    const list = entries.filter((e) => e.date === day); const totals = sum(list);
    const pct = (a, b) => (b ? Math.round((a / b) * 1000) / 10 : 0);
    const meals = {};
    ['breakfast', 'lunch', 'dinner', 'snack'].forEach((m) => { const s = sum(list.filter((e) => e.meal_type === m)); if (list.some((e) => e.meal_type === m)) meals[m] = s; });
    return {
      day, goals, totals, meals,
      progress: { calories_pct: pct(totals.calories, goals.calories), protein_pct: pct(totals.protein_g, goals.protein_g), carbs_pct: pct(totals.carbs_g, goals.carbs_g), fat_pct: pct(totals.fat_g, goals.fat_g), fiber_pct: pct(totals.fiber_g, goals.fiber_g) },
      remaining: { calories: goals.calories - totals.calories, protein_g: goals.protein_g - totals.protein_g, carbs_g: goals.carbs_g - totals.carbs_g, fat_g: goals.fat_g - totals.fat_g, fiber_g: goals.fiber_g - totals.fiber_g },
    };
  };

  /* ---------------------------------------------------------------- finance */
  const fAccounts = [
    { account_id: 1, name: 'Cash', group_name: 'Cash', icon: '💵' }, { account_id: 2, name: 'E-Wallet', group_name: 'E-Wallet', icon: '📱' },
    { account_id: 3, name: 'Savings Account', group_name: 'Savings', icon: '🏦' }, { account_id: 4, name: 'Credit Card', group_name: 'Card', icon: '💳' },
    { account_id: 5, name: 'Index Fund', group_name: 'Investment', icon: '📈' },
  ];
  let nextFt = 1;
  const ft = [];
  const addFt = (type, amount, daysAgo, account, category, note) => ft.push({
    id: nextFt++, date: ago(daysAgo), type, amount, php: amount, account, category, note, description: note, personal_amount: 0, non_personal_amount: 0, payment_status: account === 'Credit Card' ? 'Paid' : '',
  });
  for (let m = 0; m < 6; m++) {
    const base = m * 30;
    addFt('Income', 62000, base + 3, 'Savings Account', 'Salary', 'Monthly pay');
    if (m % 2 === 0) addFt('Income', 9500, base + 17, 'E-Wallet', 'Freelance', 'Side project');
    addFt('Exp.', 20000, base + 6, 'Savings Account', 'Rent', 'Apartment rent');
    addFt('Exp.', 2380 - m * 40, base + 9, 'Savings Account', 'Utilities', 'Electric and water');
    addFt('Exp.', 1699, base + 10, 'Savings Account', 'Utilities', 'Internet');
    addFt('Exp.', 549, base + 11, 'Credit Card', 'Subscriptions', 'Streaming plan');
    [[2100, 2], [1890, 9], [2460, 16], [2230, 23]].forEach(([a, d]) => addFt('Exp.', a + m * 17, base + d, 'Credit Card', 'Food', 'Groceries'));
    [[420, 4], [560, 12], [310, 19], [690, 26]].forEach(([a, d]) => addFt('Exp.', a, base + d, 'Cash', 'Food', 'Eating out'));
    [[130, 1], [95, 8], [210, 15], [120, 22]].forEach(([a, d]) => addFt('Exp.', a, base + d, 'E-Wallet', 'Transport', 'Commute'));
    addFt('Exp.', 890 + m * 25, base + 14, 'Credit Card', 'Health', 'Pharmacy');
    if (m % 2 === 1) addFt('Exp.', 3299, base + 20, 'Credit Card', 'Shopping', 'Gadget accessory');
  }
  const ym = (d) => d.slice(0, 7);
  const finSummary = (month) => {
    const inMonth = ft.filter((t) => !month || ym(t.date) === month);
    const income = inMonth.filter((t) => t.type === 'Income').reduce((s, t) => s + t.amount, 0);
    const expenses = inMonth.filter((t) => t.type === 'Exp.').reduce((s, t) => s + t.amount, 0);
    const allInc = ft.filter((t) => t.type === 'Income').reduce((s, t) => s + t.amount, 0);
    const allExp = ft.filter((t) => t.type === 'Exp.').reduce((s, t) => s + t.amount, 0);
    return { income, expenses, net: income - expenses, transaction_count: inMonth.length, all_time_income: allInc, all_time_expenses: allExp, all_time_net: allInc - allExp };
  };

  /* ---------------------------------------------------------------- router */
  const realFetch = window.fetch.bind(window);
  window.fetch = async (input, init = {}) => {
    const url = new URL(typeof input === 'string' ? input : input.url, location.href);
    const p = url.pathname; const q = url.searchParams;
    if (!/^\/(monitor|heartbeat|chat|calendar|nutrition|finance)\/api\//.test(p)) return realFetch(input, init);
    const method = (init.method || 'GET').toUpperCase();
    const body = typeof init.body === 'string' && init.body ? JSON.parse(init.body) : {};
    await wait(120);

    if (p === '/monitor/api/status') return json(200, monitorStatus());

    if (p === '/heartbeat/api/heartbeat') return json(200, heartbeat());
    if (p === '/heartbeat/api/heartbeat/trigger') return json(200, { ok: true });

    if (p === '/chat/api/skills') return json(200, { skills: [] });
    if (p === '/chat/api/sessions/list') return json(200, { sessions: sessions.map(({ messages, ...s }) => s) });
    if (p === '/chat/api/sessions/save') return json(200, { ok: true });
    if (p === '/chat/api/chat/upload') return json(200, { filename: 'notes.txt', text: 'Sample file text.', char_count: 17, truncated: false });
    if (p === '/chat/api/chat') {
      const last = [...(body.messages || [])].reverse().find((m) => m.role === 'user');
      return sse(replyFor(last && last.content));
    }
    let m = p.match(/^\/chat\/api\/sessions\/([^/]+)\/messages$/);
    if (m) { const s = sessions.find((x) => x.id === m[1]); return json(s ? 200 : 404, s ? { messages: s.messages } : { detail: 'Not found' }); }
    m = p.match(/^\/chat\/api\/sessions\/([^/]+)$/);
    if (m && method === 'DELETE') { const i = sessions.findIndex((x) => x.id === m[1]); if (i >= 0) sessions.splice(i, 1); return json(200, { ok: true }); }

    if (p === '/calendar/api/calendar/week') { const [s, e] = weekRange(q.get('mode')); return json(200, { week_start: s, week_end: e, events: calEvents.filter((ev) => ev.date >= s && ev.date <= e) }); }
    if (p === '/calendar/api/calendar/week/trigger') return json(200, { ok: true });
    if (p === '/calendar/api/calendar/events') return json(200, { events: calEvents });
    m = p.match(/^\/calendar\/api\/calendar\/events\/(.+)$/);
    if (m && method === 'DELETE') { const i = calEvents.findIndex((x) => x.id === decodeURIComponent(m[1])); if (i >= 0) calEvents.splice(i, 1); return json(200, { ok: true }); }

    if (p === '/nutrition/api/goals') { if (method === 'PUT') goals = { ...goals, ...body }; return json(200, goals); }
    if (p === '/nutrition/api/summary') return json(200, nutritionSummary(q.get('day')));
    if (p === '/nutrition/api/log' && method === 'GET') {
      const items = entries.filter((e) => e.date === q.get('date')).sort((a, b) => a.time.localeCompare(b.time));
      return json(200, { items, total: items.length, page: 1, per_page: 500 });
    }
    if (p === '/nutrition/api/log' && method === 'POST') { const e = { id: nextEntry++, sugar_g: 0, sodium_mg: 0, notes: '', ...body }; entries.push(e); return json(201, e); }
    if (p === '/nutrition/api/log/quick') {
      const f = foods.find((x) => x.id === body.food_id); if (!f) return json(404, { detail: 'Food not found' });
      logFood(body.date, { ...f, meal: body.meal_type }, body.servings || 1, body.time); return json(201, entries[entries.length - 1]);
    }
    m = p.match(/^\/nutrition\/api\/log\/(\d+)$/);
    if (m) {
      const i = entries.findIndex((x) => x.id === Number(m[1])); if (i < 0) return json(404, { detail: 'Not found' });
      if (method === 'GET') return json(200, entries[i]);
      if (method === 'PUT') { Object.assign(entries[i], body); return json(200, entries[i]); }
      if (method === 'DELETE') { entries.splice(i, 1); return json(200, { ok: true }); }
    }
    if (p === '/nutrition/api/weekly-trend') {
      const days = Math.min(Number(q.get('weeks') || 4) * 7, 91); const data = [];
      for (let d = days - 1; d >= 0; d--) { const date = ago(d); data.push({ date, calories: Math.round(sum(entries.filter((e) => e.date === date)).calories) }); }
      return json(200, { data, goals });
    }
    if (p === '/nutrition/api/foods/search') {
      const term = (q.get('q') || '').toLowerCase();
      return json(200, { items: foods.filter((f) => f.food_name.toLowerCase().includes(term)).map((f) => ({ ...f, source: 'seeded' })) });
    }

    if (p === '/finance/api/meta') {
      const grouped = {}; fAccounts.forEach((a) => { (grouped[a.group_name] ||= []).push({ name: a.name, icon: a.icon }); });
      return json(200, { accounts: fAccounts.map((a) => a.name), categories: [...new Set(ft.map((t) => t.category))].sort(), accounts_grouped: grouped, card_accounts: ['Credit Card'] });
    }
    if (p === '/finance/api/summary') return json(200, finSummary(q.get('month')));
    if (p === '/finance/api/monthly-trend') {
      const n = Number(q.get('months') || 12); const out = [];
      for (let i = n - 1; i >= 0; i--) { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - i); const key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`; const s = finSummary(key); out.push({ month: key, income: s.income, expenses: s.expenses }); }
      return json(200, { data: out });
    }
    if (p === '/finance/api/category-breakdown') {
      const type = q.get('type') === 'income' ? 'Income' : 'Exp.'; const totals = {};
      ft.filter((t) => ym(t.date) === q.get('month') && t.type === type).forEach((t) => { totals[t.category] = (totals[t.category] || 0) + t.amount; });
      return json(200, { data: Object.entries(totals).map(([category, total]) => ({ category, total })).sort((a, b) => b.total - a.total) });
    }
    if (p === '/finance/api/accounts') {
      const accounts = fAccounts.map((a) => {
        const mine = ft.filter((t) => t.account === a.name);
        const credits = mine.filter((t) => t.type === 'Income').reduce((s, t) => s + t.amount, 0); const debits = mine.filter((t) => t.type === 'Exp.').reduce((s, t) => s + t.amount, 0);
        return { account: a.name, group_name: a.group_name, icon: a.icon, account_id: a.account_id, credits, debits, balance: credits - debits, txn_count: mine.length };
      });
      return json(200, { total_balance: accounts.reduce((s, a) => s + a.balance, 0), accounts });
    }
    if (p === '/finance/api/account-records') return json(200, { accounts: fAccounts });
    if (p === '/finance/api/transactions' && method === 'GET') {
      let list = [...ft];
      const f = (k) => q.get(k);
      if (f('date_from')) list = list.filter((t) => t.date >= f('date_from'));
      if (f('date_to')) list = list.filter((t) => t.date <= f('date_to'));
      if (f('account')) list = list.filter((t) => t.account === f('account'));
      if (f('type')) list = list.filter((t) => t.type === f('type'));
      if (f('category')) list = list.filter((t) => t.category === f('category'));
      if (f('search')) list = list.filter((t) => (t.note + t.category + t.account).toLowerCase().includes(f('search').toLowerCase()));
      const sort = f('sort') || 'date_desc';
      list.sort((a, b) => (sort === 'date_asc' ? a.date.localeCompare(b.date) : sort === 'amount_desc' ? b.amount - a.amount : sort === 'amount_asc' ? a.amount - b.amount : b.date.localeCompare(a.date) || b.id - a.id));
      const per = Number(f('per_page') || 25); const page = Number(f('page') || 1);
      return json(200, { items: list.slice((page - 1) * per, page * per), total: list.length, page, pages: Math.max(1, Math.ceil(list.length / per)), per_page: per });
    }
    if (p === '/finance/api/transactions' && method === 'POST') { const t = { id: nextFt++, php: Number(body.amount), description: body.note || '', personal_amount: 0, non_personal_amount: 0, ...body }; ft.push(t); return json(201, t); }
    m = p.match(/^\/finance\/api\/transactions\/(\d+)$/);
    if (m) {
      const i = ft.findIndex((x) => x.id === Number(m[1])); if (i < 0) return json(404, { detail: 'Not found' });
      if (method === 'GET') return json(200, ft[i]);
      if (method === 'PUT') { Object.assign(ft[i], body, { php: Number(body.amount ?? ft[i].amount) }); return json(200, ft[i]); }
      if (method === 'DELETE') { ft.splice(i, 1); return json(200, { ok: true }); }
    }
    if (p.startsWith('/finance/api/')) return json(200, { items: [], cards: [], data: [], total: 0 });

    return json(404, { detail: 'Not found' });
  };

  /* ---------------------------------------------------------------- ribbon */
  document.addEventListener('DOMContentLoaded', () => {
    const bar = document.createElement('div');
    bar.setAttribute('role', 'note');
    bar.style.cssText = 'background:#facc15;color:#1a1a1a;padding:.5rem 1rem;font:600 13px/1.4 system-ui,sans-serif;text-align:center;width:100%;flex:none;z-index:1000;position:relative';
    bar.innerHTML = 'Demo with made-up sample data. Nothing here is connected to anything. <a href="/projects/openclaw-local.html" style="color:#1a1a1a">Back to the case study</a>';
    document.body.prepend(bar);
  });
})();
