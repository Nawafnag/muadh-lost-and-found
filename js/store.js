/* =========================================================
   store.js — The app's notebook.
   This is the ONLY file that reads and writes saved data.
   Today it saves into the browser (localStorage).
   Later we can change just this file to use a real server
   (like Firebase or Supabase) and the screens stay the same.
   ========================================================= */

const STORAGE_KEY = 'muad-lost-and-found-v1';

// Make a date name like "2026-11-20".
// daysAgo = 0 means today, 1 means yesterday, and so on.
function makeDateKey(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - (daysAgo || 0));
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return date.getFullYear() + '-' + month + '-' + day;
}

// Make a new unique id, like "s-lq3x9a2b"
function newId(prefix) {
  return prefix + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// What the notebook looks like when it is empty
function emptyData() {
  return {
    lang: 'ar',          // "ar" or "en"
    // Secret numbers (PINs). The admin sets them. The first admin PIN is 1234.
    pins: { admin: '1234', entry: '', exit: '' },
    parents: [],         // families: { id, nameAr, nameEn, pin }
    students: [],        // { id, nameAr, nameEn, className, avatar, parentId }
    customItems: [],     // { id, ar, en, colour, photo, icon }
    days: {},            // days["2026-11-20"]["studentId"]["itemId"] = record
    found: [],           // found items posted by teachers
  };
}

// A new item record for one day.
// null = not checked yet, true = confirmed, false = missing
function newRecord() {
  return { checkedIn: null, checkedOut: null, home: null, recovered: false };
}

const Store = (function () {
  let firstVisit = false; // true when this device has never opened the app
  let data = load();

  // Read the notebook from the browser
  function load() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return Object.assign(emptyData(), JSON.parse(saved));
    } catch (error) {
      // If something goes wrong, we just start with an empty notebook
    }
    firstVisit = true;
    return emptyData();
  }

  // Write the notebook into the browser. Returns true if it worked.
  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (error) {
      return false; // for example: the photo was too big
    }
  }

  const api = {
    // ----- Language -----
    getLang() { return data.lang; },
    setLang(lang) { data.lang = lang; save(); },

    // ----- Secret numbers (PINs) -----
    // role is "admin", "entry", "exit" or "parent" (then parentId says which family)
    getPin(role, parentId) {
      if (role === 'parent') {
        const family = this.getParent(parentId);
        return family ? (family.pin || '') : '';
      }
      return (data.pins && data.pins[role]) || '';
    },
    setPin(role, pin) {
      data.pins = Object.assign({ admin: '1234', entry: '', exit: '' }, data.pins);
      data.pins[role] = pin;
      save();
    },
    setParentPin(parentId, pin) {
      const family = this.getParent(parentId);
      if (family) { family.pin = pin; save(); }
    },
    // Is this the right PIN? An empty PIN never works.
    checkPin(role, parentId, pin) {
      const rightPin = this.getPin(role, parentId);
      return rightPin !== '' && rightPin === pin;
    },

    // ----- Families (parents) -----
    getParents() { return data.parents; },
    getParent(id) { return data.parents.find(p => p.id === id) || null; },
    addParent(info) {
      data.parents.push(Object.assign({ id: newId('p') }, info));
      return save();
    },
    // Removing a family keeps its children, but they have no family any more
    removeParent(id) {
      data.parents = data.parents.filter(p => p.id !== id);
      data.students.forEach(s => { if (s.parentId === id) s.parentId = null; });
      save();
    },
    getChildrenOf(parentId) { return data.students.filter(s => s.parentId === parentId); },
    setStudentParent(studentId, parentId) {
      const student = data.students.find(s => s.id === studentId);
      if (student) { student.parentId = parentId || null; save(); }
    },

    // ----- Students -----
    getStudents() { return data.students; },
    getStudent(id) { return data.students.find(s => s.id === id) || null; },
    addStudent(info) {
      data.students.push(Object.assign({ id: newId('s') }, info));
      return save();
    },
    removeStudent(id) {
      data.students = data.students.filter(s => s.id !== id);
      Object.values(data.days).forEach(day => { delete day[id]; });
      data.found.forEach(f => { if (f.claimedBy === id) f.claimedBy = null; });
      save();
    },

    // ----- Custom items -----
    getCustomItems() { return data.customItems; },
    addCustomItem(info) {
      data.customItems.push(Object.assign({ id: newId('c'), icon: '🏷️' }, info));
      if (save()) return true;
      data.customItems.pop(); // undo if it could not be saved
      return false;
    },
    removeCustomItem(id) {
      data.customItems = data.customItems.filter(i => i.id !== id);
      save();
    },

    // ----- Days and checks -----
    getAllDays() { return data.days; },
    getDates() { return Object.keys(data.days).sort().reverse(); },
    getStudentDay(date, studentId) {
      return (data.days[date] && data.days[date][studentId]) || {};
    },

    // Morning: the parent says which items the child takes today
    declareItems(date, studentId, itemIds) {
      if (!data.days[date]) data.days[date] = {};
      const oldDay = data.days[date][studentId] || {};
      const newDay = {};
      itemIds.forEach(id => { newDay[id] = oldDay[id] || newRecord(); });
      data.days[date][studentId] = newDay;
      save();
    },

    // A checkpoint: results looks like { bag: true, jacket: false }
    saveCheck(date, studentId, step, results) {
      const day = data.days[date] && data.days[date][studentId];
      if (!day) return;
      const order = ['checkedIn', 'checkedOut', 'home'];
      Object.keys(results).forEach(itemId => {
        const record = day[itemId];
        if (!record) return;
        record[step] = results[itemId];
        // If an item is missing, the later steps cannot have happened
        if (results[itemId] === false) {
          order.slice(order.indexOf(step) + 1).forEach(later => { record[later] = null; });
        }
        record.recovered = false;
      });
      save();
    },

    // A missing item turned up again
    markRecovered(date, studentId, itemId) {
      const record = this.getStudentDay(date, studentId)[itemId];
      if (record) { record.recovered = true; save(); }
    },

    // ----- Lost & Found posts -----
    getFound() { return data.found; },
    addFound(info) {
      data.found.unshift(Object.assign(
        { id: newId('f'), time: Date.now(), claimedBy: null, returned: false }, info));
      if (save()) return true;
      data.found.shift();
      return false;
    },
    claimFound(foundId, studentId) {
      const post = data.found.find(f => f.id === foundId);
      if (post) { post.claimedBy = studentId; save(); }
    },
    returnFound(foundId) {
      const post = data.found.find(f => f.id === foundId);
      if (post) { post.returned = true; save(); }
    },

    // ----- Demo data and reset -----
    loadDemo() {
      const lang = data.lang;
      data = emptyData();
      data.lang = lang;

      // Demo PINs (also written in README.md)
      data.pins = { admin: '1234', entry: '1111', exit: '2222' };

      // Three families. The Ahmed family has two children.
      data.parents = [
        { id: 'p1', nameAr: 'عائلة أحمد', nameEn: 'Ahmed family',  pin: '1001' },
        { id: 'p2', nameAr: 'عائلة خالد', nameEn: 'Khalid family', pin: '1002' },
        { id: 'p3', nameAr: 'عائلة سالم', nameEn: 'Salem family',  pin: '1003' },
      ];
      data.students = [
        { id: 's1', nameAr: 'سارة', nameEn: 'Sara',   className: '3A', avatar: '🦄', parentId: 'p1' },
        { id: 's2', nameAr: 'عمر',  nameEn: 'Omar',   className: '3A', avatar: '🦁', parentId: 'p1' },
        { id: 's3', nameAr: 'لينا', nameEn: 'Lina',   className: '3B', avatar: '🐼', parentId: 'p2' },
        { id: 's4', nameAr: 'يوسف', nameEn: 'Yousef', className: '3B', avatar: '🐸', parentId: 'p3' },
      ];
      data.customItems = [
        { id: 'c1', ar: 'قبعة الشمس', en: 'Sun hat', colour: '#fdd835', icon: '👒', photo: null },
      ];

      // R(entry, exit, home) makes one item record quickly
      const R = (i, o, h) => ({ checkedIn: i, checkedOut: o, home: h, recovered: false });

      data.days[makeDateKey(2)] = {
        s1: { bag: R(true, true, true), bottle: R(true, true, true) },
        s2: { bag: R(true, true, true), glasses: R(true, true, true) },
        s3: { bag: R(true, true, true) },
        s4: { bag: R(true, true, true), lunchBox: R(true, true, true) },
      };
      data.days[makeDateKey(1)] = {
        s1: { bag: R(true, true, true), pencilCase: R(true, true, true), jacket: R(true, true, true) },
        s2: { bag: R(true, true, true), glasses: R(true, false, null), lunchBox: R(true, true, true) },
        s3: { bag: R(true, true, true), bottle: R(true, true, false) },
        s4: { bag: R(true, true, true), c1: R(true, true, true) },
      };
      data.days[makeDateKey(0)] = {
        // Sara: everything is home safely
        s1: { bag: R(true, true, true), pencilCase: R(true, true, true),
              bottle: R(true, true, true), lunchBox: R(true, true, true) },
        // Omar: left school, but his jacket is missing
        s2: { bag: R(true, true, null), jacket: R(true, false, null), bottle: R(true, true, null) },
        // Lina: arrived at school, not checked out yet
        s3: { bag: R(true, null, null), pencilCase: R(true, null, null), c1: R(true, null, null) },
        // Yousef: parent sent the list, teacher has not checked yet
        s4: { bag: R(null, null, null), lunchBox: R(null, null, null), cap: R(null, null, null) },
      };

      data.found = [
        { id: 'f1', time: Date.now() - 60 * 60 * 1000, photo: null, icon: '🥤',
          descAr: 'قارورة ماء زرقاء وُجدت في الملعب', descEn: 'Blue water bottle found in the playground',
          claimedBy: null, returned: false },
        { id: 'f2', time: Date.now() - 24 * 60 * 60 * 1000, photo: null, icon: '👓',
          descAr: 'نظارة في علبة حمراء', descEn: 'Glasses in a red case',
          claimedBy: 's2', returned: false },
      ];
      save();
    },

    resetAll() {
      const lang = data.lang; // keep the language the user chose
      data = emptyData();
      data.lang = lang;
      save();
    },
  };

  // The very first time the app opens on a device, fill it with demo data,
  // so it is ready to try straight away. (After "Reset all data" it stays empty.)
  if (firstVisit) api.loadDemo();

  return api;
})();
