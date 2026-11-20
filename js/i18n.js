/* =========================================================
   i18n.js — Every word in the app, in Arabic and English.
   "ar" and "en" must always have the SAME keys.
   Words in {curly brackets} are filled in by the app.
   ========================================================= */

const TEXTS = {
  ar: {
    appName: 'مفقودات معاذ',
    // ⁦ and ⁩ keep "3/A" in the right order inside Arabic text
    copyright: '© 2026 جميع الحقوق محفوظة لمعاذ بن نواف الغامدي، الصف ⁦3/A⁩',
    langButton: 'EN',
    langButtonLabel: 'التبديل إلى اللغة الإنجليزية (English)',
    back: 'رجوع',
    goHome: 'الذهاب إلى الصفحة الرئيسية',

    // Home
    whoAreYou: 'من أنت اليوم؟',
    roleParent: 'وليّ الأمر',
    roleParentHint: 'في الصباح وبعد المدرسة',
    roleEntry: 'معلّم الدخول',
    roleEntryHint: 'عند وصول الطلاب',
    roleExit: 'معلّم الخروج',
    roleExitHint: 'قبل مغادرة الطلاب',
    youAre: 'أنت الآن: {role}',
    more: 'المزيد',
    lostFound: 'المفقودات',
    dashboard: 'لوحة المعلّم',
    students: 'الطلاب',
    items: 'الأغراض',
    history: 'الأيام السابقة',
    settings: 'الإعدادات',
    noStudentsYet: 'لا يوجد طلاب بعد. أضف طالبًا أو حمّل البيانات التجريبية.',
    noStudentsShort: 'لا يوجد طلاب بعد',
    notFound: 'لم نجد هذه الصفحة',

    // Settings
    loadDemo: 'تحميل بيانات تجريبية',
    demoLoaded: 'تم تحميل البيانات التجريبية 🎉',
    demoConfirm: 'سنضع البيانات التجريبية مكان كل البيانات الحالية. هل تريد المتابعة؟',
    demoYes: 'نعم، حمّل',
    settingsDemoHint: 'لعرض المشروع بسرعة في الصف',
    resetAll: 'حذف كل البيانات',
    resetConfirm: 'هل أنت متأكد؟ سيتم حذف كل الطلاب والأغراض والسجلات، ولا يمكن التراجع.',
    resetDone: 'تم حذف كل البيانات',
    dangerZone: 'منطقة الحذف',
    yesDelete: 'نعم، احذف',
    cancel: 'إلغاء',
    language: 'اللغة',
    langAr: 'العربية',
    langEn: 'English',
    today: 'اليوم',

    // Students
    addChild: 'إضافة طالب',
    nameAr: 'الاسم بالعربية',
    nameEn: 'الاسم بالإنجليزية',
    className: 'الصف',
    avatar: 'الصورة الرمزية',
    save: 'حفظ',
    nameNeeded: 'اكتب الاسم بلغة واحدة على الأقل',
    childAdded: 'تمت إضافة الطالب ✅',
    remove: 'حذف',
    removeChildConfirm: 'هل تريد حذف {name} وكل سجلاته؟',
    removed: 'تم الحذف',
    classLabel: 'الصف {c}',
    optional: '(اختياري)',

    // Families
    families: 'العائلات',
    family: 'العائلة',
    chooseFamily: 'اختر عائلتك',
    addFamily: 'إضافة عائلة',
    familyNameAr: 'اسم العائلة بالعربية',
    familyNameEn: 'اسم العائلة بالإنجليزية',
    familyAdded: 'تمت إضافة العائلة ✅',
    noFamilies: 'لا توجد عائلات بعد. اطلب من مدير النظام إضافة عائلتك.',

    // System admin and PINs
    roleAdmin: 'مدير النظام',
    roleAdminHint: 'يجهّز العائلات والأرقام السرية',
    enterPin: 'اكتب الرقم السري',
    pinFor: 'الدخول باسم: {who}',
    pinNotSet: 'لم يجهّز مدير النظام رقمًا سريًا بعد',
    wrongPin: 'الرقم السري غير صحيح، حاول مرة أخرى',
    tooManyTries: 'محاولات كثيرة. انتظر 30 ثانية ثم حاول',
    pinDigits: 'تمت كتابة {n} من 4 أرقام',
    deleteDigit: 'حذف آخر رقم',
    welcome: 'أهلًا! تم تسجيل الدخول ✅',
    logout: 'تسجيل الخروج',
    loggedOut: 'تم تسجيل الخروج',
    notLoggedIn: 'لم تسجّل الدخول بعد',
    tapRoleToLogin: 'اختر دورك، ثم اكتب الرقم السري',
    loginFirst: 'هذه الصفحة تحتاج تسجيل الدخول بالدور المناسب',
    familiesAndPins: 'العائلات وأرقامها السرية',
    staffPins: 'أرقام المعلّمين والمدير',
    pin: 'الرقم السري',
    pinRule: '(4 أرقام)',
    pinInvalid: 'الرقم السري يجب أن يكون 4 أرقام',
    pinSaved: 'تم حفظ الرقم السري ✅',
    changeDefaultPin: 'الرقم السري للمدير ما زال 1234. غيّره من «أرقام المعلّمين والمدير».',
    pinEntry: 'الرقم السري لمعلّم الدخول',
    pinExit: 'الرقم السري لمعلّم الخروج',
    pinAdmin: 'الرقم السري لمدير النظام',
    noPinYet: 'بدون رقم سري',
    pinSecurityNote: 'ملاحظة: هذه الأرقام السرية للتجربة في الصف، وليست حماية حقيقية.',
    noFamiliesShort: 'لا توجد عائلات بعد',
    helloFamily: 'أهلًا، {name}',
    changeFamily: 'تغيير العائلة',
    noChildrenInFamily: 'لا يوجد أبناء مرتبطون بهذه العائلة بعد',
    noFamilyLink: 'بدون عائلة',
    removeFamilyConfirm: 'هل تريد حذف {name}؟ سيبقى الأبناء ولكن بدون عائلة.',
    familyNeeded: 'اختر عائلة الطالب',
    addFamilyFirst: 'أضف عائلة أولًا، ثم أضف الطالب',
    childrenCount: 'عدد الأبناء: {n}',
    claimedOther: 'طلبته عائلة أخرى',
    familyChanged: 'تم تغيير العائلة ✅',

    // Items
    predefinedItems: 'أغراض جاهزة',
    customItems: 'أغراض خاصة',
    noCustomItems: 'لا توجد أغراض خاصة بعد',
    addCustomItem: 'إضافة غرض خاص',
    itemNameAr: 'اسم الغرض بالعربية',
    itemNameEn: 'اسم الغرض بالإنجليزية',
    colour: 'اللون',
    photo: 'الصورة',
    takePhoto: 'التقط صورة أو اختر من المعرض',
    removePhoto: 'إزالة الصورة',
    itemAdded: 'تمت إضافة الغرض ✅',
    removeItemConfirm: 'هل تريد حذف {name}؟',
    saveFailed: 'لم يتم الحفظ، ربما الصورة كبيرة جدًا',
    unknownItem: 'غرض غير معروف',
    colRed: 'أحمر',
    colBlue: 'أزرق',
    colGreen: 'أخضر',
    colYellow: 'أصفر',
    colPurple: 'بنفسجي',
    colPink: 'وردي',
    colOrange: 'برتقالي',
    colGrey: 'رمادي',

    // The four checkpoints
    stepDeclared: 'البيت صباحًا',
    stepCheckedIn: 'دخول المدرسة',
    stepCheckedOut: 'خروج المدرسة',
    stepHome: 'البيت بعد المدرسة',
    statusDeclared: 'تم التسجيل',
    statusCheckedIn: 'وصل إلى المدرسة',
    statusCheckedOut: 'خرج من المدرسة',
    statusHome: 'وصل إلى البيت',
    statusMissing: 'مفقود',
    statusPending: 'بالانتظار',
    statusDone: 'تم',
    statusLater: 'لاحقًا',
    missingAt: 'مفقود عند: {step}',
    lastSeen: 'آخر تأكيد: {step}',
    recoveredShort: 'وُجد لاحقًا',

    // Parent
    parentTitle: 'وليّ الأمر',
    chooseChild: 'اختر الطالب',
    morning: 'قائمة الصباح',
    afternoon: 'بعد المدرسة',
    todayTrack: 'رحلة الأغراض',
    morningTitle: 'ماذا سيأخذ {name} اليوم؟',
    tapToChoose: 'اضغط على الأغراض لاختيارها',
    sendToSchool: 'إرسال إلى المدرسة',
    chooseOneItem: 'اختر غرضًا واحدًا على الأقل',
    morningSaved: 'تم حفظ قائمة اليوم ✅',
    lockedCheckedIn: 'بدأ فحص المدرسة، لذلك لا يمكن تغيير القائمة الآن',
    afternoonTitle: 'ما الذي وصل إلى البيت مع {name}؟',
    tickArrived: 'ضع علامة على كل غرض وصل',
    waitExit: 'انتظر حتى يُنهي المعلّم فحص الخروج',
    confirm: 'تأكيد',
    savedAllGood: 'تم الحفظ، كل الأغراض موجودة 🎉',
    savedMissing: 'تم الحفظ. عدد الأغراض المفقودة: {n}',
    alreadyDone: 'تم هذا الفحص ✅ يمكنك تعديله إذا احتجت',
    nothingToday: 'لا توجد أغراض مسجّلة اليوم',
    nothingToCheck: 'لا توجد أغراض لفحصها',
    missingEarlier: 'مفقود من قبل',
    tickAll: 'تحديد الكل',
    itemsCount: 'عدد الأغراض: {n}',
    missingShort: 'مفقود: {n}',
    allHome: 'كل الأغراض في البيت',

    // Teacher
    entryTitle: 'فحص الدخول',
    exitTitle: 'فحص الخروج',
    tapStudent: 'اضغط على الطالب لفحص أغراضه',
    entryCheckFor: 'أغراض {name} عند الدخول',
    exitCheckFor: 'أغراض {name} عند الخروج',
    tickPresent: 'ضع علامة على كل غرض موجود',
    waitEntry: 'لم يتم فحص الدخول بعد',
    notDeclared: 'لم يسجّل الأهل أغراضًا اليوم',
    checkDone: 'تم الفحص',
    checkWaiting: 'بانتظار الفحص',

    // Day view and history
    dayTitle: 'رحلة الأغراض',
    chooseDate: 'اختر اليوم',
    noHistory: 'لا توجد سجلات لهذا اليوم',

    // Lost & Found
    missingItems: 'أغراض مفقودة',
    noMissing: 'لا توجد أغراض مفقودة 🎉',
    markRecovered: 'وجدناه',
    recovered: 'رائع! تم العثور على الغرض',
    foundItems: 'أغراض وجدها المعلّمون',
    noFound: 'لا توجد أغراض موجودة حاليًا',
    postFound: 'نشر غرض موجود',
    descAr: 'الوصف بالعربية',
    descEn: 'الوصف بالإنجليزية',
    descNeeded: 'اكتب وصفًا بلغة واحدة على الأقل',
    posted: 'تم نشر الغرض ✅',
    thisIsOurs: 'هذا لنا!',
    whichChild: 'لأيّ طالب هذا الغرض؟',
    claimedBy: 'طلبه: {name}',
    markReturned: 'تم التسليم',
    returnedLabel: 'تم تسليمه',
    waitingClaim: 'بانتظار صاحبه',
    claimed: 'تم الطلب، وسيسلّمه المعلّم قريبًا',
    returnedDone: 'تم تسليم الغرض 🎉',
    foundOn: 'وُجد في: {date}',
    onlyTeacherPost: 'المعلّمون فقط ينشرون الأغراض الموجودة.',

    // Dashboard
    checkedInCount: 'دخلوا المدرسة',
    checkedOutCount: 'خرجوا من المدرسة',
    missingCount: 'أغراض مفقودة اليوم',
    outOf: 'من أصل {n}',
    entryShort: 'الدخول',
    exitShort: 'الخروج',
    homeShort: 'البيت',

    // Smart assistant (Gemini)
    assistant: 'المساعد الذكي',
    assistantHint: 'اسألني عن أغراض الطلاب، وأجاوبك من بيانات النظام.',
    assistantNote: 'يجاوب بالذكاء الاصطناعي (Gemini) وقد يخطئ أحياناً. تأكّد من الشاشات.',
    askPlaceholder: 'اكتب سؤالك هنا…',
    askLabel: 'سؤالك',
    send: 'إرسال',
    thinking: 'يفكّر…',
    you: 'أنت',
    helper: 'المساعد',
    assistantError: 'ما قدرت أوصل للمساعد الحين. تأكّد من الإنترنت وجرّب مرة ثانية.',
    assistantNoKey: 'المساعد لم يُجهَّز بعد (ينقصه مفتاح Gemini).',
    assistantBusy: 'المساعد مشغول الحين، جرّب بعد دقيقة.',
    clearChat: 'مسح المحادثة',
    suggest1: 'وش الأغراض المفقودة اليوم؟',
    suggest2: 'وين ضاع آخر غرض مفقود؟',
    suggest3: 'وش الغرض اللي يضيع أكثر شيء؟',
  },

  en: {
    appName: 'Muadh Lost and Found',
    copyright: '© 2026 Muadh bin Nawaf Al-Ghamdi, Class 3/A. All rights reserved.',
    langButton: 'ع',
    langButtonLabel: 'Switch to Arabic (العربية)',
    back: 'Back',
    goHome: 'Go to the home screen',

    // Home
    whoAreYou: 'Who are you today?',
    roleParent: 'Parent',
    roleParentHint: 'In the morning and after school',
    roleEntry: 'Teacher: entry',
    roleEntryHint: 'When students arrive',
    roleExit: 'Teacher: exit',
    roleExitHint: 'Before students leave',
    youAre: 'You are: {role}',
    more: 'More',
    lostFound: 'Lost & Found',
    dashboard: 'Teacher dashboard',
    students: 'Students',
    items: 'Items',
    history: 'Past days',
    settings: 'Settings',
    noStudentsYet: 'No students yet. Add a child or load the demo data.',
    noStudentsShort: 'No students yet',
    notFound: 'We could not find that page',

    // Settings
    loadDemo: 'Load demo data',
    demoLoaded: 'Demo data loaded 🎉',
    demoConfirm: 'The demo data will replace all the data you have now. Continue?',
    demoYes: 'Yes, load it',
    settingsDemoHint: 'To show the project quickly in class',
    resetAll: 'Reset all data',
    resetConfirm: 'Are you sure? All students, items and records will be deleted. This cannot be undone.',
    resetDone: 'All data has been deleted',
    dangerZone: 'Delete zone',
    yesDelete: 'Yes, delete',
    cancel: 'Cancel',
    language: 'Language',
    langAr: 'العربية',
    langEn: 'English',
    today: 'Today',

    // Students
    addChild: 'Add a child',
    nameAr: 'Name in Arabic',
    nameEn: 'Name in English',
    className: 'Class',
    avatar: 'Avatar',
    save: 'Save',
    nameNeeded: 'Please write the name in at least one language',
    childAdded: 'Child added ✅',
    remove: 'Remove',
    removeChildConfirm: 'Remove {name} and all their records?',
    removed: 'Removed',
    classLabel: 'Class {c}',
    optional: '(optional)',

    // Families
    families: 'Families',
    family: 'Family',
    chooseFamily: 'Choose your family',
    addFamily: 'Add a family',
    familyNameAr: 'Family name in Arabic',
    familyNameEn: 'Family name in English',
    familyAdded: 'Family added ✅',
    noFamilies: 'No families yet. Ask the system admin to add your family.',

    // System admin and PINs
    roleAdmin: 'System admin',
    roleAdminHint: 'Sets up families and PINs',
    enterPin: 'Enter the PIN',
    pinFor: 'Logging in as: {who}',
    pinNotSet: 'The system admin has not set a PIN yet',
    wrongPin: 'Wrong PIN. Please try again',
    tooManyTries: 'Too many tries. Please wait 30 seconds',
    pinDigits: '{n} of 4 digits typed',
    deleteDigit: 'Delete the last digit',
    welcome: 'Welcome! You are logged in ✅',
    logout: 'Log out',
    loggedOut: 'You are logged out',
    notLoggedIn: 'Not logged in yet',
    tapRoleToLogin: 'Choose your role, then enter the PIN',
    loginFirst: 'You need to log in with the right role to see this page',
    familiesAndPins: 'Families and their PINs',
    staffPins: 'Teacher and admin PINs',
    pin: 'PIN',
    pinRule: '(4 digits)',
    pinInvalid: 'The PIN must be 4 digits',
    pinSaved: 'PIN saved ✅',
    changeDefaultPin: 'The admin PIN is still 1234. Change it in “Teacher and admin PINs”.',
    pinEntry: 'Entry teacher PIN',
    pinExit: 'Exit teacher PIN',
    pinAdmin: 'System admin PIN',
    noPinYet: 'No PIN yet',
    pinSecurityNote: 'Note: these PINs are for a class demo. They are not real security.',
    noFamiliesShort: 'No families yet',
    helloFamily: 'Hello, {name}',
    changeFamily: 'Change family',
    noChildrenInFamily: 'No children are linked to this family yet',
    noFamilyLink: 'No family',
    removeFamilyConfirm: 'Remove {name}? The children will stay, but without a family.',
    familyNeeded: "Please choose the child's family",
    addFamilyFirst: 'Add a family first, then add the child',
    childrenCount: 'Children: {n}',
    claimedOther: 'Claimed by another family',
    familyChanged: 'Family changed ✅',

    // Items
    predefinedItems: 'Ready-made items',
    customItems: 'Custom items',
    noCustomItems: 'No custom items yet',
    addCustomItem: 'Add a custom item',
    itemNameAr: 'Item name in Arabic',
    itemNameEn: 'Item name in English',
    colour: 'Colour',
    photo: 'Photo',
    takePhoto: 'Take a photo or choose one',
    removePhoto: 'Remove photo',
    itemAdded: 'Item added ✅',
    removeItemConfirm: 'Remove {name}?',
    saveFailed: 'Could not save. The photo may be too big.',
    unknownItem: 'Unknown item',
    colRed: 'Red',
    colBlue: 'Blue',
    colGreen: 'Green',
    colYellow: 'Yellow',
    colPurple: 'Purple',
    colPink: 'Pink',
    colOrange: 'Orange',
    colGrey: 'Grey',

    // The four checkpoints
    stepDeclared: 'Home (morning)',
    stepCheckedIn: 'School entry',
    stepCheckedOut: 'School exit',
    stepHome: 'Home (afternoon)',
    statusDeclared: 'Declared',
    statusCheckedIn: 'Checked in',
    statusCheckedOut: 'Checked out',
    statusHome: 'Received home',
    statusMissing: 'Missing',
    statusPending: 'Waiting',
    statusDone: 'Done',
    statusLater: 'Later',
    missingAt: 'Missing at: {step}',
    lastSeen: 'Last confirmed: {step}',
    recoveredShort: 'Found later',

    // Parent
    parentTitle: 'Parent',
    chooseChild: 'Choose a child',
    morning: 'Morning list',
    afternoon: 'After school',
    todayTrack: 'Item journey',
    morningTitle: 'What is {name} taking today?',
    tapToChoose: 'Tap the items to choose them',
    sendToSchool: 'Send to school',
    chooseOneItem: 'Please choose at least one item',
    morningSaved: "Today's list is saved ✅",
    lockedCheckedIn: "The school check has started, so the list can't change now",
    afternoonTitle: 'What came home with {name}?',
    tickArrived: 'Tick every item that arrived',
    waitExit: 'Please wait until the teacher does the exit check',
    confirm: 'Confirm',
    savedAllGood: 'Saved. Every item is here 🎉',
    savedMissing: 'Saved. Missing items: {n}',
    alreadyDone: 'This check is done ✅ You can change it if you need to',
    nothingToday: 'No items listed for today',
    nothingToCheck: 'There are no items to check',
    missingEarlier: 'Already missing',
    tickAll: 'Tick all',
    itemsCount: 'Items: {n}',
    missingShort: 'Missing: {n}',
    allHome: 'Everything is home',

    // Teacher
    entryTitle: 'Entry check',
    exitTitle: 'Exit check',
    tapStudent: 'Tap a student to check their items',
    entryCheckFor: "{name}'s items at entry",
    exitCheckFor: "{name}'s items at exit",
    tickPresent: 'Tick every item that is here',
    waitEntry: 'The entry check is not done yet',
    notDeclared: 'No items listed by the parent today',
    checkDone: 'Checked',
    checkWaiting: 'Waiting for check',

    // Day view and history
    dayTitle: 'Item journey',
    chooseDate: 'Choose a day',
    noHistory: 'No records for this day',

    // Lost & Found
    missingItems: 'Missing items',
    noMissing: 'No missing items 🎉',
    markRecovered: 'We found it',
    recovered: 'Great! The item was found',
    foundItems: 'Items found by teachers',
    noFound: 'No found items right now',
    postFound: 'Post a found item',
    descAr: 'Description in Arabic',
    descEn: 'Description in English',
    descNeeded: 'Please write a description in at least one language',
    posted: 'Found item posted ✅',
    thisIsOurs: 'This is ours!',
    whichChild: 'Which child does this belong to?',
    claimedBy: 'Claimed by: {name}',
    markReturned: 'Mark as returned',
    returnedLabel: 'Returned',
    waitingClaim: 'Waiting for its owner',
    claimed: 'Claimed! The teacher will hand it back soon',
    returnedDone: 'Item returned 🎉',
    foundOn: 'Found on: {date}',
    onlyTeacherPost: 'Only teachers can post found items.',

    // Dashboard
    checkedInCount: 'Checked in',
    checkedOutCount: 'Checked out',
    missingCount: 'Missing items today',
    outOf: 'out of {n}',
    entryShort: 'Entry',
    exitShort: 'Exit',
    homeShort: 'Home',

    // Smart assistant (Gemini)
    assistant: 'Smart assistant',
    assistantHint: "Ask me about the students' belongings. I answer from the app's data.",
    assistantNote: 'Answers come from AI (Gemini) and can sometimes be wrong. Check the screens.',
    askPlaceholder: 'Type your question…',
    askLabel: 'Your question',
    send: 'Send',
    thinking: 'Thinking…',
    you: 'You',
    helper: 'Assistant',
    assistantError: 'I could not reach the assistant. Check the internet and try again.',
    assistantNoKey: 'The assistant is not set up yet (the Gemini key is missing).',
    assistantBusy: 'The assistant is busy right now. Try again in a minute.',
    clearChat: 'Clear chat',
    suggest1: 'What is missing today?',
    suggest2: 'Where was the last missing item lost?',
    suggest3: 'Which item gets lost the most?',
  },
};

