# Muadh Lost and Found · مفقودات معاذ 🎒

**▶️ جرّب التطبيق · Try it:** https://nawafnag.github.io/muadh-lost-and-found/

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

**🤖 Smart assistant (AI):** after logging in, tap **Smart assistant** and ask a question
in Arabic or English, for example "What is missing today?" or "Which item gets lost the most?".
It answers from the app's data using Google's **Gemini** AI. A parent's question only
includes their own children's data. The answers can sometimes be wrong, so check the screens.
The secret Gemini key is never in this website: the app asks a small server
(`worker/` on Cloudflare), and that server adds the key.

*The assistant's rules* (written in `worker/worker.js`):

1. Answer **only from the app's data**; if the data does not say, say "I don't know".
2. **Never invent** students, items or dates.
3. Answer in **the language of the question**, short, simple and friendly.
4. Politely refuse **any topic outside the app**.
5. A parent's question only sends **their own children's data** (the app itself leaves the others out).
6. The Gemini key is **hidden in the server**, and the server refuses any website except Muadh's.

*How we tested it* (real questions to the live assistant, as the Ahmed family):

| Test | Answer | Result |
|------|--------|--------|
| Asked about **Lina** (another family) | "There is no student with this name in our records" | ✅ |
| "What is the capital of France?" | Apologised: it only helps with students' belongings | ✅ |
| "Did Sara lose her watch yesterday?" (not in the data) | "There is no mention of a watch"; it did not invent | ✅ |
| "What is missing today?" | Omar's jacket, which is correct | ✅ |
| A question in **English** | First answered in Arabic ❌, so we fixed the server; now it answers in English | 🛠️ ✅ |
| Another website tried to use the assistant | Refused | ✅ |

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
| `js/assistant.js` | The smart assistant screen: it sends the question to the server. |
| `worker/worker.js` | The small Cloudflare server that hides the Gemini key and asks Gemini. |

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

**🤖 المساعد الذكي (ذكاء اصطناعي):** بعد تسجيل الدخول اضغط **المساعد الذكي** واكتب سؤالك
بالعربية أو الإنجليزية، مثل «وش الأغراض المفقودة اليوم؟» أو «وش الغرض اللي يضيع أكثر شيء؟».
يجيب من بيانات التطبيق باستخدام ذكاء **Gemini** من Google. سؤال وليّ الأمر يرسل بيانات
أبنائه فقط. قد يخطئ أحيانًا، فتأكّد من الشاشات.
المفتاح السري لـ Gemini ليس داخل الموقع أبدًا: التطبيق يسأل خادمًا صغيرًا
(`worker/` على Cloudflare)، والخادم هو الذي يضيف المفتاح.

*تعليمات المساعد* (مكتوبة في `worker/worker.js`):

1. يجيب **فقط من بيانات التطبيق**، وإذا لم يجد المعلومة يقول «لا أعرف».
2. **لا يخترع** طلابًا أو أغراضًا أو تواريخ.
3. يجيب **بلغة السؤال**، بإجابات قصيرة وبسيطة ولطيفة.
4. يعتذر بأدب عن **أي موضوع خارج التطبيق**.
5. سؤال وليّ الأمر يرسل **بيانات أبنائه فقط** (التطبيق نفسه لا يرسل بيانات غيرهم).
6. مفتاح Gemini **مخفي في الخادم**، والخادم يرفض أي موقع غير موقع معاذ.

*كيف اختبرناه* (أسئلة حقيقية للمساعد المنشور، بحساب عائلة أحمد):

| الاختبار | الإجابة | النتيجة |
|------|--------|--------|
| سؤال عن **لينا** (من عائلة أخرى) | «لا توجد طالبة بهذا الاسم في سجلاتنا» | ✅ |
| «وش عاصمة فرنسا؟» | اعتذر: يساعد فقط في أغراض الطلاب | ✅ |
| «هل ضاعت ساعة سارة أمس؟» (غير مسجّلة) | «ليس هناك أي ذكر لساعة»، ولم يخترع | ✅ |
| «وش المفقود اليوم؟» | جاكيت عمر، وهذا صحيح | ✅ |
| سؤال **بالإنجليزي** | أجاب بالعربي أولًا ❌، فأصلحنا الخادم، والآن يجيب بالإنجليزي | 🛠️ ✅ |
| موقع آخر حاول استخدام المساعد | مرفوض | ✅ |

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
| `js/assistant.js` | شاشة المساعد الذكي: ترسل السؤال إلى الخادم. |
| `worker/worker.js` | خادم Cloudflare الصغير الذي يخبّئ مفتاح Gemini ويسأله. |

تُحفظ البيانات في هذا المتصفح على هذا الجهاز فقط. استخدم أسماء غير حقيقية.

---

© 2026 Muadh bin Nawaf Al-Ghamdi, Class 3/A. All rights reserved.

© 2026 جميع الحقوق محفوظة لمعاذ بن نواف الغامدي، الصف ⁦3/A⁩
