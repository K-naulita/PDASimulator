
const PDA_CONFIGS = {

  // ── Language: aⁿbⁿ (n ≥ 1) ──
  anbn: {
    name: "aⁿbⁿ",
    alphabet: ['a', 'b'],
    startState: 'q0',
    startStack: ['Z'],
    acceptStates: new Set(['q3']),
    desc: `<strong>Bahasa: aⁿbⁿ</strong> — string dengan jumlah 'a' sama dengan 'b'.<br>
Contoh ACCEPTED: <strong>ab, aabb, aaabbb</strong><br>
Contoh REJECTED: <strong>aab, ba, aaabbbb</strong>`,
    transitions: {
      'q0,a,Z': [{ to: 'q1', push: ['a', 'Z'] }],
      'q1,a,a': [{ to: 'q1', push: ['a', 'a'] }],
      'q1,b,a': [{ to: 'q2', push: [] }],
      'q2,b,a': [{ to: 'q2', push: [] }],
      'q2,λ,Z': [{ to: 'q3', push: ['Z'] }],
    }
  },

  // ── Language: palindrome sXreverse(s) ──
  palindrome: {
    name: "Palindrome sXs̃",
    alphabet: ['a', 'b', 'X'],
    startState: 'q0',
    startStack: ['Z'],
    acceptStates: new Set(['q3']),
    desc: `<strong>Bahasa: sXreverse(s)</strong> — palindrome dengan separator 'X' di tengah.<br>
s ∈ {a,b}*, reverse(s) adalah kebalikan dari s.<br>
Contoh ACCEPTED: <strong>X, aXa, abXba, abbXbba</strong><br>
Contoh REJECTED: <strong>aXb, abXab, abba</strong>`,
    transitions: {
      'q0,a,Z': [{ to: 'q0', push: ['a', 'Z'] }],
      'q0,a,a': [{ to: 'q0', push: ['a', 'a'] }],
      'q0,a,b': [{ to: 'q0', push: ['a', 'b'] }],
      'q0,b,Z': [{ to: 'q0', push: ['b', 'Z'] }],
      'q0,b,a': [{ to: 'q0', push: ['b', 'a'] }],
      'q0,b,b': [{ to: 'q0', push: ['b', 'b'] }],
      'q0,X,Z': [{ to: 'q1', push: ['Z'] }],
      'q0,X,a': [{ to: 'q1', push: ['a'] }],
      'q0,X,b': [{ to: 'q1', push: ['b'] }],
      'q1,a,a': [{ to: 'q1', push: [] }],
      'q1,b,b': [{ to: 'q1', push: [] }],
      'q1,λ,Z': [{ to: 'q3', push: ['Z'] }],
    }
  },

  // ── Language: #a = #b ──
  equal: {
    name: "#a = #b",
    alphabet: ['a', 'b'],
    startState: 'q0',
    startStack: ['Z'],
    acceptStates: new Set(['q0']),
    desc: `<strong>Bahasa: #a = #b</strong> — jumlah karakter 'a' sama dengan jumlah 'b' (urutan bebas).<br>
Contoh ACCEPTED: <strong>ab, ba, abba, aabb, baba</strong><br>
Contoh REJECTED: <strong>a, aab, bbb</strong>`,
    transitions: {
      'q0,a,Z': [{ to: 'q0', push: ['a', 'Z'] }],
      'q0,a,a': [{ to: 'q0', push: ['a', 'a'] }],
      'q0,a,b': [{ to: 'q0', push: [] }],
      'q0,b,Z': [{ to: 'q0', push: ['b', 'Z'] }],
      'q0,b,b': [{ to: 'q0', push: ['b', 'b'] }],
      'q0,b,a': [{ to: 'q0', push: [] }],
      'q0,λ,Z': [{ to: 'q0', push: ['Z'] }],
    }
  },

  // ── Placeholder: Custom PDA ──
  custom: {
    name: "Custom",
    alphabet: [],
    startState: 'q0',
    startStack: ['Z'],
    acceptStates: new Set(['qA']),
    desc: `<strong>Custom PDA</strong> — Definisikan sendiri transisi mesin PDA Anda menggunakan builder di bawah.`,
    transitions: {}
  }
};

let currentPDA = 'anbn';
let customTransitions = {};
let customAccept = new Set(['qA']);
let customStart = 'q0';

let stepHistory = [];
let stepIdx = -1;

let statAcc = 0, statRej = 0;

function key(state, read, top) {
  return `${state},${read},${top}`;
}

