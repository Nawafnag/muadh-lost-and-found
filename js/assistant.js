/* =========================================================
   assistant.js — The smart assistant (uses Google Gemini).

   How it works:
   1. We write a short summary of the data this person may see
      (a parent: only their own children).
   2. We send the question + summary to our small server
      (worker/worker.js on Cloudflare). The server adds the
      secret Gemini key, so the key is never in this website.
   3. Gemini answers and we show the answer in the chat.
   ========================================================= */

const ASSISTANT_URL = 'https://muadh-assistant.muadh-school.workers.dev';

// The chat is kept only while the page is open, and only for the person logged in
const chat = { owner: '', messages: [], busy: false };

function chatOwner() { return (state.session.role || '') + ':' + (state.session.parentId || ''); }

function chatMessages() {
  if (chat.owner !== chatOwner()) { chat.owner = chatOwner(); chat.messages = []; chat.busy = false; }
  return chat.messages;
}

// ----- 1. The data summary for Gemini (in English, names in both languages) -----
const STEP_NAMES = ['home morning (packed)', 'school entry', 'school exit', 'home afternoon'];

function assistantContext() {
  const students = myStudents();
  const ids = students.map(s => s.id);
  const lines = ['Today is ' + today() + '.', 'Person asking: ' + roleText() + '.', '', 'Students:'];

  students.forEach(function (s) {
    const family = s.parentId ? Store.getParent(s.parentId) : null;
    lines.push('- ' + s.nameEn + ' / ' + s.nameAr + ', class ' + (s.className || '?') +
      (family ? ', ' + family.nameEn : ''));
  });

  lines.push('', 'Daily records (newest first, last 14 days). For each item, the 4 checkpoints:');
  Store.getDates().slice(0, 14).forEach(function (date) {
    ids.forEach(function (id) {
      const day = Store.getStudentDay(date, id);
      const itemIds = Object.keys(day);
      if (!itemIds.length) return;
      lines.push(date + ' — ' + Store.getStudent(id).nameEn + ':');
      itemIds.forEach(function (itemId) {
        const item = findItem(itemId);
        const steps = itemProgress(day[itemId]).map((a, i) => STEP_NAMES[i] + '=' + a).join(', ');
        lines.push('  * ' + item.en + ' / ' + item.ar + ': ' + steps +
          (day[itemId].recovered ? ' (found again later)' : ''));
      });
    });
  });

  lines.push('', 'Lost & Found board (things teachers found):');
  const posts = Store.getFound();
  if (!posts.length) lines.push('- nothing posted');
  posts.forEach(function (p) {
    const owner = p.claimedBy ? Store.getStudent(p.claimedBy) : null;
    let status = p.returned ? 'returned to owner' : (owner ? 'claimed' : 'waiting for owner');
    // A parent only learns the name if the child is theirs
    if (owner && ids.includes(owner.id)) status += ' by ' + owner.nameEn;
    lines.push('- ' + (p.descEn || p.descAr) + ' (found ' + new Date(p.time).toISOString().slice(0, 10) + ', ' + status + ')');
  });

  lines.push('', 'Meaning: done = confirmed, missing = not there at that checkpoint, ' +
    'pending = waiting for that check now, future = not reached yet.');
  return lines.join('\n');
}

// ----- 2. The screen -----
Screens.assistant = function () {
  const messages = chatMessages();
  let html = screenTitle('🤖', t('assistant')) +
    '<p class="hint">' + esc(t('assistantHint')) + '</p>';

  html += '<div class="chat" id="chatLog" aria-live="polite">';
  if (!messages.length) {
    html += '<div class="chat-suggest">' +
      ['suggest1', 'suggest2', 'suggest3'].map(key =>
        '<button class="chip" type="button" onclick="askAssistant(t(\'' + key + '\'))">' + esc(t(key)) + '</button>').join('') +
      '</div>';
  }
  messages.forEach(function (m) {
    html += '<div class="bubble bubble-' + m.from + (m.error ? ' bubble-error' : '') + '">' +
      '<span class="sr-only">' + esc(t(m.from === 'me' ? 'you' : 'helper')) + ': </span>' +
      '<span aria-hidden="true" class="bubble-who">' + (m.from === 'me' ? '🙂' : '🤖') + '</span>' +
      '<p dir="auto">' + esc(m.text) + '</p></div>';
  });
  if (chat.busy) {
    html += '<div class="bubble bubble-bot"><span aria-hidden="true" class="bubble-who">🤖</span>' +
      '<p class="muted">' + esc(t('thinking')) + '</p></div>';
  }
  html += '</div>';

  html += '<form class="chat-form" onsubmit="sendQuestion(event)">' +
    '<label class="sr-only" for="askBox">' + esc(t('askLabel')) + '</label>' +
    '<input id="askBox" class="pin-input chat-input" type="text" maxlength="300" autocomplete="off" dir="auto" ' +
    'placeholder="' + esc(t('askPlaceholder')) + '"' + (chat.busy ? ' disabled' : '') + '>' +
    '<button class="btn btn-primary" type="submit"' + (chat.busy ? ' disabled' : '') + '>' + esc(t('send')) + '</button>' +
    '</form>';

  html += '<p class="muted chat-note">ℹ️ ' + esc(t('assistantNote')) + '</p>';
  if (messages.length && !chat.busy) {
    html += '<div class="button-row center"><button class="btn btn-light btn-small" onclick="clearChat()">🧹 ' +
      esc(t('clearChat')) + '</button></div>';
  }
  return html;
};

function sendQuestion(event) {
  event.preventDefault();
  const box = document.getElementById('askBox');
  askAssistant(box ? box.value : '');
}

function clearChat() { chatMessages().length = 0; render(false); }

// Draw the chat again, keep the newest message in view and the cursor in the box
function redrawChat() {
  if (currentScreen().name !== 'assistant') return;
  render(false);
  const log = document.getElementById('chatLog');
  if (log && log.lastElementChild) log.lastElementChild.scrollIntoView({ block: 'nearest' });
  const box = document.getElementById('askBox');
  if (box && !chat.busy) box.focus({ preventScroll: true });
}

// ----- 3. Asking Gemini (through our server) -----
async function askAssistant(question) {
  question = String(question || '').trim();
  if (!question || chat.busy) return;
  const messages = chatMessages();
  const owner = chat.owner;
  messages.push({ from: 'me', text: question });
  chat.busy = true;
  redrawChat();

  let answer, failed = false;
  try {
    // Give up after 30 seconds so the chat never gets stuck
    const timer = new AbortController();
    setTimeout(() => timer.abort(), 30000);
    const response = await fetch(ASSISTANT_URL, {
      method: 'POST',
      signal: timer.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: question, lang: currentLang, context: assistantContext() }),
    });
    const result = await response.json().catch(() => ({}));
    if (response.ok && result.answer) {
      answer = result.answer;
    } else {
      failed = true;
      answer = result.error === 'nokey' ? t('assistantNoKey')
        : (result.status === 429 ? t('assistantBusy') : t('assistantError'));
    }
  } catch (error) {
    failed = true;
    answer = t('assistantError');
  }

  // If someone logged out while waiting, throw the answer away
  if (chat.owner !== owner) return;
  messages.push({ from: 'bot', text: answer, error: failed });
  chat.busy = false;
  redrawChat();
}
