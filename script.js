/* ============================================================
   WordCraft Pro – Main Application Logic
   ============================================================ */

(function () {
  'use strict';

  // ─── DOM REFS ────────────────────────────────────────────
  const editor        = document.getElementById('main-editor');
  const themeToggle   = document.getElementById('theme-toggle');
  const hamburger     = document.getElementById('hamburger');
  const navLinks      = document.getElementById('nav-links');

  // Stat bar
  const sbWords       = document.getElementById('sb-words');
  const sbChars       = document.getElementById('sb-chars');
  const sbSentences   = document.getElementById('sb-sentences');
  const sbParagraphs  = document.getElementById('sb-paragraphs');
  const sbReading     = document.getElementById('sb-reading');
  const sbSpeaking    = document.getElementById('sb-speaking');

  // Detail panel
  const dWords        = document.getElementById('d-words');
  const dCharsNs      = document.getElementById('d-chars-ns');
  const dCharsS       = document.getElementById('d-chars-s');
  const dSentences    = document.getElementById('d-sentences');
  const dParagraphs   = document.getElementById('d-paragraphs');
  const dLines        = document.getElementById('d-lines');
  const dUnique       = document.getElementById('d-unique');
  const dAvgWord      = document.getElementById('d-avg-word');
  const dAvgSentence  = document.getElementById('d-avg-sentence');
  const dLongest      = document.getElementById('d-longest-sentence');
  const dShortest     = document.getElementById('d-shortest-sentence');
  const dSyllables    = document.getElementById('d-syllables');
  const dReadLevel    = document.getElementById('d-reading-level');
  const dFlesch       = document.getElementById('d-flesch');
  const dReadTime     = document.getElementById('d-read-time');
  const dSpeakTime    = document.getElementById('d-speak-time');

  // Flow panel
  const flowChart     = document.getElementById('flow-chart');
  const flowEmpty     = document.getElementById('flow-empty');
  const flowScoreDisp = document.getElementById('flow-score-display');
  const flowScoreVal  = document.getElementById('flow-score-val');

  // Keyword panel
  const kdList        = document.getElementById('kd-list');
  const kdEmpty       = document.getElementById('kd-empty');

  // Goal
  const goalBarWrap   = document.getElementById('goal-bar-wrap');
  const goalBarLabel  = document.getElementById('goal-bar-label');
  const goalBarFill   = document.getElementById('goal-bar-fill');
  const goalTypeEl    = document.getElementById('goal-type-select');
  const goalValueEl   = document.getElementById('goal-value-input');
  const setGoalBtn    = document.getElementById('set-goal-btn');
  const clearGoalBtn  = document.getElementById('clear-goal-btn');

  // Find & Replace
  const findReplacePanel = document.getElementById('find-replace-panel');
  const findInput     = document.getElementById('find-input');
  const replaceInput  = document.getElementById('replace-input');
  const doReplaceBtn  = document.getElementById('do-replace-btn');
  const closeFrBtn    = document.getElementById('close-fr-btn');
  const frResult      = document.getElementById('fr-result');

  // Modal
  const modalOverlay  = document.getElementById('modal-overlay');
  const modalTitle    = document.getElementById('modal-title');
  const modalBody     = document.getElementById('modal-body');
  const modalClose    = document.getElementById('modal-close');

  // ─── STATE ───────────────────────────────────────────────
  let goal = { type: 'words', target: 0 };
  let activeKdN = 1;
  let undoStack = [''];
  let redoStack = [];
  let undoPending = null;
  let stats = {};

  // ─── THEME ───────────────────────────────────────────────
  const savedTheme = localStorage.getItem('wcp-theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('wcp-theme', next);
    themeToggle.textContent = next === 'dark' ? '☀️' : '🌙';
  });

  // ─── HAMBURGER ───────────────────────────────────────────
  hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));

  // ─── AUTO-SAVE ───────────────────────────────────────────
  const saved = localStorage.getItem('wcp-text');
  if (saved) editor.value = saved;

  // ─── UNDO / REDO ─────────────────────────────────────────
  function pushUndo(val) {
    if (undoStack[undoStack.length - 1] !== val) {
      undoStack.push(val);
      if (undoStack.length > 200) undoStack.shift();
      redoStack = [];
    }
  }

  document.getElementById('undo-btn').addEventListener('click', () => {
    if (undoStack.length > 1) {
      redoStack.push(undoStack.pop());
      editor.value = undoStack[undoStack.length - 1];
      analyzeText();
    }
  });
  document.getElementById('redo-btn').addEventListener('click', () => {
    if (redoStack.length > 0) {
      const val = redoStack.pop();
      undoStack.push(val);
      editor.value = val;
      analyzeText();
    }
  });

  // ─── COPY ────────────────────────────────────────────────
  document.getElementById('copy-btn').addEventListener('click', () => {
    if (!editor.value) return;
    navigator.clipboard.writeText(editor.value).then(() => {
      const btn = document.getElementById('copy-btn');
      const orig = btn.textContent;
      btn.textContent = '✅ Copied!';
      setTimeout(() => { btn.textContent = orig; }, 1500);
    });
  });

  // ─── CLEAR ───────────────────────────────────────────────
  document.getElementById('clear-btn').addEventListener('click', () => {
    if (editor.value && confirm('Clear all text? This cannot be undone.')) {
      pushUndo(editor.value);
      editor.value = '';
      analyzeText();
    }
  });

  // ─── MAIN EDITOR INPUT ───────────────────────────────────
  editor.addEventListener('input', () => {
    clearTimeout(undoPending);
    undoPending = setTimeout(() => pushUndo(editor.value), 600);
    localStorage.setItem('wcp-text', editor.value);
    analyzeText();
  });

  // ─── ANALYSIS ENGINE ─────────────────────────────────────
  function analyzeText() {
    const raw = editor.value;
    const trimmed = raw.trim();

    // Words
    const words = trimmed === '' ? [] : trimmed.split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;

    // Characters
    const charsWithSpaces = raw.length;
    const charsNoSpaces = raw.replace(/\s/g, '').length;

    // Sentences
    const sentences = trimmed === '' ? [] : trimmed.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
    const sentenceCount = sentences.length;

    // Sentence word lengths
    let longestSentLen = 0, shortestSentLen = 0, avgSentLen = 0;
    if (sentences.length > 0) {
      const sentLens = sentences.map(s => s.split(/\s+/).filter(w => w.length > 0).length);
      longestSentLen = Math.max(...sentLens);
      shortestSentLen = Math.min(...sentLens);
      avgSentLen = Math.round(sentLens.reduce((a, b) => a + b, 0) / sentLens.length);
    }

    // Paragraphs
    const paragraphs = raw.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 0);
    const paragraphCount = paragraphs.length;

    // Lines
    const lineCount = raw === '' ? 0 : raw.split('\n').length;

    // Unique words
    const uniqueWords = new Set(words.map(w => w.toLowerCase().replace(/[^a-z0-9]/g, '')).filter(w => w));
    const uniqueCount = uniqueWords.size;

    // Avg word length
    const avgWordLen = words.length > 0
      ? (words.reduce((a, w) => a + w.replace(/[^a-zA-Z0-9]/g, '').length, 0) / words.length).toFixed(1)
      : 0;

    // Syllables (approximation)
    const syllables = words.reduce((acc, w) => acc + countSyllables(w), 0);

    // Reading / speaking time
    const readingSec = Math.ceil(wordCount / 238 * 60);
    const speakingSec = Math.ceil(wordCount / 130 * 60);

    // Flesch Reading Ease
    let flesch = 0, readLevel = '–';
    if (wordCount > 0 && sentenceCount > 0) {
      flesch = 206.835 - 1.015 * (wordCount / sentenceCount) - 84.6 * (syllables / wordCount);
      flesch = Math.max(0, Math.min(100, flesch)).toFixed(1);
      readLevel = fleschToLevel(parseFloat(flesch));
    }

    stats = { wordCount, charsWithSpaces, charsNoSpaces, sentenceCount, paragraphCount,
      lineCount, uniqueCount, avgWordLen, avgSentLen, longestSentLen, shortestSentLen,
      syllables, readingSec, speakingSec, flesch, readLevel, words, sentences };

    updateUI();
  }

  function updateUI() {
    const { wordCount, charsWithSpaces, charsNoSpaces, sentenceCount, paragraphCount,
      lineCount, uniqueCount, avgWordLen, avgSentLen, longestSentLen, shortestSentLen,
      syllables, readingSec, speakingSec, flesch, readLevel, words, sentences } = stats;

    animateValue(sbWords, wordCount);
    animateValue(sbChars, charsNoSpaces);
    animateValue(sbSentences, sentenceCount);
    animateValue(sbParagraphs, paragraphCount);
    sbReading.textContent   = formatTime(readingSec);
    sbSpeaking.textContent  = formatTime(speakingSec);

    dWords.textContent      = wordCount.toLocaleString();
    dCharsNs.textContent    = charsNoSpaces.toLocaleString();
    dCharsS.textContent     = charsWithSpaces.toLocaleString();
    dSentences.textContent  = sentenceCount.toLocaleString();
    dParagraphs.textContent = paragraphCount.toLocaleString();
    dLines.textContent      = lineCount.toLocaleString();
    dUnique.textContent     = uniqueCount.toLocaleString();
    dAvgWord.textContent    = avgWordLen;
    dAvgSentence.textContent = avgSentLen + ' words';
    dLongest.textContent    = longestSentLen + ' words';
    dShortest.textContent   = shortestSentLen + ' words';
    dSyllables.textContent  = syllables.toLocaleString();
    dReadLevel.textContent  = readLevel;
    dFlesch.textContent     = flesch !== 0 ? flesch : '–';
    dReadTime.textContent   = formatTime(readingSec);
    dSpeakTime.textContent  = formatTime(speakingSec);

    updateFlowChart(sentences);
    updateKeywordDensity(words, activeKdN);
    updateGoalBar();
  }

  // ─── FLOW CHART ──────────────────────────────────────────
  function updateFlowChart(sentences) {
    if (sentences.length === 0) {
      flowChart.innerHTML = '';
      flowEmpty.style.display = 'block';
      flowChart.appendChild(flowEmpty);
      flowScoreDisp.style.display = 'none';
      return;
    }
    flowEmpty.style.display = 'none';
    flowChart.innerHTML = '';

    let shortCount = 0, medCount = 0, longCount = 0;
    const maxWords = Math.max(...sentences.map(s => s.split(/\s+/).filter(w=>w).length), 1);

    sentences.forEach(s => {
      const wc = s.split(/\s+/).filter(w => w.length > 0).length;
      const bar = document.createElement('div');
      bar.className = 'flow-bar';
      const pct = Math.max(10, Math.round((wc / maxWords) * 80));
      bar.style.height = pct + 'px';

      if (wc < 10) { bar.classList.add('short'); shortCount++; }
      else if (wc <= 20) { bar.classList.add('medium'); medCount++; }
      else { bar.classList.add('long'); longCount++; }

      bar.title = `${wc} words`;
      flowChart.appendChild(bar);
    });

    // Flow score = variety
    const total = sentences.length;
    const variety = (Math.min(shortCount, medCount, longCount) / (total / 3) * 100).toFixed(0);
    const score = Math.min(100, Math.max(0, variety));
    flowScoreDisp.style.display = 'block';
    flowScoreVal.textContent = score + ' / 100';
  }

  // ─── KEYWORD DENSITY ─────────────────────────────────────
  const STOP_WORDS = new Set(['the','a','an','and','or','but','in','on','at','to','for','of','with','by','from','is','was','are','were','be','been','being','have','has','had','do','does','did','will','would','could','should','may','might','that','this','these','those','it','its','i','me','my','we','our','you','your','he','she','his','her','they','their','them','us','as','up','if','no','not','so','then','than','into','about','also','can','all','just','out','more','what','which','when','who','how','there','where','some','any','each','very','too','get','got','been','now','other','her','him','them']);

  function updateKeywordDensity(words, n) {
    const cleaned = words.map(w => w.toLowerCase().replace(/[^a-z0-9']/g, '')).filter(w => w.length > 0);

    const freq = {};
    for (let i = 0; i <= cleaned.length - n; i++) {
      const gram = cleaned.slice(i, i + n).join(' ');
      if (n === 1 && STOP_WORDS.has(gram)) continue;
      if (n > 1) {
        const parts = gram.split(' ');
        if (parts.every(p => STOP_WORDS.has(p))) continue;
      }
      freq[gram] = (freq[gram] || 0) + 1;
    }

    const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 10);

    if (sorted.length === 0) {
      kdList.innerHTML = '';
      kdList.appendChild(kdEmpty);
      kdEmpty.style.display = 'block';
      return;
    }

    kdEmpty.style.display = 'none';
    kdList.innerHTML = '';
    const max = sorted[0][1];

    sorted.forEach(([word, count], i) => {
      const item = document.createElement('div');
      item.className = 'kd-item';
      const pct = Math.round((count / max) * 100);
      item.innerHTML = `
        <span class="kd-rank">${i + 1}</span>
        <span class="kd-word" title="${word}">${word}</span>
        <div class="kd-bar-wrap"><div class="kd-bar-fill" style="width:${pct}%"></div></div>
        <span class="kd-count">${count}</span>
      `;
      kdList.appendChild(item);
    });
  }

  // ─── GOAL BAR ────────────────────────────────────────────
  function updateGoalBar() {
    if (!goal.target) { goalBarWrap.style.display = 'none'; return; }
    goalBarWrap.style.display = 'block';
    const current = getCurrentMetric(goal.type);
    const pct = Math.min(100, Math.round((current / goal.target) * 100));
    goalBarFill.style.width = pct + '%';
    goalBarLabel.textContent = `Goal: ${current.toLocaleString()} / ${goal.target.toLocaleString()} ${goal.type} (${pct}%)`;
    goalBarFill.style.background = pct >= 100
      ? 'linear-gradient(90deg, #10B981, #059669)'
      : 'linear-gradient(90deg, var(--brand-primary), var(--brand-accent))';
  }

  function getCurrentMetric(type) {
    if (!stats.wordCount && type !== 'characters') return 0;
    switch(type) {
      case 'words': return stats.wordCount || 0;
      case 'characters': return stats.charsNoSpaces || 0;
      case 'sentences': return stats.sentenceCount || 0;
      case 'paragraphs': return stats.paragraphCount || 0;
      default: return 0;
    }
  }

  setGoalBtn.addEventListener('click', () => {
    const val = parseInt(goalValueEl.value);
    if (!val || val < 1) return;
    goal = { type: goalTypeEl.value, target: val };
    updateGoalBar();
    closeAllDropdowns();
  });
  clearGoalBtn.addEventListener('click', () => {
    goal = { type: 'words', target: 0 };
    goalBarWrap.style.display = 'none';
    goalValueEl.value = '';
    closeAllDropdowns();
  });

  // ─── CASE CONVERSION ─────────────────────────────────────
  document.getElementById('case-upper').addEventListener('click', () => applyCase('upper'));
  document.getElementById('case-lower').addEventListener('click', () => applyCase('lower'));
  document.getElementById('case-title').addEventListener('click', () => applyCase('title'));
  document.getElementById('case-sentence').addEventListener('click', () => applyCase('sentence'));
  document.getElementById('case-alternate').addEventListener('click', () => applyCase('alternate'));

  function applyCase(type) {
    if (!editor.value) return;
    pushUndo(editor.value);
    let t = editor.value;
    if (type === 'upper') t = t.toUpperCase();
    else if (type === 'lower') t = t.toLowerCase();
    else if (type === 'title') t = t.replace(/\w\S*/g, w => w[0].toUpperCase() + w.slice(1).toLowerCase());
    else if (type === 'sentence') t = t.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, m => m.toUpperCase());
    else if (type === 'alternate') t = [...t].map((c, i) => i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()).join('');
    editor.value = t;
    analyzeText();
    closeAllDropdowns();
  }

  // ─── FIND & REPLACE ──────────────────────────────────────
  document.getElementById('find-replace-btn').addEventListener('click', () => {
    findReplacePanel.style.display = findReplacePanel.style.display === 'none' ? 'flex' : 'none';
    if (findReplacePanel.style.display === 'flex') findInput.focus();
  });
  closeFrBtn.addEventListener('click', () => { findReplacePanel.style.display = 'none'; frResult.textContent = ''; });
  doReplaceBtn.addEventListener('click', () => {
    const find = findInput.value;
    const replace = replaceInput.value;
    if (!find || !editor.value) { frResult.textContent = 'Nothing to find.'; return; }
    pushUndo(editor.value);
    const regex = new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const matches = (editor.value.match(regex) || []).length;
    editor.value = editor.value.replace(regex, replace);
    frResult.textContent = `Replaced ${matches} occurrence(s).`;
    analyzeText();
  });

  // ─── PANEL TABS ──────────────────────────────────────────
  document.querySelectorAll('.panel-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.panel-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.sidebar-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.panel).classList.add('active');
    });
  });

  // ─── KEYWORD DENSITY TABS ────────────────────────────────
  document.querySelectorAll('.kd-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.kd-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeKdN = parseInt(tab.dataset.n);
      if (stats.words) updateKeywordDensity(stats.words, activeKdN);
    });
  });

  // ─── TOOLBAR DROPDOWNS ───────────────────────────────────
  document.querySelectorAll('.dropdown-trigger').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const parent = btn.closest('.tool-group');
      const wasOpen = parent.classList.contains('open');
      closeAllDropdowns();
      if (!wasOpen) parent.classList.add('open');
    });
  });
  document.addEventListener('click', closeAllDropdowns);
  function closeAllDropdowns() {
    document.querySelectorAll('.tool-group.open').forEach(g => g.classList.remove('open'));
    document.querySelectorAll('.dropdown.open').forEach(d => d.classList.remove('open'));
  }

  // ─── NAV DROPDOWN (More) ─────────────────────────────────
  document.getElementById('more-toggle').addEventListener('click', (e) => {
    e.preventDefault(); e.stopPropagation();
    document.getElementById('more-dropdown').classList.toggle('open');
  });

  // ─── MORE TOOLS MODAL ────────────────────────────────────
  function openModal(title, bodyHTML) {
    modalTitle.textContent = title;
    modalBody.innerHTML = bodyHTML;
    modalOverlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    modalOverlay.style.display = 'none';
    document.body.style.overflow = '';
  }
  modalClose.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });

  // Case Converter Tool
  function buildCaseTool() {
    return `
      <p style="font-size:.85rem;color:var(--text-secondary);margin-bottom:12px">Paste your text below and choose a conversion:</p>
      <textarea class="modal-tool-textarea" id="case-tool-input" placeholder="Paste text here…"></textarea>
      <div class="modal-tool-btns">
        <button class="btn-primary" onclick="applyCaseTool('upper')">UPPERCASE</button>
        <button class="btn-primary" onclick="applyCaseTool('lower')">lowercase</button>
        <button class="btn-primary" onclick="applyCaseTool('title')">Title Case</button>
        <button class="btn-primary" onclick="applyCaseTool('sentence')">Sentence case</button>
        <button class="btn-primary" onclick="applyCaseTool('alternate')">aLtErNaTe</button>
        <button class="btn-ghost" onclick="copyCaseTool()">📋 Copy Result</button>
      </div>
      <div class="modal-result-area" id="case-tool-result">Result will appear here…</div>`;
  }

  window.applyCaseTool = function(type) {
    const inp = document.getElementById('case-tool-input');
    const out = document.getElementById('case-tool-result');
    if (!inp || !inp.value) { out.textContent = 'Please paste some text first.'; return; }
    let t = inp.value;
    if (type === 'upper') t = t.toUpperCase();
    else if (type === 'lower') t = t.toLowerCase();
    else if (type === 'title') t = t.replace(/\w\S*/g, w => w[0].toUpperCase() + w.slice(1).toLowerCase());
    else if (type === 'sentence') t = t.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, m => m.toUpperCase());
    else if (type === 'alternate') t = [...t].map((c, i) => i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()).join('');
    out.textContent = t;
  };
  window.copyCaseTool = function() {
    const out = document.getElementById('case-tool-result');
    if (out) navigator.clipboard.writeText(out.textContent);
  };

  // Clean Text Tool
  function buildCleanTool() {
    return `
      <p style="font-size:.85rem;color:var(--text-secondary);margin-bottom:12px">Select what to clean, then click Apply:</p>
      <textarea class="modal-tool-textarea" id="clean-tool-input" placeholder="Paste text here…"></textarea>
      <div class="modal-tool-btns" style="flex-wrap:wrap">
        <label style="font-size:.82rem;display:flex;align-items:center;gap:4px"><input type="checkbox" id="cl-extra-spaces" checked> Extra spaces</label>
        <label style="font-size:.82rem;display:flex;align-items:center;gap:4px"><input type="checkbox" id="cl-blank-lines" checked> Blank lines</label>
        <label style="font-size:.82rem;display:flex;align-items:center;gap:4px"><input type="checkbox" id="cl-special"> Special chars</label>
        <label style="font-size:.82rem;display:flex;align-items:center;gap:4px"><input type="checkbox" id="cl-html"> HTML tags</label>
      </div>
      <div class="modal-tool-btns">
        <button class="btn-primary" onclick="applyCleanTool()">🧹 Clean Text</button>
        <button class="btn-ghost" onclick="copyCleanTool()">📋 Copy Result</button>
      </div>
      <div class="modal-result-area" id="clean-tool-result">Result will appear here…</div>`;
  }

  window.applyCleanTool = function() {
    const inp = document.getElementById('clean-tool-input');
    const out = document.getElementById('clean-tool-result');
    if (!inp || !inp.value) { out.textContent = 'Please paste some text first.'; return; }
    let t = inp.value;
    if (document.getElementById('cl-extra-spaces')?.checked) t = t.replace(/[ \t]+/g, ' ').replace(/^ +| +$/gm, '');
    if (document.getElementById('cl-blank-lines')?.checked) t = t.replace(/\n{3,}/g, '\n\n');
    if (document.getElementById('cl-special')?.checked) t = t.replace(/[^\w\s.,!?;:'"()\-\n]/g, '');
    if (document.getElementById('cl-html')?.checked) t = t.replace(/<[^>]*>/g, '');
    out.textContent = t.trim();
  };
  window.copyCleanTool = function() {
    const out = document.getElementById('clean-tool-result');
    if (out) navigator.clipboard.writeText(out.textContent);
  };

  // Alphabetize Tool
  function buildAlphaTool() {
    return `
      <p style="font-size:.85rem;color:var(--text-secondary);margin-bottom:12px">Enter one item per line, then sort:</p>
      <textarea class="modal-tool-textarea" id="alpha-tool-input" placeholder="Apple\nBanana\nZebra\nMango"></textarea>
      <div class="modal-tool-btns">
        <button class="btn-primary" onclick="applyAlpha('asc')">A → Z</button>
        <button class="btn-primary" onclick="applyAlpha('desc')">Z → A</button>
        <button class="btn-primary" onclick="applyAlpha('length')">By Length</button>
        <button class="btn-primary" onclick="applyAlpha('shuffle')">🔀 Shuffle</button>
        <button class="btn-ghost" onclick="copyAlpha()">📋 Copy Result</button>
      </div>
      <div class="modal-result-area" id="alpha-tool-result">Result will appear here…</div>`;
  }

  window.applyAlpha = function(type) {
    const inp = document.getElementById('alpha-tool-input');
    const out = document.getElementById('alpha-tool-result');
    if (!inp || !inp.value) { out.textContent = 'Please enter some items first.'; return; }
    let lines = inp.value.split('\n').map(l => l.trim()).filter(l => l);
    if (type === 'asc') lines.sort((a,b) => a.localeCompare(b));
    else if (type === 'desc') lines.sort((a,b) => b.localeCompare(a));
    else if (type === 'length') lines.sort((a,b) => a.length - b.length);
    else if (type === 'shuffle') lines = lines.map(v => ({ v, k: Math.random() })).sort((a,b) => a.k - b.k).map(o => o.v);
    out.textContent = lines.join('\n');
  };
  window.copyAlpha = function() {
    const out = document.getElementById('alpha-tool-result');
    if (out) navigator.clipboard.writeText(out.textContent);
  };

  // Random Picker Tool
  function buildRandomTool() {
    return `
      <p style="font-size:.85rem;color:var(--text-secondary);margin-bottom:12px">Enter one option per line:</p>
      <textarea class="modal-tool-textarea" id="random-tool-input" style="min-height:100px" placeholder="Pizza\nSushi\nBurgers\nTacos"></textarea>
      <div class="modal-tool-btns">
        <button class="btn-primary" onclick="pickRandom()">🎲 Pick Random!</button>
        <button class="btn-ghost" onclick="pickMultiple()">Pick 3</button>
      </div>
      <div class="modal-result-area" id="random-tool-result" style="font-size:1.3rem;font-weight:700;text-align:center;color:var(--brand-primary)">Click Pick Random!</div>`;
  }

  window.pickRandom = function() {
    const inp = document.getElementById('random-tool-input');
    const out = document.getElementById('random-tool-result');
    if (!inp || !inp.value) { out.textContent = 'Add some options first!'; return; }
    const items = inp.value.split('\n').map(l => l.trim()).filter(l => l);
    if (!items.length) { out.textContent = 'No valid options found.'; return; }
    const pick = items[Math.floor(Math.random() * items.length)];
    out.innerHTML = `🎉 <strong>${pick}</strong>`;
  };
  window.pickMultiple = function() {
    const inp = document.getElementById('random-tool-input');
    const out = document.getElementById('random-tool-result');
    if (!inp || !inp.value) return;
    const items = inp.value.split('\n').map(l => l.trim()).filter(l => l);
    if (items.length < 2) { out.textContent = 'Need more than 1 option.'; return; }
    const shuffled = [...items].sort(() => Math.random() - 0.5).slice(0, 3);
    out.innerHTML = shuffled.map((s, i) => `${['🥇','🥈','🥉'][i]} <strong>${s}</strong>`).join('<br>');
  };

  // Bind tool buttons
  document.getElementById('open-case-tool').addEventListener('click', () => openModal('🔤 Case Converter', buildCaseTool()));
  document.getElementById('open-clean-tool').addEventListener('click', () => openModal('🧹 Clean Text', buildCleanTool()));
  document.getElementById('open-alpha-tool').addEventListener('click', () => openModal('🔢 Alphabetize', buildAlphaTool()));
  document.getElementById('open-random-tool').addEventListener('click', () => openModal('🎲 Random Picker', buildRandomTool()));

  // Navbar more dropdown tools
  document.getElementById('dd-case').addEventListener('click', (e) => { e.preventDefault(); openModal('🔤 Case Converter', buildCaseTool()); });
  document.getElementById('dd-clean').addEventListener('click', (e) => { e.preventDefault(); openModal('🧹 Clean Text', buildCleanTool()); });
  document.getElementById('dd-alpha').addEventListener('click', (e) => { e.preventDefault(); openModal('🔢 Alphabetize', buildAlphaTool()); });
  document.getElementById('dd-random').addEventListener('click', (e) => { e.preventDefault(); openModal('🎲 Random Picker', buildRandomTool()); });

  // ─── HELPERS ─────────────────────────────────────────────
  function countSyllables(word) {
    word = word.toLowerCase().replace(/[^a-z]/g, '');
    if (!word) return 0;
    if (word.length <= 3) return 1;
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    const m = word.match(/[aeiouy]{1,2}/g);
    return m ? m.length : 1;
  }

  function fleschToLevel(score) {
    if (score >= 90) return '5th Grade';
    if (score >= 80) return '6th Grade';
    if (score >= 70) return '7th Grade';
    if (score >= 60) return '8th–9th Grade';
    if (score >= 50) return '10th–12th Grade';
    if (score >= 30) return 'College';
    return 'Advanced';
  }

  function formatTime(sec) {
    if (sec < 60) return sec + ' sec';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return s > 0 ? `${m}m ${s}s` : `${m} min`;
  }

  function animateValue(el, newVal) {
    const prev = el.textContent;
    const formatted = newVal.toLocaleString();
    if (prev !== formatted) {
      el.textContent = formatted;
      el.classList.remove('count-pop');
      void el.offsetWidth;
      el.classList.add('count-pop');
      setTimeout(() => el.classList.remove('count-pop'), 300);
    }
  }

  // ─── KEYBOARD SHORTCUTS ──────────────────────────────────
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      if (document.activeElement === editor) { e.preventDefault(); document.getElementById('undo-btn').click(); }
    }
    if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
      if (document.activeElement === editor) { e.preventDefault(); document.getElementById('redo-btn').click(); }
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
      e.preventDefault();
      document.getElementById('find-replace-btn').click();
    }
    if (e.key === 'Escape') {
      closeModal();
      closeAllDropdowns();
      findReplacePanel.style.display = 'none';
    }
  });

  // ─── INIT ────────────────────────────────────────────────
  analyzeText();
  console.log('%c✍️ WordCraft Pro loaded!', 'color:#6C63FF;font-weight:700;font-size:14px');

})();