function getConfig() {
  const cfg = PDA_CONFIGS[currentPDA];
  if (currentPDA === 'custom') {
    cfg.transitions   = customTransitions;
    cfg.acceptStates  = customAccept;
    cfg.startState    = customStart;
  }
  return cfg;
}

//  PDA ENGINE
function runPDAOnString(inputStr) {
  const cfg   = getConfig();
  const input = inputStr === '' ? [] : inputStr.split('');

  let state = cfg.startState;
  let stack = [...cfg.startStack];        
  const history = [];

  history.push({ state, stackSnap: [...stack], readIdx: -1, readChar: 'λ', action: 'START' });

  let idx = 0;
  let steps = 0;
  const MAX_STEPS = 2000;

  while (steps++ < MAX_STEPS) {
    const top      = stack.length ? stack[stack.length - 1] : 'λ';
    const readChar = idx < input.length ? input[idx] : 'λ';

    let matched  = null;
    let consumed = false;

    if (idx < input.length) {
      const k = key(state, readChar, top);
      if (cfg.transitions[k]) { matched = cfg.transitions[k][0]; consumed = true; }
    }

    if (!matched) {
      const k = key(state, 'λ', top);
      if (cfg.transitions[k]) { matched = cfg.transitions[k][0]; consumed = false; }
    }

    if (!matched) break;  

    stack.pop();
    if (consumed) idx++;

    for (let i = matched.push.length - 1; i >= 0; i--) {
      stack.push(matched.push[i]);
    }

    state = matched.to;

    history.push({
      state,
      stackSnap: [...stack],
      readIdx:  consumed ? idx - 1 : idx,
      readChar: consumed ? readChar : 'λ',
      action:   matched.push.length === 0
                  ? `POP (${top})`
                  : matched.push.length > 1
                    ? `PUSH (${matched.push.join('')})`
                    : 'REPLACE'
    });

    // Accepted: di accept state DAN input sudah habis
    if (cfg.acceptStates.has(state) && idx >= input.length) {
      return { accepted: true, history, state };
    }
  }

  const accepted = cfg.acceptStates.has(state) && idx >= input.length;
  return { accepted, history, state };
}

function showResult(accepted, str) {
  const banner = document.getElementById('result-banner');
  banner.className = accepted ? 'accepted' : 'rejected';
  document.getElementById('res-icon').textContent = accepted ? '✓' : '✗';
  document.getElementById('res-text').textContent = accepted
    ? `"${str || 'ε'}" → ACCEPTED`
    : `"${str || 'ε'}" → REJECTED`;
}

function renderTape(str, headAt, final, current) {
  const wrap  = document.getElementById('tape-cells');
  wrap.innerHTML = '';
  const chars = str === '' ? ['ε'] : str.split('');
  const pos   = current ?? headAt;

  chars.forEach((ch, i) => {
    const cell = document.createElement('div');
    cell.className = 'tape-cell';
    if (final && i < pos)   cell.classList.add('done');
    if (i === pos) {
      cell.classList.add('active');
      const ind = document.createElement('div');
      ind.className   = 'tape-head-indicator';
      ind.textContent = '▲';
      cell.appendChild(ind);
    }
    cell.appendChild(document.createTextNode(ch));
    wrap.appendChild(cell);
  });
}

function renderStack(snap) {
  const wrap = document.getElementById('stack-cells');
  wrap.innerHTML = '';
  if (!snap || snap.length === 0) {
    wrap.innerHTML = '<span class="stack-empty">kosong</span>';
    return;
  }
  snap.forEach(ch => {
    const el = document.createElement('div');
    el.className = 'stack-item ' + (
      ch === 'a' ? 'a-item' :
      ch === 'b' ? 'b-item' :
      ch === 'X' ? 'x-item' : 'other-item'
    );
    el.textContent = ch;
    wrap.appendChild(el);
  });
}

function renderTrace(history) {
  const log = document.getElementById('trace-log');
  log.innerHTML = '';
  history.forEach((frame, i) => {
    const row = document.createElement('div');
    row.className = 'trace-entry' + (i === history.length - 1 ? ' current' : '');
    row.innerHTML = `
      <span class="t-state">${frame.state}</span>
      <span class="t-read">read: ${frame.readChar}</span>
      <span class="t-stack">stack: [${frame.stackSnap.join('')}] ${frame.action || ''}</span>
    `;
    log.appendChild(row);
  });
  log.scrollTop = log.scrollHeight;
}

function updateStats() {
  document.getElementById('stat-acc').textContent   = statAcc;
  document.getElementById('stat-rej').textContent   = statRej;
  document.getElementById('stat-total').textContent = statAcc + statRej;
}

