/* =========================================================
   app.js — The screens of the app and how we move between them.

   How it works:
   - Each screen is a function in "Screens" that gives back HTML.
   - go('screenName') opens a screen, back() goes back.
   - render() draws the screen we are on.
   ========================================================= */

// ---------- 1. Things the app remembers while the page is open ----------

const state = {
  stack: [{ name: 'home', params: {} }], // the screens we opened, in order
  draft: null,                           // items ticked on this screen (a Set)
  photo: null,                           // a photo picked in a form

  // Who is logged in right now. Nobody at the start.
  // It is NOT saved, so after closing the page you must log in again.
  session: { role: null, parentId: null },
  pinTyped: '',        // the digits typed on the PIN keypad
  pinMessage: '',      // "Wrong PIN" and so on
  pinTries: 0,         // wrong tries in a row
  pinLockedUntil: 0,   // after 5 wrong tries, wait a little
};

// The four checkpoints of the day, in order
const STEPS = [
  { key: 'declared',   icon: '🏠', label: 'stepDeclared',   status: 'statusDeclared' },
  { key: 'checkedIn',  icon: '🏫', label: 'stepCheckedIn',  status: 'statusCheckedIn' },
  { key: 'checkedOut', icon: '🚪', label: 'stepCheckedOut', status: 'statusCheckedOut' },
  { key: 'home',       icon: '🏡', label: 'stepHome',       status: 'statusHome' },
];

// For each check: which step must be done before it
const PREVIOUS_STEP = { checkedIn: 'declared', checkedOut: 'checkedIn', home: 'checkedOut' };

// Words and icons for each check screen
const CHECK_INFO = {
  checkedIn:  { icon: '🏫', title: 'entryCheckFor',  hint: 'tickPresent' },
  checkedOut: { icon: '🚪', title: 'exitCheckFor',   hint: 'tickPresent', wait: 'waitEntry' },
  home:       { icon: '🏡', title: 'afternoonTitle', hint: 'tickArrived', wait: 'waitExit' },
};

const ROLE_LABELS = { parent: 'roleParent', entry: 'roleEntry', exit: 'roleExit', admin: 'roleAdmin' };

// Which roles may open each screen. 'all' = everybody, even before logging in.
const ACCESS = {
  home: 'all', pin: 'all', chooseParent: 'all',
  parent: ['parent'], morning: ['parent'],
  teacherList: ['entry', 'exit'],
  dashboard: ['entry', 'exit', 'admin'],
  lostFound: ['parent', 'entry', 'exit', 'admin'],
  day: ['parent', 'entry', 'exit', 'admin'],
  admin: ['admin'], families: ['admin'], pins: ['admin'],
  students: ['admin'], items: ['admin'], settings: ['admin'],
};

// Who may do each check: entry teacher, exit teacher, or the parent at home
const CHECK_ROLE = { checkedIn: 'entry', checkedOut: 'exit', home: 'parent' };


// ---------- 2. Small helpers ----------