// The language we are using right now
let currentLang = 'ar';

// t('key') gives the word for the current language.
// t('youAre', { role: 'Parent' }) also fills in {role}.
function t(key, values) {
  let text = TEXTS[currentLang][key];
  if (text === undefined) text = TEXTS.en[key];
  if (text === undefined) text = key;
  if (values) {
    for (const name in values) {
      text = text.split('{' + name + '}').join(values[name]);
    }
  }
  return text;
}

// For things that have two names (items, children, descriptions):
// show the current language, or the other one if it is empty.
function pickText(arabic, english) {
  const ar = (arabic || '').trim();
  const en = (english || '').trim();
  return currentLang === 'ar' ? (ar || en) : (en || ar);
}

// Change the language: words, direction (RTL / LTR) and saved choice
function setLanguage(lang) {
  currentLang = (lang === 'en') ? 'en' : 'ar';
  document.documentElement.lang = currentLang;
  document.documentElement.dir = (currentLang === 'ar') ? 'rtl' : 'ltr';
  document.title = t('appName');
  Store.setLang(currentLang);
}

// Dates for the current language, always with digits 0-9
function dateOptions(extra) {
  return Object.assign({ calendar: 'gregory', numberingSystem: 'latn' }, extra);
}
function dateLocale() {
  return currentLang === 'ar' ? 'ar-SA' : 'en-GB';
}

// "2026-11-20" -> "Friday 20 November 2026" / "الجمعة، 20 نوفمبر 2026"
function formatDate(dateKey) {
  const parts = dateKey.split('-').map(Number);
  const date = new Date(parts[0], parts[1] - 1, parts[2]);
  return new Intl.DateTimeFormat(dateLocale(), dateOptions({
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })).format(date);
}

// A date with a time, for found items
function formatDateTime(milliseconds) {
  return new Intl.DateTimeFormat(dateLocale(), dateOptions({
    day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit',
  })).format(new Date(milliseconds));
}