function runPDA() {
  const str = document.getElementById('string-input').value.trim();
  const { accepted, history } = runPDAOnString(str);

  if (accepted) statAcc++; else statRej++;
  updateStats();

  showResult(accepted, str);
  renderTape(str, history[history.length - 1]?.readIdx ?? -1, true);
  renderStack(history[history.length - 1]?.stackSnap ?? []);
  renderTrace(history);
}

function startStep() {
  const str = document.getElementById('string-input').value.trim();
  const { history } = runPDAOnString(str);
  stepHistory = history;
  stepIdx     = 0;

  document.getElementById('step-controls').classList.add('visible');
  document.getElementById('result-banner').className = '';
  document.getElementById('result-banner').style.display = 'none';

  applyStep(str);
}

function doStep(dir) {
  const str = document.getElementById('string-input').value.trim();
  stepIdx = Math.max(0, Math.min(stepHistory.length - 1, stepIdx + dir));
  applyStep(str);
  if (stepIdx === stepHistory.length - 1) {
    const { accepted } = runPDAOnString(str);
    showResult(accepted, str);
  }
}

function applyStep(str) {
  const frame = stepHistory[stepIdx];
  document.getElementById('step-info').textContent =
    `Langkah ${stepIdx + 1} / ${stepHistory.length}  |  State: ${frame.state}`;
  renderTape(str, frame.readIdx, false, frame.readIdx);
  renderStack(frame.stackSnap);
  renderTrace(stepHistory.slice(0, stepIdx + 1));
}

function exitStep() {
  document.getElementById('step-controls').classList.remove('visible');
  stepHistory = [];
  stepIdx     = -1;
}

function clearAll() {
  document.getElementById('string-input').value = '';
  const banner = document.getElementById('result-banner');
  banner.className = '';
  banner.style.display = 'none';
  document.getElementById('tape-cells').innerHTML    = '';
  document.getElementById('stack-cells').innerHTML   = '<span class="stack-empty">kosong</span>';
  document.getElementById('trace-log').innerHTML     = '';
  exitStep();
}

function runBatch() {
  const lines = document.getElementById('batch-input').value
    .split('\n').map(l => l.trim()).filter(l => l !== '');
  const container = document.getElementById('batch-results');
  container.innerHTML = '';

  lines.forEach(str => {
    const { accepted } = runPDAOnString(str);
    if (accepted) statAcc++; else statRej++;

    const row = document.createElement('div');
    row.className = 'batch-row ' + (accepted ? 'acc' : 'rej');
    row.innerHTML = `
      <span class="batch-str">${str || 'ε'}</span>
      <span class="batch-verdict ${accepted ? 'acc' : 'rej'}">${accepted ? 'ACCEPTED' : 'REJECTED'}</span>
    `;
    container.appendChild(row);
  });

  updateStats();
}

function clearBatch() {
  document.getElementById('batch-results').innerHTML = '';
  document.getElementById('batch-input').value       = '';
}

let pendingTransitions = {};

function addTransition() {
  const from = document.getElementById('b-from').value.trim();
  const read = document.getElementById('b-read').value.trim() || 'λ';
  const top  = document.getElementById('b-top').value.trim()  || 'λ';
  const to   = document.getElementById('b-to').value.trim();
  const push = document.getElementById('b-push').value.trim();

  if (!from || !to) return;

  const k       = key(from, read, top);
  const pushArr = (push === 'λ' || push === '') ? [] : push.split('');

  if (!pendingTransitions[k]) pendingTransitions[k] = [];
  pendingTransitions[k].push({ to, push: pushArr });
  renderTransitions();
}

function renderTransitions() {
  const list = document.getElementById('transitions-list');
  list.innerHTML = '';
  Object.entries(pendingTransitions).forEach(([k, rules]) => {
    rules.forEach((r, ri) => {
      const el = document.createElement('div');
      el.className = 'trans-item';
      el.innerHTML = `
        <span>(${k}) → (${r.to}, ${r.push.length ? r.push.join('') : 'λ'})</span>
        <button class="trans-del" onclick="delTransition('${k}', ${ri})">✕</button>
      `;
      list.appendChild(el);
    });
  });
}

function delTransition(k, ri) {
  pendingTransitions[k].splice(ri, 1);
  if (!pendingTransitions[k].length) delete pendingTransitions[k];
  renderTransitions();
}

function applyCustomPDA() {
  const startState = document.getElementById('b-start').value.trim()  || 'q0';
  const acceptRaw  = document.getElementById('b-accept').value.trim() || 'qA';

  customTransitions = { ...pendingTransitions };
  customAccept      = new Set(acceptRaw.split(',').map(s => s.trim()));
  customStart       = startState;

  PDA_CONFIGS.custom.startState   = startState;
  PDA_CONFIGS.custom.acceptStates = customAccept;
  PDA_CONFIGS.custom.transitions  = customTransitions;
}