// Make text safe to put inside HTML (so names can't break the page)
function esc(text) {
  return String(text == null ? '' : text)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function today() { return makeDateKey(0); }

function studentName(student) { return pickText(student.nameAr, student.nameEn); }
function itemName(item) { return pickText(item.ar, item.en); }

// All items: ready-made ones plus custom ones
function getAllItems() { return CATALOGUE.concat(Store.getCustomItems()); }

function findItem(id) {
  return getAllItems().find(item => item.id === id) ||
    { id: id, ar: TEXTS.ar.unknownItem, en: TEXTS.en.unknownItem, icon: '❓' };
}

function currentRole() { return state.session.role; }

// Staff = teachers and the system admin. They can see every student.
function isStaff() { return ['entry', 'exit', 'admin'].includes(currentRole()); }

function familyName(family) { return pickText(family.nameAr, family.nameEn); }

// The family that is logged in right now (or null)
function currentFamily() {
  return currentRole() === 'parent' ? Store.getParent(state.session.parentId) : null;
}

// Parents see ONLY their own children. Staff see every student.
function myStudents() {
  if (isStaff()) return Store.getStudents();
  const family = currentFamily();
  return family ? Store.getChildrenOf(family.id) : [];
}

// Can the person using the app see this child?
function canSee(student) {
  return isStaff() || (currentFamily() !== null && student.parentId === state.session.parentId);
}

// "Parent — Ahmed family", "Teacher: entry" or "Not logged in yet"
function roleText() {
  if (!currentRole()) return t('notLoggedIn');
  const family = currentFamily();
  if (family) return t('roleParent') + ' — ' + familyName(family);
  return t(ROLE_LABELS[currentRole()]);
}

// Is the person allowed to open this screen?
function canOpen(screen) {
  if (screen.name === 'check') return CHECK_ROLE[screen.params.step] === currentRole();
  const who = ACCESS[screen.name];
  return who === 'all' || (Array.isArray(who) && who.includes(currentRole()));
}

// Where is this item on its journey? Gives 4 answers, one per step:
// 'done', 'missing', 'pending' (waiting now) or 'future'
function itemProgress(record) {
  const answers = [];
  let stopped = false;
  STEPS.forEach(function (step, index) {
    const value = (index === 0) ? true : record[step.key];
    if (stopped) { answers.push('future'); }
    else if (value === true) { answers.push('done'); }
    else if (value === false) { answers.push('missing'); stopped = true; }
    else { answers.push('pending'); stopped = true; }
  });
  return answers;
}

function isMissing(record) {
  return itemProgress(record).includes('missing') && !record.recovered;
}


// ---------- 3. Little pieces of HTML we use a lot ----------

// A coloured label. It always has an icon AND words, not only a colour.
function badge(colour, icon, text, hiddenText) {
  const extra = hiddenText ? '<span class="sr-only">: ' + esc(hiddenText) + '</span>' : '';
  return '<span class="badge badge-' + colour + '"><span aria-hidden="true">' + icon +
    '</span> ' + esc(text) + extra + '</span>';
}

function notice(colour, icon, text) {
  return '<p class="notice notice-' + colour + '"><span aria-hidden="true">' + icon +
    '</span> ' + esc(text) + '</p>';
}

function emptyState(icon, text) {
  return '<div class="empty"><span class="empty-icon" aria-hidden="true">' + icon +
    '</span><p>' + esc(text) + '</p></div>';
}

function avatarHtml(student) {
  return '<span class="avatar" aria-hidden="true">' + esc(student.avatar || '🙂') + '</span>';
}

function classText(student) {
  return student.className ? esc(t('classLabel', { c: student.className })) : '';
}

// The picture of an item: a photo if there is one, or else its emoji
function itemIcon(item) {
  if (item.photo) return '<img class="item-icon item-photo" src="' + esc(item.photo) + '" alt="">';
  return '<span class="item-icon" aria-hidden="true">' + esc(item.icon || '🏷️') + '</span>';
}

// Custom items can have a colour stripe
function colourStyle(item) {
  const ok = COLOURS.some(c => c.value === item.colour);
  return ok ? ' style="--item-colour:' + item.colour + '"' : '';
}

function colourName(value) {
  const colour = COLOURS.find(c => c.value === value);
  return colour ? t(colour.key) : '';
}

// The big status label for one item
function statusBadge(record) {
  const answers = itemProgress(record);
  const missingIndex = answers.indexOf('missing');
  if (missingIndex >= 0) {
    if (record.recovered) return badge('green', '✅', t('recoveredShort'));
    return badge('red', '❌', t('missingAt', { step: t(STEPS[missingIndex].label) }));
  }
  const lastDone = answers.lastIndexOf('done');
  if (lastDone === STEPS.length - 1) return badge('green', '✅', t('statusHome'));
  return badge('amber', '⏳', t(STEPS[lastDone].status));
}

// The 4-step progress track. Flexbox flips it by itself in Arabic (RTL).
function trackHtml(record) {
  const answers = itemProgress(record);
  const icons = { done: '✅', missing: '❌', pending: '⏳', future: '⚪' };
  const words = { done: 'statusDone', missing: 'statusMissing', pending: 'statusPending', future: 'statusLater' };
  let html = '<ol class="track">';
  STEPS.forEach(function (step, index) {
    const answer = answers[index];
    html += '<li class="track-step ' + answer + '">' +
      '<span class="dot" aria-hidden="true">' + icons[answer] + '</span>' +
      '<span class="track-label"><span aria-hidden="true">' + step.icon + '</span> ' + t(step.label) + '</span>' +
      '<span class="sr-only">' + t(words[answer]) + '</span></li>';
  });
  return html + '</ol>';
}

// A big item button you can tick and untick
function itemTile(item, ticked, disabled) {
  return '<button type="button" class="tile' + (ticked ? ' ticked' : '') + '" data-id="' + item.id + '"' +
    ' aria-pressed="' + ticked + '"' + (disabled ? ' disabled' : '') + colourStyle(item) +
    ' onclick="toggleDraft(\'' + item.id + '\', this)">' +
    itemIcon(item) +
    '<span class="tile-name">' + esc(itemName(item)) + '</span>' +
    '<span class="tile-check" aria-hidden="true">' + (ticked ? '✅' : '⬜') + '</span></button>';
}

// One line in a list of items
function itemRow(item, record) {
  return '<li class="item-row"' + colourStyle(item) + '>' + itemIcon(item) +
    '<div class="grow"><strong>' + esc(itemName(item)) + '</strong>' +
    '<div class="badges">' + statusBadge(record) + '</div></div></li>';
}

// A text box with a label. lang = 'ar', 'en' or '' (any language)
function textField(id, label, lang, multiline) {
  const direction = lang ? ' lang="' + lang + '" dir="' + (lang === 'ar' ? 'rtl' : 'ltr') + '"' : ' dir="auto"';
  const box = multiline
    ? '<textarea id="' + id + '" rows="2"' + direction + '></textarea>'
    : '<input id="' + id + '" type="text" autocomplete="off"' + direction + '>';
  return '<label class="field"><span>' + label + '</span>' + box + '</label>';
}

// A photo picker. The real file box is hidden so the button text
// can be in our own language.
function photoField() {
  let html = '<div class="field"><span>📷 ' + t('photo') + ' ' + t('optional') + '</span>' +
    '<label class="btn btn-light file-btn"><input type="file" accept="image/*" class="sr-only" onchange="pickPhoto(this)">' +
    '<span aria-hidden="true">📷</span> ' + t('takePhoto') + '</label></div>' +
    '<div id="photoPreview" class="photo-preview">';
  if (state.photo) {
    html += '<img src="' + esc(state.photo) + '" alt="">' +
      '<button type="button" class="btn btn-light btn-small" onclick="clearPhoto()">🗑️ ' + t('removePhoto') + '</button>';
  }
  return html + '</div>';
}

// Shown when there are no students yet
function emptyStudents() {
  return emptyState('🧒', t('noStudentsYet')) +
    '<div class="button-row center">' +
    (currentRole() === 'admin' ? '<button class="btn btn-primary" onclick="go(\'students\')">➕ ' + t('addChild') + '</button>' : '') +
    '<button class="btn btn-sun" onclick="loadDemoData()">🎬 ' + t('loadDemo') + '</button></div>';
}

function screenTitle(icon, text) {
  return '<h2 class="screen-title"><span aria-hidden="true">' + icon + '</span> ' + esc(text) + '</h2>';
}


// ---------- 4. The screens ----------

const Screens = {};

// ===== Home: choose who you are =====
Screens.home = function () {
  function roleButton(role, icon, colour, hintKey) {
    const active = currentRole() === role;
    return '<button class="role-btn role-' + colour + (active ? ' active' : '') + '" aria-pressed="' + active + '"' +
      ' onclick="chooseRole(\'' + role + '\')">' +
      '<span class="role-icon" aria-hidden="true">' + icon + '</span>' +
      '<span class="role-name">' + t(ROLE_LABELS[role]) + '</span>' +
      '<span class="role-hint">' + t(hintKey) + '</span>' +
      (active ? '<span class="role-tick" aria-hidden="true">✔</span>' : '') + '</button>';
  }
  function menuButton(screen, icon, key) {
    return '<button class="menu-btn" onclick="go(\'' + screen + '\')">' +
      '<span class="menu-icon" aria-hidden="true">' + icon + '</span>' + t(key) + '</button>';
  }

  let html = screenTitle('👋', t('whoAreYou')) +
    '<div class="role-grid">' +
    roleButton('parent', '👪', 'pink', 'roleParentHint') +
    roleButton('entry', '🏫', 'green', 'roleEntryHint') +
    roleButton('exit', '🚪', 'blue', 'roleExitHint') +
    roleButton('admin', '🛠️', 'purple', 'roleAdminHint') +
    '</div>';

  // Not logged in yet: just show how to start
  if (!currentRole()) {
    html += '<p class="hint center">🔒 ' + t('tapRoleToLogin') + '</p>';
    if (Store.getStudents().length === 0) html += emptyStudents();
    return html;
  }

  html += '<div class="row-between login-line"><p class="hint">' + esc(t('youAre', { role: roleText() })) + '</p>' +
    '<button class="btn btn-light btn-small" onclick="logout()">🔓 ' + t('logout') + '</button></div>';

  // The menu only shows what this role may open
  html += '<h3 class="section-title">' + t('more') + '</h3><div class="menu-grid">' +
    (currentRole() === 'admin' ? menuButton('admin', '🛠️', 'roleAdmin') : '') +
    menuButton('lostFound', '🔎', 'lostFound') +
    (isStaff() ? menuButton('dashboard', '📊', 'dashboard') : '') +
    menuButton('day', '📅', 'history') +
    '</div>';
  return html;
};

// ===== Parent: "Which family are you?" (only names, no children shown) =====
Screens.chooseParent = function () {
  const families = Store.getParents();
  let html = screenTitle('👪', t('chooseFamily'));
  if (!families.length) {
    return html + emptyState('👪', t('noFamilies')) +
      (Store.getStudents().length ? '' : '<div class="button-row center">' +
        '<button class="btn btn-sun" onclick="loadDemoData()">🎬 ' + t('loadDemo') + '</button></div>');
  }
  html += '<div class="card-list">';
  families.forEach(function (family) {
    html += '<button class="card card-button" onclick="go(\'pin\', {role: \'parent\', parentId: \'' + family.id + '\'})">' +
      '<span class="card-head"><span class="avatar" aria-hidden="true">🏠</span>' +
      '<span class="grow"><span class="card-title">' + esc(familyName(family)) + '</span></span>' +
      '<span aria-hidden="true">🔒</span>' +
      '<span class="flip go-arrow" aria-hidden="true">→</span></span></button>';
  });
  return html + '</div>';
};

// ===== The PIN keypad =====
Screens.pin = function (params) {
  const role = params.role;
  const family = role === 'parent' ? Store.getParent(params.parentId) : null;
  if (!ROLE_LABELS[role] || (role === 'parent' && !family)) return emptyState('🤔', t('notFound'));

  const who = family ? t('roleParent') + ' — ' + familyName(family) : t(ROLE_LABELS[role]);
  let html = screenTitle('🔒', t('enterPin')) + '<p class="hint center">' + esc(t('pinFor', { who: who })) + '</p>';

  if (!Store.getPin(role, params.parentId)) return html + emptyState('🔑', t('pinNotSet'));

  let dots = '';
  for (let i = 0; i < 4; i++) dots += '<span class="pin-dot' + (i < state.pinTyped.length ? ' filled' : '') + '"></span>';

  let keys = '';
  ['1', '2', '3', '4', '5', '6', '7', '8', '9'].forEach(d => {
    keys += '<button type="button" class="key" onclick="pressDigit(\'' + d + '\')">' + d + '</button>';
  });
  keys += '<span></span>' +
    '<button type="button" class="key" onclick="pressDigit(\'0\')">0</button>' +
    '<button type="button" class="key key-light" onclick="pinDelete()" aria-label="' + esc(t('deleteDigit')) + '">⌫</button>';

  return html +
    '<div class="pin-dots" aria-hidden="true">' + dots + '</div>' +
    '<p id="pinCount" class="sr-only" aria-live="polite">' + esc(t('pinDigits', { n: state.pinTyped.length })) + '</p>' +
    '<p id="pinMsg" class="pin-msg" role="alert">' + esc(state.pinMessage) + '</p>' +
    // The keypad stays 1-2-3 from left to right, like a phone, in both languages
    '<div class="keypad" dir="ltr">' + keys + '</div>';
};

// ===== System admin: the main admin page =====
Screens.admin = function () {
  function menuButton(screen, icon, key) {
    return '<button class="menu-btn" onclick="go(\'' + screen + '\')">' +
      '<span class="menu-icon" aria-hidden="true">' + icon + '</span>' + t(key) + '</button>';
  }
  return screenTitle('🛠️', t('roleAdmin')) +
    (Store.getPin('admin') === '1234' ? notice('amber', '⚠️', t('changeDefaultPin')) : '') +
    '<div class="menu-grid">' +
    menuButton('families', '👪', 'familiesAndPins') +
    menuButton('pins', '🔑', 'staffPins') +
    menuButton('students', '🧒', 'students') +
    menuButton('items', '🎒', 'items') +
    menuButton('dashboard', '📊', 'dashboard') +
    menuButton('settings', '⚙️', 'settings') +
    '</div>' +
    '<div class="button-row center"><button class="btn btn-light" onclick="logout()">🔓 ' + t('logout') + '</button></div>';
};

// A small box for typing a 4-digit PIN
function pinInput(id, value) {
  return '<input id="' + id + '" class="pin-input" type="text" inputmode="numeric" maxlength="4"' +
    ' autocomplete="off" dir="ltr" value="' + esc(value || '') + '">';
}

// ===== System admin: families and their PINs =====
Screens.families = function () {
  const families = Store.getParents();
  let html = screenTitle('👪', t('familiesAndPins'));

  if (!families.length) {
    html += emptyState('👪', t('noFamiliesShort'));
  } else {
    html += '<div class="card-list">';
    families.forEach(function (f) {
      html += '<article class="card"><div class="card-head"><span class="avatar" aria-hidden="true">🏠</span>' +
        '<div class="grow"><h3 class="card-title">' + esc(familyName(f)) + '</h3>' +
        '<span class="muted">' + esc(t('childrenCount', { n: Store.getChildrenOf(f.id).length })) + '</span></div>' +
        '<button class="btn btn-light btn-small" onclick="removeFamily(\'' + f.id + '\')">🗑️ ' + t('remove') + '</button></div>' +
        (f.pin ? '' : '<div class="badges">' + badge('amber', '🔑', t('noPinYet')) + '</div>') +
        '<div class="pin-row"><label class="field"><span>🔑 ' + t('pin') + ' ' + t('pinRule') + '</span>' +
        pinInput('pin-' + f.id, f.pin) + '</label>' +
        '<button class="btn btn-primary btn-small" onclick="saveFamilyPin(\'' + f.id + '\')">💾 ' + t('save') + '</button></div>' +
        '</article>';
    });
    html += '</div>';
  }

  html += '<form class="card form" onsubmit="addFamily(event)">' +
    '<h3 class="card-title">➕ ' + t('addFamily') + '</h3>' +
    textField('familyAr', t('familyNameAr'), 'ar') +
    textField('familyEn', t('familyNameEn'), 'en') +
    '<label class="field"><span>🔑 ' + t('pin') + ' ' + t('pinRule') + '</span>' + pinInput('familyPin', '') + '</label>' +
    '<button class="btn btn-primary btn-big" type="submit">💾 ' + t('save') + '</button></form>' +
    '<p class="hint">' + t('pinSecurityNote') + '</p>';
  return html;
};

// ===== System admin: PINs for the teachers and the admin =====
Screens.pins = function () {
  function pinRow(role, labelKey) {
    return '<div class="card pin-row">' +
      '<label class="field"><span>' + t(labelKey) + ' ' + t('pinRule') + '</span>' +
      pinInput('pin-' + role, Store.getPin(role)) + '</label>' +
      '<button class="btn btn-primary btn-small" onclick="saveStaffPin(\'' + role + '\')">💾 ' + t('save') + '</button></div>';
  }
  return screenTitle('🔑', t('staffPins')) +
    '<div class="card-list">' +
    pinRow('entry', 'pinEntry') + pinRow('exit', 'pinExit') + pinRow('admin', 'pinAdmin') +
    '</div><p class="hint">' + t('pinSecurityNote') + '</p>';
};

// ===== Parent: a card for each of THIS family's children =====
Screens.parent = function () {
  const family = currentFamily();
  if (!family) return Screens.chooseParent();

  const students = Store.getChildrenOf(family.id);
  let html = screenTitle('👪', t('helloFamily', { name: familyName(family) })) +
    '<p class="hint">' + formatDate(today()) + '</p>' +
    '<button class="btn btn-light btn-small" onclick="logout()">🔓 ' + t('logout') + '</button>';
  if (!students.length) return html + emptyState('🧒', t('noChildrenInFamily'));
  html += '<div class="spacer"></div>';

  html += '<div class="card-list">';
  students.forEach(function (s) {
    html += '<article class="card">' +
      '<div class="card-head">' + avatarHtml(s) +
      '<div class="grow"><h3 class="card-title">' + esc(studentName(s)) + '</h3>' +
      '<span class="muted">' + classText(s) + '</span></div></div>' +
      '<div class="badges">' + daySummary(today(), s.id) + '</div>' +
      '<div class="button-row">' +
      '<button class="btn btn-sun" onclick="go(\'morning\', {sid: \'' + s.id + '\'})">☀️ ' + t('morning') + '</button>' +
      '<button class="btn btn-primary" onclick="go(\'check\', {step: \'home\', sid: \'' + s.id + '\'})">🏡 ' + t('afternoon') + '</button>' +
      '<button class="btn btn-light" onclick="go(\'day\', {sid: \'' + s.id + '\'})">📋 ' + t('todayTrack') + '</button>' +
      '</div></article>';
  });
  return html + '</div>';
};

// A short summary of one child's day
function daySummary(date, studentId) {
  const records = Object.values(Store.getStudentDay(date, studentId));
  if (!records.length) return badge('grey', '📝', t('nothingToday'));
  let html = badge('blue', '🎒', t('itemsCount', { n: records.length }));
  const missing = records.filter(isMissing).length;
  if (missing) html += badge('red', '❌', t('missingShort', { n: missing }));
  if (records.every(r => r.home === true)) html += badge('green', '✅', t('allHome'));
  return html;
}

// ===== Parent, morning: choose today's items =====
Screens.morning = function (params) {
  const student = Store.getStudent(params.sid);
  if (!student || !canSee(student)) return emptyState('🤔', t('notFound'));

  const day = Store.getStudentDay(today(), student.id);
  const locked = Object.values(day).some(r => r.checkedIn !== null);
  if (!state.draft) state.draft = new Set(Object.keys(day));

  let html = screenTitle('☀️', t('morningTitle', { name: studentName(student) })) +
    '<p class="hint">' + formatDate(today()) + '</p>' +
    (locked ? notice('amber', '🔒', t('lockedCheckedIn')) : '<p class="hint">' + t('tapToChoose') + '</p>') +
    '<div class="tile-grid">' +
    getAllItems().map(item => itemTile(item, state.draft.has(item.id), locked)).join('') +
    '</div>';
  if (!locked) {
    html += '<div class="sticky-actions"><button class="btn btn-primary btn-big" onclick="saveMorning(\'' +
      student.id + '\')">🏫 ' + t('sendToSchool') + '</button></div>';
  }
  return html;
};

// ===== A checkpoint: entry, exit or home =====
Screens.check = function (params) {
  const student = Store.getStudent(params.sid);
  const info = CHECK_INFO[params.step];
  if (!student || !info || !canSee(student)) return emptyState('🤔', t('notFound'));

  const step = params.step;
  const day = Store.getStudentDay(today(), student.id);
  const ids = Object.keys(day);
  let html = screenTitle(info.icon, t(info.title, { name: studentName(student) })) +
    '<p class="hint">' + formatDate(today()) + '</p>';

  if (!ids.length) return html + emptyState('📝', t('notDeclared'));

  // Has the step before this one been done?
  const previous = PREVIOUS_STEP[step];
  const previousDone = previous === 'declared' || ids.some(id => day[id][previous] !== null);
  if (!previousDone) return html + emptyState('⏳', t(info.wait));

  // Only items that were confirmed at the step before can be checked now
  const ready = id => previous === 'declared' || day[id][previous] === true;
  const toCheck = ids.filter(ready);
  const missingBefore = ids.filter(id => !ready(id));

  if (!toCheck.length) {
    html += emptyState('🤷', t('nothingToCheck'));
  } else {
    const alreadyDone = toCheck.some(id => day[id][step] !== null);
    if (!state.draft) state.draft = new Set(toCheck.filter(id => day[id][step] === true));
    html += (alreadyDone ? notice('green', '✅', t('alreadyDone')) : '') +
      '<div class="row-between"><p class="hint">' + t(info.hint) + '</p>' +
      '<button class="btn btn-light btn-small" onclick="tickAll()">☑️ ' + t('tickAll') + '</button></div>' +
      '<div class="tile-grid">' +
      toCheck.map(id => itemTile(findItem(id), state.draft.has(id), false)).join('') +
      '</div>' +
      '<div class="sticky-actions"><button class="btn btn-green btn-big" onclick="confirmCheck(\'' +
      step + '\', \'' + student.id + '\')">✅ ' + t('confirm') + '</button></div>';
  }

  if (missingBefore.length) {
    html += '<h3 class="section-title">' + t('missingEarlier') + '</h3><ul class="item-list">' +
      missingBefore.map(id => itemRow(findItem(id), day[id])).join('') + '</ul>';
  }
  return html;
};

// ===== Teacher: list of students for the entry or exit check =====
Screens.teacherList = function (params) {
  // The entry teacher does the entry check, the exit teacher does the exit check
  const step = currentRole() === 'exit' ? 'checkedOut' : 'checkedIn';
  const isEntry = step === 'checkedIn';
  const students = Store.getStudents();

  let html = screenTitle(isEntry ? '🏫' : '🚪', t(isEntry ? 'entryTitle' : 'exitTitle')) +
    '<p class="hint">' + formatDate(today()) + '</p>' +
    '<div class="button-row">' +
    '<button class="btn btn-light btn-small" onclick="go(\'dashboard\')">📊 ' + t('dashboard') + '</button>' +
    '<button class="btn btn-light btn-small" onclick="go(\'lostFound\')">🔎 ' + t('lostFound') + '</button></div>';
  if (!students.length) return html + emptyStudents();

  html += '<p class="hint">' + t('tapStudent') + '</p><div class="card-list">';
  students.forEach(function (s) {
    const records = Object.values(Store.getStudentDay(today(), s.id));
    let label;
    if (!records.length) {
      label = badge('grey', '📝', t('notDeclared'));
    } else if (records.some(r => r[step] !== null)) {
      const missing = records.filter(r => r[step] === false).length;
      label = badge('green', '✅', t('checkDone')) +
        (missing ? badge('red', '❌', t('missingShort', { n: missing })) : '');
    } else if (!isEntry && !records.some(r => r.checkedIn !== null)) {
      label = badge('amber', '⏳', t('waitEntry'));
    } else {
      label = badge('amber', '⏳', t('checkWaiting'));
    }
    html += '<button class="card card-button" onclick="go(\'check\', {step: \'' + step + '\', sid: \'' + s.id + '\'})">' +
      '<span class="card-head">' + avatarHtml(s) +
      '<span class="grow"><span class="card-title">' + esc(studentName(s)) + '</span>' +
      '<span class="muted">' + classText(s) + '</span></span>' +
      '<span class="flip go-arrow" aria-hidden="true">→</span></span>' +
      '<span class="badges">' + label + '</span></button>';
  });
  return html + '</div>';
};

// ===== The item journey for one child on one day (also used for history) =====
Screens.day = function (params) {
  const students = myStudents(); // a parent only sees their own children
  let html = screenTitle('📋', t('dayTitle'));
  if (!students.length) {
    if (!isStaff() && Store.getStudents().length) return html + emptyState('🧒', t('noChildrenInFamily'));
    return html + emptyStudents();
  }

  const studentId = students.some(s => s.id === params.sid) ? params.sid : students[0].id;
  const date = params.date || today();
  const dates = Store.getDates();
  if (!dates.includes(today())) dates.unshift(today());
  dates.sort().reverse();

  html += '<div class="chip-row" role="group" aria-label="' + esc(t('chooseChild')) + '">' +
    students.map(s => '<button class="chip' + (s.id === studentId ? ' active' : '') + '"' +
      ' aria-pressed="' + (s.id === studentId) + '"' +
      ' onclick="setParams({sid: \'' + s.id + '\'})">' + avatarHtml(s) + ' ' + esc(studentName(s)) + '</button>').join('') +
    '</div>' +
    '<label class="field"><span>📅 ' + t('chooseDate') + '</span>' +
    '<select onchange="setParams({date: this.value})">' +
    dates.map(d => '<option value="' + d + '"' + (d === date ? ' selected' : '') + '>' +
      formatDate(d) + (d === today() ? ' — ' + t('today') : '') + '</option>').join('') +
    '</select></label>';

  const day = Store.getStudentDay(date, studentId);
  const ids = Object.keys(day);
  if (!ids.length) return html + emptyState('📭', t('noHistory'));

  html += '<div class="card-list">';
  ids.forEach(function (id) {
    const item = findItem(id);
    html += '<article class="card"' + colourStyle(item) + '>' +
      '<div class="card-head">' + itemIcon(item) +
      '<div class="grow"><h3 class="card-title">' + esc(itemName(item)) + '</h3>' +
      '<div class="badges">' + statusBadge(day[id]) + '</div></div></div>' +
      trackHtml(day[id]) + '</article>';
  });
  return html + '</div>';
};

// ===== Lost & Found board =====
Screens.lostFound = function () {
  const teacher = isStaff(); // teachers and the admin
  let html = screenTitle('🔎', t('lostFound')) +
    '<p class="hint">' + esc(t('youAre', { role: roleText() })) + '</p>';

  // Part 1: items flagged as missing (made automatically from the checks).
  // A parent only sees the missing items of their own children.
  html += '<h3 class="section-title">❌ ' + t('missingItems') + '</h3>';
  const myIds = myStudents().map(s => s.id);
  const missing = collectMissing().filter(m => myIds.includes(m.student.id));
  if (!missing.length) {
    html += emptyState('🎉', t('noMissing'));
  } else {
    html += '<div class="card-list">';
    missing.forEach(function (m) {
      html += '<article class="card card-red"' + colourStyle(m.item) + '>' +
        '<div class="card-head">' + itemIcon(m.item) +
        '<div class="grow"><h3 class="card-title">' + esc(itemName(m.item)) + '</h3>' +
        '<span class="muted">' + esc(m.student.avatar) + ' ' + esc(studentName(m.student)) +
        ' · ' + formatDate(m.date) + '</span></div></div>' +
        '<div class="badges">' +
        badge('red', '❌', t('missingAt', { step: t(STEPS[m.missingIndex].label) })) +
        badge('grey', '👀', t('lastSeen', { step: t(STEPS[m.lastIndex].label) })) + '</div>' +
        '<div class="button-row"><button class="btn btn-green btn-small" onclick="markRecovered(\'' +
        m.date + '\', \'' + m.student.id + '\', \'' + m.item.id + '\')">✅ ' + t('markRecovered') + '</button></div>' +
        '</article>';
    });
    html += '</div>';
  }

  // Part 2: things teachers found
  html += '<h3 class="section-title">📦 ' + t('foundItems') + '</h3>';
  if (teacher) {
    html += '<form class="card form" onsubmit="postFound(event)">' +
      '<h4 class="card-title">➕ ' + t('postFound') + '</h4>' +
      photoField() +
      textField('foundAr', t('descAr'), 'ar', true) +
      textField('foundEn', t('descEn'), 'en', true) +
      '<button class="btn btn-primary btn-big" type="submit">📢 ' + t('postFound') + '</button></form>';
  } else {
    html += '<p class="hint">' + t('onlyTeacherPost') + '</p>';
  }

  const posts = Store.getFound();
  if (!posts.length) return html + emptyState('📭', t('noFound'));

  html += '<div class="card-list">';
  posts.forEach(function (post) {
    const description = pickText(post.descAr, post.descEn);
    const owner = post.claimedBy ? Store.getStudent(post.claimedBy) : null;
    const picture = post.photo
      ? '<img class="item-icon item-photo found-photo" src="' + esc(post.photo) + '" alt="' + esc(description) + '">'
      : '<span class="item-icon" aria-hidden="true">' + esc(post.icon || '📦') + '</span>';

    let label, button = '';
    if (post.returned) {
      label = badge('green', '✅', t('returnedLabel'));
    } else if (owner) {
      // Show the child's name only to teachers and to that child's own family
      label = myIds.includes(owner.id)
        ? badge('amber', '🙋', t('claimedBy', { name: studentName(owner) }))
        : badge('amber', '🙋', t('claimedOther'));
      if (teacher) button = '<button class="btn btn-green btn-small" onclick="returnFound(\'' + post.id + '\')">🤝 ' + t('markReturned') + '</button>';
    } else {
      label = badge('grey', '⏳', t('waitingClaim'));
      if (!teacher) button = '<button class="btn btn-sun btn-small" onclick="openClaim(\'' + post.id + '\')">🙋 ' + t('thisIsOurs') + '</button>';
    }
    if (post.returned && owner && myIds.includes(owner.id)) label += badge('blue', '🧒', studentName(owner));

    html += '<article class="card">' +
      '<div class="card-head">' + picture +
      '<div class="grow"><h3 class="card-title">' + esc(description) + '</h3>' +
      '<span class="muted">' + esc(t('foundOn', { date: formatDateTime(post.time) })) + '</span></div></div>' +
      '<div class="badges">' + label + '</div>' +
      (button ? '<div class="button-row">' + button + '</div>' : '') + '</article>';
  });
  return html + '</div>';
};

// Find every missing item on every day
function collectMissing() {
  const list = [];
  const days = Store.getAllDays();
  Object.keys(days).sort().reverse().forEach(function (date) {
    Object.keys(days[date]).forEach(function (studentId) {
      const student = Store.getStudent(studentId);
      if (!student) return;
      const day = days[date][studentId];
      Object.keys(day).forEach(function (itemId) {
        const record = day[itemId];
        if (!isMissing(record)) return;
        const answers = itemProgress(record);
        list.push({
          date: date, student: student, item: findItem(itemId),
          missingIndex: answers.indexOf('missing'), lastIndex: answers.lastIndexOf('done'),
        });
      });
    });
  });
  return list;
}

// ===== Teacher dashboard =====
Screens.dashboard = function () {
  const students = Store.getStudents();
  let html = screenTitle('📊', t('dashboard')) + '<p class="hint">' + formatDate(today()) + '</p>';
  if (!students.length) return html + emptyStudents();

  let checkedIn = 0, checkedOut = 0, missing = 0;
  students.forEach(function (s) {
    const records = Object.values(Store.getStudentDay(today(), s.id));
    if (records.some(r => r.checkedIn !== null)) checkedIn++;
    if (records.some(r => r.checkedOut !== null)) checkedOut++;
    missing += records.filter(isMissing).length;
  });

  function statCard(colour, icon, number, labelKey, sub) {
    return '<div class="stat stat-' + colour + '"><span class="stat-icon" aria-hidden="true">' + icon + '</span>' +
      '<span class="stat-number">' + number + '</span>' +
      '<span class="stat-label">' + t(labelKey) + '</span>' +
      (sub ? '<span class="muted">' + esc(sub) + '</span>' : '') + '</div>';
  }
  html += '<div class="stats">' +
    statCard('green', '🏫', checkedIn, 'checkedInCount', t('outOf', { n: students.length })) +
    statCard('blue', '🚪', checkedOut, 'checkedOutCount', t('outOf', { n: students.length })) +
    statCard(missing ? 'red' : 'green', missing ? '❌' : '🎉', missing, 'missingCount') +
    '</div>';

  // A little row of entry / exit / home labels for each child
  function stepChip(records, key, labelKey) {
    if (!records.length) return badge('grey', '➖', t(labelKey), t('nothingToday'));
    if (records.some(r => r[key] === false)) return badge('red', '❌', t(labelKey), t('statusMissing'));
    if (records.some(r => r[key] === true)) return badge('green', '✅', t(labelKey), t('statusDone'));
    return badge('amber', '⏳', t(labelKey), t('statusPending'));
  }
  html += '<h3 class="section-title">' + t('students') + '</h3><ul class="item-list">';
  students.forEach(function (s) {
    const records = Object.values(Store.getStudentDay(today(), s.id));
    html += '<li class="item-row">' + avatarHtml(s) +
      '<div class="grow"><strong>' + esc(studentName(s)) + '</strong>' +
      '<div class="badges">' + stepChip(records, 'checkedIn', 'entryShort') +
      stepChip(records, 'checkedOut', 'exitShort') + stepChip(records, 'home', 'homeShort') +
      '</div></div></li>';
  });
  html += '</ul><div class="button-row center">' +
    '<button class="btn btn-primary" onclick="go(\'lostFound\')">🔎 ' + t('lostFound') + '</button></div>';
  return html;
};

// A drop-down list of families. "selected" is the family already chosen.
function familySelect(id, selected, onchange) {
  const options = Store.getParents().map(f =>
    '<option value="' + f.id + '"' + (f.id === selected ? ' selected' : '') + '>' + esc(familyName(f)) + '</option>').join('');
  return '<select id="' + id + '"' + (onchange ? ' onchange="' + onchange + '"' : '') + '>' +
    '<option value="">— ' + t('noFamilyLink') + ' —</option>' + options + '</select>';
}

// ===== Students (admin): children and the "add a child" form =====
Screens.students = function () {
  const families = Store.getParents();
  const students = Store.getStudents();
  let html = screenTitle('🧒', t('students'));

  // Each child has a family list, so the admin can change it
  if (!students.length) {
    html += emptyState('🧒', t('noStudentsShort'));
  } else {
    html += '<div class="card-list">';
    students.forEach(function (s) {
      html += '<article class="card"><div class="card-head">' + avatarHtml(s) +
        '<div class="grow"><h3 class="card-title">' + esc(studentName(s)) + '</h3>' +
        '<span class="muted">' + classText(s) + '</span></div>' +
        '<button class="btn btn-light btn-small" onclick="removeStudent(\'' + s.id + '\')">🗑️ ' + t('remove') + '</button>' +
        '</div>' +
        '<label class="field"><span>👪 ' + t('family') + '</span>' +
        familySelect('family-' + s.id, s.parentId, 'changeChildFamily(\'' + s.id + '\', this.value)') + '</label>' +
        '</article>';
    });
    html += '</div>';
  }

  html += '<form class="card form" onsubmit="addStudent(event)">' +
    '<h3 class="card-title">➕ ' + t('addChild') + '</h3>' +
    (families.length ? '' : notice('amber', '👪', t('addFamilyFirst')) +
      '<button type="button" class="btn btn-light btn-small" onclick="go(\'families\')">👪 ' + t('familiesAndPins') + '</button>') +
    '<label class="field"><span>👪 ' + t('family') + '</span>' + familySelect('childFamily', '') + '</label>' +
    textField('childAr', t('nameAr'), 'ar') +
    textField('childEn', t('nameEn'), 'en') +
    textField('childClass', t('className') + ' ' + t('optional'), '') +
    '<fieldset class="field"><legend>' + t('avatar') + '</legend><div class="choice-row">' +
    AVATARS.map((a, i) => '<label class="choice avatar-choice"><input type="radio" name="avatar" value="' + a + '"' +
      (i === 0 ? ' checked' : '') + '><span>' + a + '</span></label>').join('') +
    '</div></fieldset>' +
    '<button class="btn btn-primary btn-big" type="submit">💾 ' + t('save') + '</button></form>';
  return html;
};

// ===== Items: catalogue and "add a custom item" form =====
Screens.items = function () {
  const custom = Store.getCustomItems();
  let html = screenTitle('🎒', t('items')) +
    '<h3 class="section-title">' + t('predefinedItems') + '</h3><div class="tile-grid">' +
    CATALOGUE.map(item => '<div class="tile static">' + itemIcon(item) +
      '<span class="tile-name">' + esc(itemName(item)) + '</span></div>').join('') + '</div>' +
    '<h3 class="section-title">' + t('customItems') + '</h3>';

  if (!custom.length) {
    html += emptyState('🏷️', t('noCustomItems'));
  } else {
    html += '<ul class="item-list">';
    custom.forEach(function (item) {
      html += '<li class="item-row"' + colourStyle(item) + '>' + itemIcon(item) +
        '<div class="grow"><strong>' + esc(itemName(item)) + '</strong>' +
        '<span class="muted">' + colourName(item.colour) + '</span></div>' +
        '<button class="btn btn-light btn-small" onclick="removeCustomItem(\'' + item.id + '\')">🗑️ ' + t('remove') + '</button></li>';
    });
    html += '</ul>';
  }

  html += '<form class="card form" onsubmit="addCustomItem(event)">' +
    '<h3 class="card-title">➕ ' + t('addCustomItem') + '</h3>' +
    textField('itemAr', t('itemNameAr'), 'ar') +
    textField('itemEn', t('itemNameEn'), 'en') +
    '<fieldset class="field"><legend>' + t('colour') + '</legend><div class="choice-row">' +
    COLOURS.map((c, i) => '<label class="choice swatch"><input type="radio" name="colour" value="' + c.value + '"' +
      (i === 0 ? ' checked' : '') + '><span><span class="swatch-dot" style="background:' + c.value + '"></span>' +
      t(c.key) + '</span></label>').join('') +
    '</div></fieldset>' +
    photoField() +
    '<button class="btn btn-primary btn-big" type="submit">💾 ' + t('save') + '</button></form>';
  return html;
};

// ===== Settings: language, demo data, reset =====
Screens.settings = function () {
  function langButton(lang, key) {
    const active = currentLang === lang;
    return '<button class="btn ' + (active ? 'btn-primary' : 'btn-light') + '" aria-pressed="' + active + '"' +
      ' onclick="changeLanguage(\'' + lang + '\')" lang="' + lang + '">' + t(key) + '</button>';
  }
  return screenTitle('⚙️', t('settings')) +
    '<section class="card"><h3 class="card-title">🌐 ' + t('language') + '</h3>' +
    '<div class="button-row">' + langButton('ar', 'langAr') + langButton('en', 'langEn') + '</div></section>' +
    '<section class="card"><h3 class="card-title">🎬 ' + t('loadDemo') + '</h3>' +
    '<p class="hint">' + t('settingsDemoHint') + '</p>' +
    '<button class="btn btn-sun btn-big" onclick="loadDemoData()">🎬 ' + t('loadDemo') + '</button></section>' +
    '<section class="card card-red"><h3 class="card-title">⚠️ ' + t('dangerZone') + '</h3>' +
    '<button class="btn btn-danger btn-big" onclick="resetAllData()">🗑️ ' + t('resetAll') + '</button></section>';
};


// ---------- 5. Moving between screens ----------

function currentScreen() { return state.stack[state.stack.length - 1]; }

function go(name, params) {
  state.stack.push({ name: name, params: params || {} });
  state.draft = null;
  state.photo = null;
  render(true);
}

function back() {
  if (state.stack.length > 1) state.stack.pop();
  state.draft = null;
  state.photo = null;
  render(true);
}

function goHome() {
  state.stack = [{ name: 'home', params: {} }];
  state.draft = null;
  state.photo = null;
  render(true);
}

// Change something on the screen we are on (like the chosen child)
function setParams(changes) {
  Object.assign(currentScreen().params, changes);
  render(false);
}

// Draw the header and the current screen
function render(goToTop) {
  const screen = currentScreen();
  const draw = Screens[screen.name] || Screens.home;
  renderHeader();
  // The lock: if this role may not open the screen, show a message instead
  document.getElementById('app').innerHTML = canOpen(screen)
    ? draw(screen.params)
    : emptyState('🔒', t('loginFirst')) +
      '<div class="button-row center"><button class="btn btn-primary" onclick="goHome()">🏠 ' + t('goHome') + '</button></div>';
  if (goToTop) {
    window.scrollTo(0, 0);
    const heading = document.querySelector('#app h2');
    if (heading) { heading.setAttribute('tabindex', '-1'); heading.focus({ preventScroll: true }); }
  }
}

function renderHeader() {
  const onHome = state.stack.length === 1;
  const backButton = document.getElementById('backBtn');
  backButton.classList.toggle('invisible', onHome);
  backButton.setAttribute('aria-hidden', onHome);
  backButton.tabIndex = onHome ? -1 : 0;
  document.getElementById('backText').textContent = t('back');
  const title = document.getElementById('appTitle');
  title.textContent = t('appName');
  title.setAttribute('aria-label', t('appName') + ' — ' + t('goHome'));
  const langButton = document.getElementById('langBtn');
  langButton.textContent = t('langButton');
  langButton.setAttribute('aria-label', t('langButtonLabel'));
  langButton.setAttribute('lang', currentLang === 'ar' ? 'en' : 'ar');
  // The copyright line at the bottom of every screen
  document.getElementById('appFooter').textContent = t('copyright');
}


// ---------- 6. Language switch ----------

function toggleLanguage() {
  changeLanguage(currentLang === 'ar' ? 'en' : 'ar');
}

// Switch language but keep anything already typed in the boxes
function changeLanguage(lang) {
  const typed = rememberForm();
  setLanguage(lang);
  render(false);
  restoreForm(typed);
}

function rememberForm() {
  const saved = { boxes: {}, radios: {} };
  document.querySelectorAll('#app input, #app textarea').forEach(function (box) {
    if (box.type === 'radio') { if (box.checked) saved.radios[box.name] = box.value; }
    else if (box.id && box.type !== 'file') saved.boxes[box.id] = box.value;
  });
  return saved;
}

function restoreForm(saved) {
  Object.keys(saved.boxes).forEach(function (id) {
    const box = document.getElementById(id);
    if (box) box.value = saved.boxes[id];
  });
  Object.keys(saved.radios).forEach(function (name) {
    document.querySelectorAll('#app input[type="radio"]').forEach(function (radio) {
      if (radio.name === name) radio.checked = (radio.value === saved.radios[name]);
    });
  });
}


// ---------- 7. Pop-up messages (toast) and the in-page dialog ----------

let toastTimer = null;
function toast(message, kind) {
  const box = document.getElementById('toast');
  box.textContent = message;
  box.className = 'toast show ' + (kind || '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { box.className = 'toast'; }, 3000);
}

function openDialog(innerHtml) {
  document.getElementById('dialogRoot').innerHTML =
    '<div class="overlay" onclick="if (event.target === this) closeDialog()">' +
    '<div class="dialog" role="dialog" aria-modal="true" aria-labelledby="dialogTitle">' + innerHtml + '</div></div>';
  const lastButton = document.querySelector('.dialog button:last-child');
  if (lastButton) lastButton.focus();
}

function closeDialog() {
  document.getElementById('dialogRoot').innerHTML = '';
}

// Ask "Are you sure?" inside the page (not the browser's confirm box)
let waitingAnswer = null;
function askConfirm(message, yesText, onYes) {
  waitingAnswer = onYes;
  openDialog('<p id="dialogTitle" class="dialog-text">' + esc(message) + '</p>' +
    '<div class="dialog-buttons">' +
    '<button class="btn btn-danger" onclick="answerConfirm(true)">' + esc(yesText) + '</button>' +
    '<button class="btn btn-light" onclick="answerConfirm(false)">' + t('cancel') + '</button></div>');
}

function answerConfirm(yes) {
  const action = waitingAnswer;
  waitingAnswer = null;
  closeDialog();
  if (yes && action) action();
}

document.addEventListener('keydown', function (event) {
  if (event.key === 'Escape') closeDialog();

  // On the PIN screen you can also type the digits on a keyboard
  if (currentScreen().name !== 'pin' || document.getElementById('dialogRoot').innerHTML) return;
  const digit = toWesternDigits(event.key);
  if (/^[0-9]$/.test(digit)) pressDigit(digit);
  else if (event.key === 'Backspace') pinDelete();
});


// ---------- 8. Logging in and out ----------

// Arabic digits ٠١٢٣٤٥٦٧٨٩ become 0123456789
function toWesternDigits(text) {
  return String(text).replace(/[٠-٩]/g, d => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
}

// The first screen for each role after logging in
function goToRoleStart() {
  state.stack = [{ name: 'home', params: {} }];
  const role = currentRole();
  if (role === 'parent') go('parent');
  else if (role === 'admin') go('admin');
  else go('teacherList');
}

// Tapping a role on the home screen
function chooseRole(role) {
  if (currentRole() === role) { goToRoleStart(); return; } // already logged in
  if (role === 'parent') go('chooseParent');               // first: which family?
  else go('pin', { role: role });
}

function pressDigit(digit) {
  if (Date.now() < state.pinLockedUntil) {
    state.pinMessage = t('tooManyTries');
    updatePinScreen();
    return;
  }
  if (state.pinTyped.length >= 4) return;
  state.pinTyped += digit;
  state.pinMessage = '';
  updatePinScreen();
  if (state.pinTyped.length === 4) setTimeout(checkPinEntry, 150); // a tiny pause to see the 4th dot
}

function pinDelete() {
  state.pinTyped = state.pinTyped.slice(0, -1);
  updatePinScreen();
}

// Change only the dots and the message, not the whole screen
function updatePinScreen() {
  document.querySelectorAll('.pin-dot').forEach(function (dot, index) {
    dot.classList.toggle('filled', index < state.pinTyped.length);
  });
  const count = document.getElementById('pinCount');
  if (count) count.textContent = t('pinDigits', { n: state.pinTyped.length });
  const message = document.getElementById('pinMsg');
  if (message) message.textContent = state.pinMessage;
}

function checkPinEntry() {
  const params = currentScreen().params;
  if (Store.checkPin(params.role, params.parentId, state.pinTyped)) {
    // Correct! Remember who is logged in
    state.session = { role: params.role, parentId: params.role === 'parent' ? params.parentId : null };
    state.pinTyped = '';
    state.pinMessage = '';
    state.pinTries = 0;
    toast(t('welcome'), 'good');
    goToRoleStart();
    return;
  }
  // Wrong: clear the dots, shake, and count the try
  state.pinTyped = '';
  state.pinTries++;
  if (state.pinTries >= 5) {
    state.pinTries = 0;
    state.pinLockedUntil = Date.now() + 30 * 1000;
    state.pinMessage = t('tooManyTries');
  } else {
    state.pinMessage = t('wrongPin');
  }
  updatePinScreen();
  const dots = document.querySelector('.pin-dots');
  if (dots) { dots.classList.remove('shake'); void dots.offsetWidth; dots.classList.add('shake'); }
}

function logout() {
  state.session = { role: null, parentId: null };
  toast(t('loggedOut'), 'good');
  goHome();
}

// Check that a PIN is exactly 4 digits. Gives back the PIN, or '' if it is wrong.
function cleanPin(text) {
  const pin = toWesternDigits(text.trim());
  return /^[0-9]{4}$/.test(pin) ? pin : '';
}

function saveStaffPin(role) {
  const pin = cleanPin(boxValue('pin-' + role));
  if (!pin) { toast(t('pinInvalid'), 'warn'); return; }
  Store.setPin(role, pin);
  toast(t('pinSaved'), 'good');
  render(false);
}

function saveFamilyPin(familyId) {
  const pin = cleanPin(boxValue('pin-' + familyId));
  if (!pin) { toast(t('pinInvalid'), 'warn'); return; }
  Store.setParentPin(familyId, pin);
  toast(t('pinSaved'), 'good');
  const typed = rememberForm();
  render(false);
  restoreForm(typed);
}


// ---------- 9. What the other buttons do ----------

// Tick or untick an item tile
function toggleDraft(itemId, button) {
  if (state.draft.has(itemId)) state.draft.delete(itemId);
  else state.draft.add(itemId);
  const ticked = state.draft.has(itemId);
  button.classList.toggle('ticked', ticked);
  button.setAttribute('aria-pressed', ticked);
  button.querySelector('.tile-check').textContent = ticked ? '✅' : '⬜';
}

function tickAll() {
  document.querySelectorAll('#app .tile[data-id]:not([disabled])').forEach(function (button) {
    if (!state.draft.has(button.dataset.id)) toggleDraft(button.dataset.id, button);
  });
}

function saveMorning(studentId) {
  if (!state.draft.size) { toast(t('chooseOneItem'), 'warn'); return; }
  Store.declareItems(today(), studentId, Array.from(state.draft));
  toast(t('morningSaved'), 'good');
  back();
}

// Save a checkpoint. Every item that is not ticked becomes "Missing".
function confirmCheck(step, studentId) {
  const results = {};
  document.querySelectorAll('#app .tile[data-id]').forEach(function (button) {
    results[button.dataset.id] = state.draft.has(button.dataset.id);
  });
  Store.saveCheck(today(), studentId, step, results);
  const missing = Object.values(results).filter(v => v === false).length;
  if (missing) toast(t('savedMissing', { n: missing }), 'warn');
  else toast(t('savedAllGood'), 'good');
  back();
}

function boxValue(id) {
  const box = document.getElementById(id);
  return box ? box.value.trim() : '';
}

function checkedValue(name) {
  const radio = document.querySelector('#app input[name="' + name + '"]:checked');
  return radio ? radio.value : '';
}

function addStudent(event) {
  event.preventDefault();
  const nameAr = boxValue('childAr');
  const nameEn = boxValue('childEn');
  if (!nameAr && !nameEn) { toast(t('nameNeeded'), 'warn'); return; }
  const parentId = boxValue('childFamily');
  if (!parentId) { toast(t('familyNeeded'), 'warn'); return; }
  Store.addStudent({ nameAr: nameAr, nameEn: nameEn, className: boxValue('childClass'),
    avatar: checkedValue('avatar') || '🙂', parentId: parentId });
  toast(t('childAdded'), 'good');
  render(false);
}

function addFamily(event) {
  event.preventDefault();
  const nameAr = boxValue('familyAr');
  const nameEn = boxValue('familyEn');
  if (!nameAr && !nameEn) { toast(t('nameNeeded'), 'warn'); return; }
  const pin = cleanPin(boxValue('familyPin'));
  if (!pin) { toast(t('pinInvalid'), 'warn'); return; }
  Store.addParent({ nameAr: nameAr, nameEn: nameEn, pin: pin });
  toast(t('familyAdded'), 'good');
  render(false);
}

function removeFamily(familyId) {
  const family = Store.getParent(familyId);
  if (!family) return;
  askConfirm(t('removeFamilyConfirm', { name: familyName(family) }), t('yesDelete'), function () {
    Store.removeParent(familyId);
    toast(t('removed'), 'good');
    render(false);
  });
}

function changeChildFamily(studentId, familyId) {
  Store.setStudentParent(studentId, familyId);
  toast(t('familyChanged'), 'good');
  const typed = rememberForm(); // redraw, but keep what was typed
  render(false);
  restoreForm(typed);
}

function removeStudent(studentId) {
  const student = Store.getStudent(studentId);
  if (!student) return;
  askConfirm(t('removeChildConfirm', { name: studentName(student) }), t('yesDelete'), function () {
    Store.removeStudent(studentId);
    toast(t('removed'), 'good');
    render(false);
  });
}

function addCustomItem(event) {
  event.preventDefault();
  const ar = boxValue('itemAr');
  const en = boxValue('itemEn');
  if (!ar && !en) { toast(t('nameNeeded'), 'warn'); return; }
  const saved = Store.addCustomItem({ ar: ar, en: en, colour: checkedValue('colour'), photo: state.photo });
  if (!saved) { toast(t('saveFailed'), 'warn'); return; }
  state.photo = null;
  toast(t('itemAdded'), 'good');
  render(false);
}

function removeCustomItem(itemId) {
  const item = findItem(itemId);
  askConfirm(t('removeItemConfirm', { name: itemName(item) }), t('yesDelete'), function () {
    Store.removeCustomItem(itemId);
    toast(t('removed'), 'good');
    render(false);
  });
}

// Read a photo and make it small, so it fits in the browser's storage
function pickPhoto(input) {
  const file = input.files && input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function () {
    const image = new Image();
    image.onload = function () {
      const biggest = 360;
      const scale = Math.min(1, biggest / Math.max(image.width, image.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(image.width * scale);
      canvas.height = Math.round(image.height * scale);
      canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
      state.photo = canvas.toDataURL('image/jpeg', 0.7);
      refreshPhotoPreview();
    };
    image.src = reader.result;
  };
  reader.readAsDataURL(file);
}

function clearPhoto() {
  state.photo = null;
  refreshPhotoPreview();
}

// Redraw only the photo part, so typed text is not lost
function refreshPhotoPreview() {
  const typed = rememberForm();
  render(false);
  restoreForm(typed);
}

function postFound(event) {
  event.preventDefault();
  const descAr = boxValue('foundAr');
  const descEn = boxValue('foundEn');
  if (!descAr && !descEn) { toast(t('descNeeded'), 'warn'); return; }
  if (!Store.addFound({ photo: state.photo, descAr: descAr, descEn: descEn })) { toast(t('saveFailed'), 'warn'); return; }
  state.photo = null;
  toast(t('posted'), 'good');
  render(false);
}

// Parent taps "This is ours": choose which child
function openClaim(foundId) {
  const buttons = myStudents().map(s =>
    '<button class="btn btn-light" onclick="claimFound(\'' + foundId + '\', \'' + s.id + '\')">' +
    avatarHtml(s) + ' ' + esc(studentName(s)) + '</button>').join('');
  openDialog('<h3 id="dialogTitle" class="dialog-text">' + t('whichChild') + '</h3>' +
    '<div class="dialog-buttons column">' + buttons +
    '<button class="btn btn-light" onclick="closeDialog()">' + t('cancel') + '</button></div>');
}

function claimFound(foundId, studentId) {
  closeDialog();
  Store.claimFound(foundId, studentId);
  toast(t('claimed'), 'good');
  render(false);
}

function returnFound(foundId) {
  Store.returnFound(foundId);
  toast(t('returnedDone'), 'good');
  render(false);
}

function markRecovered(date, studentId, itemId) {
  Store.markRecovered(date, studentId, itemId);
  toast(t('recovered'), 'good');
  render(false);
}

function loadDemoData() {
  function load() {
    Store.loadDemo();
    state.session = { role: null, parentId: null }; // everyone logs in again
    toast(t('demoLoaded'), 'good');
    goHome();
  }
  // Only the admin may replace data that is already there
  if (Store.getStudents().length || Store.getParents().length) {
    if (currentRole() === 'admin') askConfirm(t('demoConfirm'), t('demoYes'), load);
  } else {
    load();
  }
}

function resetAllData() {
  askConfirm(t('resetConfirm'), t('yesDelete'), function () {
    Store.resetAll();
    state.session = { role: null, parentId: null };
    toast(t('resetDone'), 'good');
    goHome();
  });
}


// ---------- 10. Start the app! ----------

setLanguage(Store.getLang());
render(false);
