# Muadh Lost and Found · مفقودات معاذ 🎒

## English

**What it does:** this app helps a student's things get home safely every day.
Each item (bag, jacket, glasses and so on) passes four checkpoints:

1. 🏠 **Home (morning)**: the parent chooses what the child takes to school.
2. 🏫 **School entry**: a teacher ticks the items when the child arrives.
3. 🚪 **School exit**: a teacher ticks the items before the child leaves.
4. 🏡 **Home (afternoon)**: the parent ticks what came back home.

If an item is not ticked, it is marked **Missing** ❌ and shown on the
**Lost & Found** board. Teachers can post things they found, and parents can tap
"This is ours!".

**Families:** every child belongs to a family. When you tap **Parent**, you choose
your family first, and then you only see your own children (and only their missing items).
Teachers see every student.

**PINs (secret numbers):** every role needs a 4-digit PIN: each family, the entry teacher,
the exit teacher and the **System admin**. The admin adds families, sets every PIN, and
manages students and items. The first admin PIN is **1234**, so please change it.
After 5 wrong tries you must wait 30 seconds. These PINs are for a class demo only:
they are kept in the browser, so they are not real security.

**Demo PINs** (after "Load demo data"):

| Who | PIN |
|-----|-----|
| System admin | 1234 |
| Entry teacher | 1111 |
| Exit teacher | 2222 |
| Ahmed family (Sara, Omar) | 1001 |
| Khalid family (Lina) | 1002 |
| Salem family (Yousef) | 1003 |

**How to run it:** double-click `index.html`. That's it! It opens in your browser.
Tap **Load demo data** on the home screen to see some example students.
Tap **ع / EN** at the top to switch between Arabic and English.

**The files:**

| File | What is inside |
|------|----------------|
| `index.html` | The page. It is almost empty, because the screens are drawn by JavaScript. |
| `css/style.css` | Colours, sizes and shapes. |
| `js/i18n.js` | Every word in Arabic and English, and the language switch. |
| `js/items.js` | The ready-made items, colours and avatars. |
| `js/store.js` | Saving and reading data (in the browser for now). |
| `js/app.js` | The screens and the buttons. |

Data is saved only in this browser on this device. Use fake names only.

---

## العربية

**ماذا يفعل التطبيق؟** يساعد هذا التطبيق على أن تعود أغراض الطالب إلى البيت كل يوم.
يمرّ كل غرض (الشنطة، الجاكيت، النظارة...) بأربع محطات:

1. 🏠 **البيت صباحًا**: يختار وليّ الأمر الأغراض التي يأخذها الطالب إلى المدرسة.
2. 🏫 **دخول المدرسة**: يضع المعلّم علامة على الأغراض عند وصول الطالب.
3. 🚪 **خروج المدرسة**: يضع المعلّم علامة على الأغراض قبل مغادرة الطالب.
4. 🏡 **البيت بعد المدرسة**: يضع وليّ الأمر علامة على ما وصل إلى البيت.

إذا لم توضع علامة على غرض، يصبح **مفقودًا** ❌ ويظهر في صفحة **المفقودات**.
يستطيع المعلّمون نشر الأغراض التي وجدوها، ويستطيع الأهل الضغط على «هذا لنا!».

**العائلات:** كل طالب يتبع عائلة. عند الضغط على **وليّ الأمر** تختار عائلتك أولًا،
ثم ترى أبناءك فقط (وأغراضهم المفقودة فقط). المعلّمون يرون كل الطلاب.

**الأرقام السرية:** كل دور يحتاج رقمًا سريًا من 4 أرقام: كل عائلة، ومعلّم الدخول،
ومعلّم الخروج، و**مدير النظام**. المدير يضيف العائلات ويجهّز كل الأرقام السرية،
ويدير الطلاب والأغراض. الرقم الأول للمدير هو **1234**، فغيّره من فضلك.
بعد 5 محاولات خاطئة يجب الانتظار 30 ثانية. هذه الأرقام للتجربة في الصف فقط،
لأنها محفوظة في المتصفح، فهي ليست حماية حقيقية.

**الأرقام السرية التجريبية** (بعد «تحميل بيانات تجريبية»):

| من | الرقم السري |
|-----|-----|
| مدير النظام | 1234 |
| معلّم الدخول | 1111 |
| معلّم الخروج | 2222 |
| عائلة أحمد (سارة، عمر) | 1001 |
| عائلة خالد (لينا) | 1002 |
| عائلة سالم (يوسف) | 1003 |

**طريقة التشغيل:** اضغط مرتين على ملف `index.html` وسيفتح في المتصفح.
اضغط على **تحميل بيانات تجريبية** في الصفحة الرئيسية لترى طلابًا للتجربة.
اضغط على **ع / EN** في الأعلى للتبديل بين العربية والإنجليزية.

**الملفات:**

| الملف | ماذا يوجد فيه |
|------|----------------|
| `index.html` | الصفحة، وهي شبه فارغة لأن JavaScript يرسم الشاشات. |
| `css/style.css` | الألوان والأحجام والأشكال. |
| `js/i18n.js` | كل الكلمات بالعربية والإنجليزية، وزر تغيير اللغة. |
| `js/items.js` | الأغراض الجاهزة والألوان والصور الرمزية. |
| `js/store.js` | حفظ البيانات وقراءتها (في المتصفح حاليًا). |
| `js/app.js` | الشاشات والأزرار. |

تُحفظ البيانات في هذا المتصفح على هذا الجهاز فقط. استخدم أسماء غير حقيقية.

---

© 2026 Muadh bin Nawaf Al-Ghamdi, Class 3/A. All rights reserved.

© 2026 جميع الحقوق محفوظة لمعاذ بن نواف الغامدي، الصف ⁦3/A⁩
