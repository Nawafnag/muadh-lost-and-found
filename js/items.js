/* =========================================================
   items.js — The ready-made things a child can take to school.
   Every item has an Arabic name, an English name and an emoji.
   ========================================================= */

// The item catalogue (the list of ready-made items)
const CATALOGUE = [
  { id: 'bag',        ar: 'شنطة',          en: 'Bag',          icon: '🎒' },
  { id: 'pencilCase', ar: 'مقلمة',          en: 'Pencil case',  icon: '✏️' },
  { id: 'jacket',     ar: 'جاكيت',          en: 'Jacket',       icon: '🧥' },
  { id: 'glasses',    ar: 'نظارة',          en: 'Glasses',      icon: '👓' },
  { id: 'bottle',     ar: 'قارورة ماء',     en: 'Water bottle', icon: '🥤' },
  { id: 'lunchBox',   ar: 'صندوق الطعام',   en: 'Lunch box',    icon: '🍱' },
  { id: 'books',      ar: 'كتب',            en: 'Books',        icon: '📚' },
  { id: 'cap',        ar: 'قبعة',           en: 'Cap',          icon: '🧢' },
  { id: 'crayons',    ar: 'ألوان',          en: 'Crayons',      icon: '🖍️' },
  { id: 'watch',      ar: 'ساعة',           en: 'Watch',        icon: '⌚' },
  { id: 'umbrella',   ar: 'مظلة',           en: 'Umbrella',     icon: '☂️' },
  { id: 'ball',       ar: 'كرة',            en: 'Ball',         icon: '⚽' },
];

// Colours you can pick for a custom item.
// "key" is the name of the colour in i18n.js.
const COLOURS = [
  { value: '#e53935', key: 'colRed' },
  { value: '#1e88e5', key: 'colBlue' },
  { value: '#43a047', key: 'colGreen' },
  { value: '#fdd835', key: 'colYellow' },
  { value: '#8e24aa', key: 'colPurple' },
  { value: '#ec407a', key: 'colPink' },
  { value: '#fb8c00', key: 'colOrange' },
  { value: '#757575', key: 'colGrey' },
];

// Fun faces a child can pick as their avatar
const AVATARS = ['🦁', '🐼', '🦄', '🐸', '🐯', '🦊', '🐰', '🐨', '🐵', '🐙'];
