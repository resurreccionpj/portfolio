/* Mock API for the Frostbite demo. All data is made up and lives in memory only.
   It answers the same /api routes the real Express server does, so the original UI runs unchanged. */
(() => {
  const iso = (d) => d.toISOString().slice(0, 10);
  const ago = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return iso(d); };
  const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

  let nextAccount = 100, nextCategory = 100, nextTx = 1000;

  const accounts = [
    { id: 1, name: 'Everyday Wallet', type: 'Cash', icon: '👛', account_group: 'Cash' },
    { id: 2, name: 'Main Savings', type: 'Savings', icon: '🏦', account_group: 'Savings' },
    { id: 3, name: 'Emergency Fund', type: 'Savings', icon: '🛟', account_group: 'Savings' },
    { id: 4, name: 'Rewards Card', type: 'Credit Card', icon: '💳', account_group: 'Credit Card' },
    { id: 5, name: 'Index Fund', type: 'Investments', icon: '📈', account_group: 'Investment' },
    { id: 6, name: 'Payroll Account', type: 'Savings', icon: '🏧', account_group: 'Checking' },
  ];

  const categories = [
    { id: 1, name: 'Salary', type: 'Income', icon: '💼', is_offset: 0 },
    { id: 2, name: 'Side Projects', type: 'Income', icon: '💻', is_offset: 0 },
    { id: 3, name: 'Interest', type: 'Income', icon: '🪙', is_offset: 0 },
    { id: 4, name: 'Groceries', type: 'Expense', icon: '🛒', is_offset: 0 },
    { id: 5, name: 'Rent', type: 'Expense', icon: '🏠', is_offset: 0 },
    { id: 6, name: 'Transport', type: 'Expense', icon: '🚌', is_offset: 0 },
    { id: 7, name: 'Dining Out', type: 'Expense', icon: '🍜', is_offset: 0 },
    { id: 8, name: 'Utilities', type: 'Expense', icon: '💡', is_offset: 0 },
    { id: 9, name: 'Subscriptions', type: 'Expense', icon: '📺', is_offset: 0 },
    { id: 10, name: 'Health', type: 'Expense', icon: '💊', is_offset: 0 },
    { id: 11, name: 'Shopping', type: 'Expense', icon: '🛍️', is_offset: 0 },
    { id: 12, name: 'Fun', type: 'Expense', icon: '🎮', is_offset: 0 },
  ];

  const tx = [];
  const add = (type, amount, daysAgo, description, o) => {
    tx.push({
      id: nextTx++, type, amount, date: ago(daysAgo), description,
      category_id: o.cat ?? null, account_id: o.acc ?? null,
      from_account_id: o.from ?? null, to_account_id: o.to ?? null,
      is_offset: 0, is_dummy: 0, created_at: ago(daysAgo) + 'T08:00:00',
    });
  };

  // Sample history, oldest first so ids ascend with time.
  const months = [66, 36, 6];
  months.forEach((d, i) => {
    add('Income', 52000, d - 3 + (d > 40 ? 0 : 0), 'Monthly pay', { cat: 1, acc: 6 });
    add('Expense', 18000, d, 'Apartment rent', { cat: 5, acc: 6 });
    add('Transfer', 15000, d - 4, 'Save for the month', { from: 6, to: 2 });
    add('Transfer', 4000, d - 2, 'Index fund top-up', { from: 6, to: 5 });
    add('Transfer', 5000, d - 5, 'Pocket money', { from: 6, to: 1 });
    add('Expense', 2450 - i * 120, d + 3, 'Electric and water', { cat: 8, acc: 6 });
    add('Expense', 1699, d + 4, 'Fiber internet', { cat: 8, acc: 6 });
    add('Expense', 549, d + 5, 'Streaming plan', { cat: 9, acc: 4 });
    add('Expense', 179, d + 6, 'Cloud storage', { cat: 9, acc: 4 });
    add('Income', 126.4 + i * 3.1, d + 1, 'Savings interest', { cat: 3, acc: 2 });
  });
  add('Income', 8500, 54, 'Website job', { cat: 2, acc: 6 });
  add('Income', 12000, 22, 'Small app project', { cat: 2, acc: 6 });
  add('Transfer', 3000, 30, 'Top up emergency fund', { from: 2, to: 3 });
  add('Transfer', 3000, 3, 'Top up emergency fund', { from: 2, to: 3 });
  [[1850, 1, 'Weekly groceries', 1], [2310, 7, 'Groceries', 4], [1540, 14, 'Weekly groceries', 1], [2675, 21, 'Groceries', 4],
   [1980, 28, 'Weekly groceries', 1], [2420, 36, 'Groceries', 4], [2010, 44, 'Weekly groceries', 1], [1750, 52, 'Groceries', 1],
   [2290, 60, 'Groceries', 4], [1920, 68, 'Weekly groceries', 1]].forEach(([a, d, t, acc]) => add('Expense', a, d, t, { cat: 4, acc }));
  [[380, 2, 'Lunch with friends', 1], [540, 9, 'Dinner out', 4], [265, 15, 'Coffee and pastry', 1], [720, 23, 'Birthday dinner', 4],
   [310, 31, 'Noodle house', 1], [460, 40, 'Brunch', 4], [295, 49, 'Lunch', 1], [680, 58, 'Dinner out', 4]].forEach(([a, d, t, acc]) => add('Expense', a, d, t, { cat: 7, acc }));
  [[120, 1, 'Bus fare', 1], [85, 4, 'Jeepney', 1], [200, 10, 'Ride share', 4], [96, 17, 'Bus fare', 1], [240, 26, 'Ride share', 4], [110, 39, 'Bus fare', 1]]
    .forEach(([a, d, t, acc]) => add('Expense', a, d, t, { cat: 6, acc }));
  add('Expense', 890, 18, 'Pharmacy', { cat: 10, acc: 4 });
  add('Expense', 1450, 46, 'Dental check-up', { cat: 10, acc: 4 });
  add('Expense', 3299, 24, 'Mechanical keyboard', { cat: 11, acc: 4 });
  add('Expense', 1190, 57, 'Phone case and cable', { cat: 11, acc: 4 });
  add('Expense', 1200, 30, 'Game night', { cat: 12, acc: 4 });
  add('Expense', 650, 12, 'Movie and snacks', { cat: 12, acc: 1 });

  tx.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.id - b.id));
  tx.forEach((t, i) => { t.id = 1000 + i; });
  nextTx = 1000 + tx.length;

  const acc = (id) => accounts.find((a) => a.id === Number(id));
  const cat = (id) => categories.find((c) => c.id === Number(id));
  const balance = (id) => tx.reduce((s, t) => {
    if (t.type === 'Income' && t.account_id === id) return s + t.amount;
    if (t.type === 'Expense' && t.account_id === id) return s - t.amount;
    if (t.type === 'Transfer' && t.to_account_id === id) return s + t.amount;
    if (t.type === 'Transfer' && t.from_account_id === id) return s - t.amount;
    return s;
  }, 0);
  const withBalance = (a) => ({ ...a, balance: Math.round(balance(a.id) * 100) / 100 });
  const joined = (t) => ({
    ...t,
    category_name: cat(t.category_id)?.name ?? null, category_icon: cat(t.category_id)?.icon ?? null,
    account_name: acc(t.account_id)?.name ?? null,
    from_account_name: acc(t.from_account_id)?.name ?? null, to_account_name: acc(t.to_account_id)?.name ?? null,
  });

  const realFetch = window.fetch.bind(window);
  window.fetch = async (input, init = {}) => {
    const url = new URL(typeof input === 'string' ? input : input.url, location.href);
    if (!url.pathname.startsWith('/api/')) return realFetch(input, init);
    const method = (init.method || 'GET').toUpperCase();
    const parts = url.pathname.replace(/^\/api\//, '').split('/');
    const [res, id, action] = parts;
    const body = init.body ? JSON.parse(init.body) : {};

    if (res === 'accounts') {
      if (method === 'GET') return json(200, accounts.map(withBalance).sort((a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name)));
      if (method === 'POST' && !id) {
        if (!body.name || !body.type) return json(400, { error: 'name and type are required' });
        const a = { id: nextAccount++, name: body.name, type: body.type, icon: body.icon || '', account_group: body.account_group || '' };
        accounts.push(a);
        return json(201, { ...a, balance: 0 });
      }
      if (method === 'POST' && action === 'override') {
        const a = acc(id); if (!a) return json(404, { error: 'Account not found' });
        const diff = parseFloat(body.balance) - balance(a.id);
        if (Math.abs(diff) < 0.005) return json(200, { success: true, balance: balance(a.id), offsetCreated: false });
        let off = categories.find((c) => c.is_offset);
        if (!off) { off = { id: nextCategory++, name: 'Offset', type: 'Expense', icon: '🔧', is_offset: 1 }; categories.push(off); }
        tx.push({ id: nextTx++, type: diff > 0 ? 'Income' : 'Expense', amount: Math.abs(diff), date: ago(0), description: 'Manual balance correction',
          category_id: off.id, account_id: a.id, from_account_id: null, to_account_id: null, is_offset: 1, is_dummy: 0, created_at: new Date().toISOString() });
        return json(200, { success: true, balance: parseFloat(body.balance), offsetCreated: true });
      }
      if (method === 'PUT') {
        const a = acc(id); if (!a) return json(404, { error: 'Account not found' });
        Object.assign(a, Object.fromEntries(Object.entries(body).filter(([k, v]) => ['name', 'type', 'icon', 'account_group'].includes(k) && v !== undefined)));
        return json(200, withBalance(a));
      }
      if (method === 'DELETE') {
        const n = Number(id);
        if (tx.some((t) => t.account_id === n || t.from_account_id === n || t.to_account_id === n)) return json(400, { error: 'Cannot delete account with existing transactions' });
        accounts.splice(accounts.findIndex((a) => a.id === n), 1);
        return json(200, { success: true });
      }
    }

    if (res === 'categories') {
      if (method === 'GET') return json(200, [...categories].sort((a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name)));
      if (method === 'POST') {
        const c = { id: nextCategory++, name: body.name, type: body.type, icon: body.icon || '', is_offset: 0 };
        categories.push(c);
        return json(201, c);
      }
      if (method === 'PUT') {
        const c = cat(id); if (!c) return json(404, { error: 'Category not found' });
        Object.assign(c, { name: body.name ?? c.name, type: body.type ?? c.type, icon: body.icon ?? c.icon });
        return json(200, c);
      }
      if (method === 'DELETE') {
        const n = Number(id);
        tx.forEach((t) => { if (t.category_id === n) t.category_id = null; });
        categories.splice(categories.findIndex((c) => c.id === n), 1);
        return json(200, { success: true });
      }
    }

    if (res === 'transactions') {
      if (method === 'GET') {
        const all = url.searchParams.get('include_offset') === '1';
        const list = tx.filter((t) => all || !t.is_offset).sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.id - a.id));
        return json(200, list.map(joined));
      }
      if (method === 'POST') {
        if (!body.type || !body.amount || !body.date) return json(400, { error: 'type, amount, and date are required' });
        const t = { id: nextTx++, type: body.type, amount: Number(body.amount), date: body.date, description: body.description || '',
          category_id: body.type === 'Transfer' ? null : body.category_id ?? null, account_id: body.type === 'Transfer' ? null : body.account_id ?? null,
          from_account_id: body.type === 'Transfer' ? body.from_account_id ?? null : null, to_account_id: body.type === 'Transfer' ? body.to_account_id ?? null : null,
          is_offset: 0, is_dummy: body.is_dummy ? 1 : 0, created_at: new Date().toISOString() };
        tx.push(t);
        return json(201, joined(t));
      }
      if (method === 'PUT') {
        const t = tx.find((x) => x.id === Number(id)); if (!t) return json(404, { error: 'Transaction not found' });
        if (t.is_offset) { if (body.description !== undefined) t.description = body.description; return json(200, t); }
        const type = body.type || t.type;
        Object.assign(t, { type, amount: body.amount !== undefined ? Number(body.amount) : t.amount, date: body.date || t.date,
          description: body.description !== undefined ? body.description : t.description });
        if (type === 'Transfer') Object.assign(t, { account_id: null, category_id: null, from_account_id: body.from_account_id ?? t.from_account_id, to_account_id: body.to_account_id ?? t.to_account_id });
        else Object.assign(t, { from_account_id: null, to_account_id: null, account_id: body.account_id ?? t.account_id, category_id: body.category_id ?? t.category_id });
        return json(200, joined(t));
      }
      if (method === 'DELETE') {
        const i = tx.findIndex((x) => x.id === Number(id));
        if (i < 0) return json(404, { error: 'Transaction not found' });
        tx.splice(i, 1);
        return json(200, { success: true });
      }
    }

    return json(404, { error: 'Not found' });
  };

  // Demo ribbon
  document.addEventListener('DOMContentLoaded', () => {
    const bar = document.createElement('div');
    bar.setAttribute('role', 'note');
    bar.style.cssText = 'background:#facc15;color:#1a1a1a;padding:.55rem 1rem;font:600 14px/1.4 system-ui,sans-serif;text-align:center';
    bar.innerHTML = 'Demo with made-up sample data. Changes are not saved. <a href="/projects/frostbite.html" style="color:#1a1a1a">Back to the case study</a>';
    document.body.prepend(bar);
  });
})();