const DIAGRAMS = {
  anbn: () => `
    <svg width="580" height="140" viewBox="0 0 580 140" xmlns="http://www.w3.org/2000/svg" font-family="Space Mono, monospace">
      <defs>
        <marker id="arr"  markerWidth="8" markerHeight="6" refX="6" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#f97316"/></marker>
        <marker id="arb"  markerWidth="8" markerHeight="6" refX="6" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#3b82f6"/></marker>
      </defs>
      <!-- States -->
      <circle cx="80"  cy="70" r="28" fill="none" stroke="#2563eb" stroke-width="2"/>
      <circle cx="80"  cy="70" r="22" fill="none" stroke="#2563eb" stroke-width="1" opacity=".3"/>
      <text x="80"  y="74" text-anchor="middle" fill="#f0f4ff" font-size="12">q0</text>
      <circle cx="220" cy="70" r="28" fill="none" stroke="#2563eb" stroke-width="2"/>
      <text x="220" y="74" text-anchor="middle" fill="#f0f4ff" font-size="12">q1</text>
      <circle cx="370" cy="70" r="28" fill="none" stroke="#2563eb" stroke-width="2"/>
      <text x="370" y="74" text-anchor="middle" fill="#f0f4ff" font-size="12">q2</text>
      <circle cx="510" cy="70" r="28" fill="none" stroke="#22c55e" stroke-width="2.5"/>
      <circle cx="510" cy="70" r="21" fill="none" stroke="#22c55e" stroke-width="1.5"/>
      <text x="510" y="74" text-anchor="middle" fill="#22c55e" font-size="12">q3</text>
      <!-- Start arrow -->
      <line x1="22" y1="70" x2="49" y2="70" stroke="#f97316" stroke-width="2" marker-end="url(#arr)"/>
      <text x="5" y="66" fill="#f97316" font-size="9">START</text>
      <!-- Edges -->
      <line x1="108" y1="70" x2="190" y2="70" stroke="#3b82f6" stroke-width="1.5" marker-end="url(#arb)"/>
      <text x="149" y="62" text-anchor="middle" fill="#fb923c" font-size="9">a,Z/aZ</text>
      <line x1="248" y1="70" x2="340" y2="70" stroke="#3b82f6" stroke-width="1.5" marker-end="url(#arb)"/>
      <text x="294" y="62" text-anchor="middle" fill="#fb923c" font-size="9">b,a/λ</text>
      <line x1="398" y1="70" x2="480" y2="70" stroke="#3b82f6" stroke-width="1.5" marker-end="url(#arb)"/>
      <text x="439" y="62" text-anchor="middle" fill="#fb923c" font-size="9">λ,Z/Z</text>
      <!-- Self loops -->
      <path d="M205 44 Q220 10 235 44" fill="none" stroke="#1e3a6b" stroke-width="1.5" marker-end="url(#arb)"/>
      <text x="220" y="15" text-anchor="middle" fill="#8ca0c4" font-size="8">a,a/aa</text>
      <path d="M355 44 Q370 10 385 44" fill="none" stroke="#1e3a6b" stroke-width="1.5" marker-end="url(#arb)"/>
      <text x="370" y="15" text-anchor="middle" fill="#8ca0c4" font-size="8">b,a/λ</text>
    </svg>`,

  palindrome: () => `
    <svg width="580" height="140" viewBox="0 0 580 140" xmlns="http://www.w3.org/2000/svg" font-family="Space Mono, monospace">
      <defs>
        <marker id="arb2" markerWidth="8" markerHeight="6" refX="6" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#3b82f6"/></marker>
        <marker id="arr2" markerWidth="8" markerHeight="6" refX="6" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#f97316"/></marker>
      </defs>
      <circle cx="80"  cy="70" r="28" fill="none" stroke="#2563eb" stroke-width="2"/>
      <text x="80"  y="74" text-anchor="middle" fill="#f0f4ff" font-size="12">q0</text>
      <circle cx="290" cy="70" r="28" fill="none" stroke="#2563eb" stroke-width="2"/>
      <text x="290" y="74" text-anchor="middle" fill="#f0f4ff" font-size="12">q1</text>
      <circle cx="500" cy="70" r="28" fill="none" stroke="#22c55e" stroke-width="2.5"/>
      <circle cx="500" cy="70" r="21" fill="none" stroke="#22c55e" stroke-width="1.5"/>
      <text x="500" y="74" text-anchor="middle" fill="#22c55e" font-size="12">q3</text>
      <line x1="22" y1="70" x2="49" y2="70" stroke="#f97316" stroke-width="2" marker-end="url(#arr2)"/>
      <text x="5" y="66" fill="#f97316" font-size="9">START</text>
      <line x1="108" y1="70" x2="260" y2="70" stroke="#3b82f6" stroke-width="1.5" marker-end="url(#arb2)"/>
      <text x="184" y="61" text-anchor="middle" fill="#fb923c" font-size="9">X, */top</text>
      <line x1="318" y1="70" x2="470" y2="70" stroke="#3b82f6" stroke-width="1.5" marker-end="url(#arb2)"/>
      <text x="394" y="61" text-anchor="middle" fill="#fb923c" font-size="9">λ,Z/Z</text>
      <path d="M63 44 Q80 8 97 44" fill="none" stroke="#1e3a6b" stroke-width="1.5" marker-end="url(#arb2)"/>
      <text x="80" y="12" text-anchor="middle" fill="#8ca0c4" font-size="8">a/b, */push</text>
      <path d="M273 44 Q290 8 307 44" fill="none" stroke="#1e3a6b" stroke-width="1.5" marker-end="url(#arb2)"/>
      <text x="290" y="12" text-anchor="middle" fill="#8ca0c4" font-size="8">a/b, match/pop</text>
    </svg>`,

  equal: () => `
    <svg width="580" height="140" viewBox="0 0 580 140" xmlns="http://www.w3.org/2000/svg" font-family="Space Mono, monospace">
      <defs>
        <marker id="arb3" markerWidth="8" markerHeight="6" refX="6" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#3b82f6"/></marker>
        <marker id="arr3" markerWidth="8" markerHeight="6" refX="6" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#f97316"/></marker>
      </defs>
      <circle cx="290" cy="70" r="36" fill="none" stroke="#22c55e" stroke-width="2.5"/>
      <circle cx="290" cy="70" r="28" fill="none" stroke="#22c55e" stroke-width="1.5"/>
      <text x="290" y="74" text-anchor="middle" fill="#22c55e" font-size="14">q0</text>
      <line x1="40" y1="70" x2="251" y2="70" stroke="#f97316" stroke-width="2" marker-end="url(#arr3)"/>
      <text x="20" y="66" fill="#f97316" font-size="9">START</text>
      <path d="M272 34 Q250 5 268 34" fill="none" stroke="#3b82f6" stroke-width="1.5" marker-end="url(#arb3)"/>
      <text x="215" y="18" text-anchor="middle" fill="#fb923c" font-size="8">a,b/λ  b,a/λ</text>
      <path d="M310 36 Q340 5 312 36" fill="none" stroke="#3b82f6" stroke-width="1.5" marker-end="url(#arb3)"/>
      <text x="370" y="18" text-anchor="middle" fill="#8ca0c4" font-size="8">a,Z/aZ  b,Z/bZ</text>
      <text x="290" y="115" text-anchor="middle" fill="#22c55e" font-size="9">ACCEPT jika stack Z &amp; input habis</text>
    </svg>`,

  custom: () => `
    <svg width="580" height="140" viewBox="0 0 580 140" xmlns="http://www.w3.org/2000/svg" font-family="Space Mono, monospace">
      <text x="290" y="60"  text-anchor="middle" fill="#8ca0c4" font-size="13">Diagram akan dihasilkan setelah</text>
      <text x="290" y="82"  text-anchor="middle" fill="#8ca0c4" font-size="13">Custom PDA diterapkan</text>
      <text x="290" y="104" text-anchor="middle" fill="#f97316" font-size="10">Gunakan builder di bawah ↓</text>
    </svg>`
};


document.getElementById('pda-tabs').addEventListener('click', e => {
  const tab = e.target.closest('.pda-tab');
  if (!tab) return;

  document.querySelectorAll('.pda-tab').forEach(t => t.classList.remove('active'));
  tab.classList.add('active');
  currentPDA = tab.dataset.pda;

  document.getElementById('pda-diagram').innerHTML = DIAGRAMS[currentPDA]?.() ?? '';
  document.getElementById('pda-desc').innerHTML    = PDA_CONFIGS[currentPDA]?.desc ?? '';

  const builder = document.getElementById('custom-builder');
  currentPDA === 'custom'
    ? builder.classList.add('visible')
    : builder.classList.remove('visible');

  clearAll();
});

document.getElementById('pda-diagram').innerHTML = DIAGRAMS.anbn();
document.getElementById('pda-desc').innerHTML    = PDA_CONFIGS.anbn.desc;
