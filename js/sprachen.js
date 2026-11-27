/* Joum 4D Build – Sprachen: Oberfläche, Vorlesen und Sprachbefehle in der gewählten Sprache.
   Offline über ein eingebautes Wörterbuch (Menüs, Startseite, Räume, Knöpfe, Ansagen).
   Lange Anleitungstexte bleiben vorerst Deutsch → volle Übersetzung über Server (siehe SERVER-CHECKLISTE). */

const SPRACHEN = [
  ['de', 'Deutsch', 'de-DE'], ['en', 'English', 'en-US'], ['tr', 'Türkçe', 'tr-TR'], ['ar', 'العربية', 'ar-SA'],
  ['pl', 'Polski', 'pl-PL'], ['ru', 'Русский', 'ru-RU'], ['uk', 'Українська', 'uk-UA'], ['ro', 'Română', 'ro-RO']
];
const SPR_IDX = { de: 0, en: 1, tr: 2, ar: 3, pl: 4, ru: 5, uk: 6, ro: 7 };
function spr() { return (S.einstellungen && S.einstellungen.sprache) || 'de'; }
function sprBcp() { return (SPRACHEN.find((s) => s[0] === spr()) || SPRACHEN[0])[2]; }

/* Wörterbuch: Deutsch | English | Türkçe | العربية | Polski | Русский | Українська | Română */
const WB_ROH = `Start|Home|Ana sayfa|الرئيسية|Start|Главная|Головна|Acasă
Projekte|Projects|Projeler|المشاريع|Projekty|Проекты|Проєкти|Proiecte
Garten 4D|Garden 4D|Bahçe 4D|الحديقة 4D|Ogród 4D|Сад 4D|Сад 4D|Grădină 4D
Profi|Pro|Usta|محترف|Fachowiec|Мастер|Майстер|Meșter
Mehr|More|Daha fazla|المزيد|Więcej|Ещё|Більше|Mai mult
Plan. Bau. Fertig.|Plan. Build. Done.|Planla. İnşa et. Bitti.|خطط. ابنِ. انتهى.|Planuj. Buduj. Gotowe.|План. Стройка. Готово.|План. Будова. Готово.|Plan. Construiește. Gata.
Assistent|Assistant|Asistan|المساعد|Asystent|Помощник|Помічник|Asistent
Gestalten 3D|Design 3D|3D tasarım|تصميم ثلاثي الأبعاد|Projektuj 3D|Дизайн 3D|Дизайн 3D|Design 3D
Einkauf|Shopping|Alışveriş|المشتريات|Zakupy|Покупки|Покупки|Cumpărături
Rechner|Calculator|Hesaplayıcı|الحاسبة|Kalkulator|Калькулятор|Калькулятор|Calculator
Finanzen|Finances|Finans|المالية|Finanse|Финансы|Фінанси|Finanțe
Kino-Tour|Cinema tour|Sinema turu|جولة سينمائية|Kino-tour|Кино-тур|Кіно-тур|Tur cinema
Weitere Projekte|More projects|Diğer projeler|مشاريع أخرى|Inne projekty|Другие проекты|Інші проєкти|Alte proiecte
Aktives Projekt|Active project|Aktif proje|المشروع الحالي|Aktywny projekt|Активный проект|Активний проєкт|Proiect activ
Nächster Schritt|Next step|Sonraki adım|الخطوة التالية|Następny krok|Следующий шаг|Наступний крок|Pasul următor
Projekt öffnen|Open project|Projeyi aç|افتح المشروع|Otwórz projekt|Открыть проект|Відкрити проєкт|Deschide proiectul
▶ 4D-Bauablauf|▶ 4D build sequence|▶ 4D inşaat akışı|▶ مراحل البناء 4D|▶ Przebieg budowy 4D|▶ Ход стройки 4D|▶ Хід будівництва 4D|▶ Etapele construcției 4D
Willkommen bei Joum 4D Build|Welcome to Joum 4D Build|Joum 4D Build'e hoş geldiniz|مرحباً بك في Joum 4D Build|Witaj w Joum 4D Build|Добро пожаловать в Joum 4D Build|Ласкаво просимо до Joum 4D Build|Bun venit la Joum 4D Build
Projekt starten|Start project|Projeye başla|ابدأ المشروع|Rozpocznij projekt|Начать проект|Почати проєкт|Începe proiectul
Innen|Inside|İç mekân|الداخل|Wewnątrz|Внутри|Всередині|Interior
Haus außen|House exterior|Dış cephe|خارج المنزل|Na zewnątrz domu|Снаружи дома|Зовні будинку|Exterior casă
Garten|Garden|Bahçe|الحديقة|Ogród|Сад|Сад|Grădină
Innen · Haus außen · Garten|Inside · Exterior · Garden|İç · Dış · Bahçe|الداخل · الخارج · الحديقة|Wewnątrz · Zewnątrz · Ogród|Внутри · Снаружи · Сад|Всередині · Зовні · Сад|Interior · Exterior · Grădină
Planungs-Assistent|Planning assistant|Planlama asistanı|مساعد التخطيط|Asystent planowania|Помощник по планированию|Помічник з планування|Asistent de planificare
Sprechen oder schreiben|Speak or type|Konuş veya yaz|تحدث أو اكتب|Mów lub pisz|Говорите или пишите|Говоріть або пишіть|Vorbește sau scrie
Gartenplaner 4D|Garden planner 4D|Bahçe planlayıcı 4D|مخطط الحديقة 4D|Planer ogrodu 4D|Планировщик сада 4D|Планувальник саду 4D|Planificator grădină 4D
Tipps & Rechner|Tips & calculators|İpuçları ve hesaplayıcılar|نصائح وحاسبات|Porady i kalkulatory|Советы и калькуляторы|Поради та калькулятори|Sfaturi și calculatoare
Wasser, Abwasser & Elektro|Water, drainage & electrics|Su, atık su ve elektrik|الماء والصرف والكهرباء|Woda, kanalizacja i elektryka|Вода, канализация и электрика|Вода, каналізація та електрика|Apă, canalizare și electrice
Messen|Measure|Ölç|القياس|Pomiar|Замер|Вимірювання|Măsurare
Gestalten|Design|Tasarla|التصميم|Projektuj|Дизайн|Дизайн|Design
KI-Ideen|AI ideas|Yapay zekâ fikirleri|أفكار الذكاء الاصطناعي|Pomysły AI|Идеи ИИ|Ідеї ШІ|Idei AI
Foto + Zollstock|Photo + folding rule|Fotoğraf + metre|صورة + متر|Zdjęcie + miarka|Фото + метр|Фото + метр|Foto + metru
Profi & Marktplatz|Pros & marketplace|Ustalar ve pazar yeri|المحترفون والسوق|Fachowcy i rynek|Мастера и биржа|Майстри та біржа|Meșteri și piață
Community|Community|Topluluk|المجتمع|Społeczność|Сообщество|Спільнота|Comunitate
Datensicherung & Versionen|Backup & versions|Yedekleme ve sürümler|النسخ الاحتياطي والإصدارات|Kopia zapasowa i wersje|Резервная копия и версии|Резервна копія та версії|Copie de siguranță și versiuni
Was jetzt?|What now?|Şimdi ne yapmalı?|ماذا الآن؟|Co teraz?|Что дальше?|Що далі?|Ce urmează?
Vorlesen|Read aloud|Sesli oku|القراءة بصوت|Czytaj na głos|Читать вслух|Читати вголос|Citește cu voce tare
Sprechtempo|Speech speed|Konuşma hızı|سرعة الكلام|Tempo mowy|Скорость речи|Швидкість мовлення|Viteza vorbirii
Langsam|Slow|Yavaş|بطيء|Wolno|Медленно|Повільно|Încet
Normal|Normal|Normal|عادي|Normalnie|Обычно|Звичайно|Normal
Schnell|Fast|Hızlı|سريع|Szybko|Быстро|Швидко|Rapid
Abbrechen|Cancel|İptal|إلغاء|Anuluj|Отмена|Скасувати|Anulează
Los|Go|Başla|انطلق|Start|Вперёд|Вперед|Start
Speichern|Save|Kaydet|حفظ|Zapisz|Сохранить|Зберегти|Salvează
Löschen|Delete|Sil|حذف|Usuń|Удалить|Видалити|Șterge
Zurück|Back|Geri|رجوع|Wstecz|Назад|Назад|Înapoi
Weiter|Next|İleri|التالي|Dalej|Далее|Далі|Înainte
Fertig|Done|Bitti|تم|Gotowe|Готово|Готово|Gata
OK|OK|Tamam|حسناً|OK|ОК|ОК|OK
+ Projekt|+ Project|+ Proje|+ مشروع|+ Projekt|+ Проект|+ Проєкт|+ Proiect
Wohnzimmer|Living room|Oturma odası|غرفة المعيشة|Salon|Гостиная|Вітальня|Sufragerie
Esszimmer|Dining room|Yemek odası|غرفة الطعام|Jadalnia|Столовая|Їдальня|Sufragerie de masă
Küche|Kitchen|Mutfak|المطبخ|Kuchnia|Кухня|Кухня|Bucătărie
Badezimmer|Bathroom|Banyo|الحمام|Łazienka|Ванная|Ванна кімната|Baie
Gäste-WC|Guest toilet|Misafir tuvaleti|حمام الضيوف|WC dla gości|Гостевой туалет|Гостьовий туалет|Toaletă oaspeți
Schlafzimmer|Bedroom|Yatak odası|غرفة النوم|Sypialnia|Спальня|Спальня|Dormitor
Kinderzimmer|Children's room|Çocuk odası|غرفة الأطفال|Pokój dziecięcy|Детская|Дитяча|Camera copiilor
Babyzimmer|Nursery|Bebek odası|غرفة الرضيع|Pokój niemowlęcy|Комната малыша|Кімната малюка|Camera bebelușului
Jugendzimmer|Teen room|Genç odası|غرفة المراهقين|Pokój nastolatka|Комната подростка|Кімната підлітка|Camera adolescentului
Gästezimmer|Guest room|Misafir odası|غرفة الضيوف|Pokój gościnny|Гостевая комната|Гостьова кімната|Cameră de oaspeți
Büro / Arbeitszimmer|Office / study|Ofis / çalışma odası|المكتب|Biuro / gabinet|Кабинет|Кабінет|Birou
Flur / Diele|Hallway|Koridor|الممر|Korytarz|Прихожая|Передпокій|Hol
Treppe / Treppenhaus|Stairs / stairwell|Merdiven|الدرج|Schody / klatka|Лестница|Сходи|Scară
Ankleide|Walk-in closet|Giyinme odası|غرفة الملابس|Garderoba|Гардеробная|Гардеробна|Dressing
Abstellraum / Speisekammer|Storage / pantry|Depo / kiler|المخزن|Schowek / spiżarnia|Кладовая|Комора|Debara / cămară
Waschraum / Hauswirtschaftsraum|Laundry / utility room|Çamaşır odası|غرفة الغسيل|Pralnia|Прачечная|Пральня|Spălătorie
Keller|Basement|Bodrum|القبو|Piwnica|Подвал|Підвал|Subsol
Heizungsraum|Boiler room|Kazan dairesi|غرفة التدفئة|Kotłownia|Котельная|Котельня|Centrală termică
Dachgeschoss / Dachboden|Attic / loft|Çatı katı|العلية|Poddasze|Мансарда / чердак|Мансарда / горище|Mansardă / pod
Hobbyraum / Werkstatt|Hobby room / workshop|Hobi odası / atölye|ورشة|Warsztat|Мастерская|Майстерня|Atelier
Fitnessraum|Gym|Spor odası|غرفة الرياضة|Siłownia|Спортзал|Спортзал|Sală de fitness
Heimkino / Medienraum|Home cinema|Ev sineması|السينما المنزلية|Kino domowe|Домашний кинотеатр|Домашній кінотеатр|Home cinema
Wintergarten|Conservatory|Kış bahçesi|الحديقة الشتوية|Ogród zimowy|Зимний сад|Зимовий сад|Grădină de iarnă
Balkon / Loggia|Balcony|Balkon|الشرفة|Balkon / loggia|Балкон / лоджия|Балкон / лоджія|Balcon
Garage / Carport|Garage / carport|Garaj|المرآب|Garaż / wiata|Гараж / навес|Гараж / навіс|Garaj
Fassade & Haus außen|Facade & exterior|Cephe ve dış mekân|الواجهة والخارج|Elewacja i zewnątrz|Фасад и снаружи|Фасад і зовні|Fațadă și exterior
Dach|Roof|Çatı|السقف|Dach|Крыша|Дах|Acoperiș
Wasser|Water|Su|الماء|Woda|Вода|Вода|Apă
Abwasser|Drainage|Atık su|الصرف|Kanalizacja|Канализация|Каналізація|Canalizare
Elektro|Electrics|Elektrik|الكهرباء|Elektryka|Электрика|Електрика|Electrice
Werkzeug|Tools|Aletler|الأدوات|Narzędzia|Инструменты|Інструменти|Unelte
Sprache|Language|Dil|اللغة|Język|Язык|Мова|Limbă
Tippe auf den blinkenden Knopf|Tap the blinking button|Yanıp sönen düğmeye dokun|اضغط على الزر الوامض|Dotknij migającego przycisku|Нажмите на мигающую кнопку|Натисніть на кнопку, що блимає|Atinge butonul care clipește
Ich höre zu …|I'm listening …|Dinliyorum …|أنا أستمع …|Słucham …|Слушаю …|Слухаю …|Ascult …
Hier ist|Here is|İşte|هنا|Oto|Вот|Ось|Iată
Hier ist die Startseite.|This is the home page.|Burası ana sayfa.|هذه هي الصفحة الرئيسية.|To jest strona główna.|Это главная страница.|Це головна сторінка.|Aceasta este pagina principală.
Sprache gewechselt: Deutsch|Language changed: English|Dil değiştirildi: Türkçe|تم تغيير اللغة: العربية|Zmieniono język: polski|Язык изменён: русский|Мову змінено: українська|Limba schimbată: română
Was möchtest du tun?|What would you like to do?|Ne yapmak istiyorsun?|ماذا تريد أن تفعل؟|Co chcesz zrobić?|Что вы хотите сделать?|Що ви хочете зробити?|Ce vrei să faci?
Befehl eintippen|Type a command|Komut yaz|اكتب أمراً|Wpisz polecenie|Введите команду|Введіть команду|Scrie o comandă
Nicht verstanden – bitte nochmal|Not understood – please try again|Anlaşılmadı – lütfen tekrar|لم أفهم – حاول مرة أخرى|Nie zrozumiałem – spróbuj ponownie|Не понял – повторите|Не зрозумів – повторіть|Nu am înțeles – încearcă din nou
Mikrofon ist hier nicht erlaubt – bitte Befehl eintippen.|Microphone not allowed here – please type the command.|Mikrofona izin yok – lütfen komutu yaz.|الميكروفون غير مسموح هنا – اكتب الأمر.|Mikrofon niedozwolony – wpisz polecenie.|Микрофон запрещён – введите команду.|Мікрофон заборонено – введіть команду.|Microfonul nu e permis – scrie comanda.
Du kannst zum Beispiel sagen:|You can say, for example:|Örneğin şunu söyleyebilirsin:|يمكنك أن تقول مثلاً:|Możesz powiedzieć na przykład:|Можно сказать, например:|Можна сказати, наприклад:|Poți spune, de exemplu:
Inhalte dieser Seite sind noch Deutsch.|Some content on this page is still in German.|Bu sayfadaki bazı içerikler henüz Almanca.|بعض المحتوى في هذه الصفحة ما زال بالألمانية.|Część treści jest jeszcze po niemiecku.|Часть содержимого пока на немецком.|Частина вмісту ще німецькою.|Unele conținuturi sunt încă în germană.`;
const WB = {};
WB_ROH.split('\n').forEach((z) => { const t = z.split('|'); if (t.length === 8) WB[t[0]] = t; });

/* Beispiel-Befehle je Sprache (für Hilfe-Ansage) */
const BEISPIELE = {
  de: 'Ich will mein Bad fliesen. Quittung speichern. Wie geht es weiter? Garten planen.',
  en: 'I want to tile my bathroom. Save receipt. What next? Plan the garden.',
  tr: 'Banyomu fayanslamak istiyorum. Fişi kaydet. Sırada ne var? Bahçe planla.',
  ar: 'أريد تبليط الحمام. احفظ الإيصال. ما التالي؟ خطط الحديقة.',
  pl: 'Chcę położyć płytki w łazience. Zapisz paragon. Co dalej? Zaplanuj ogród.',
  ru: 'Хочу положить плитку в ванной. Сохранить чек. Что дальше? Спланировать сад.',
  uk: 'Хочу покласти плитку у ванній. Зберегти чек. Що далі? Спланувати сад.',
  ro: 'Vreau să pun faianță în baie. Salvează bonul. Ce urmează? Planifică grădina.'
};

function T(de) {
  const l = spr(); if (l === 'de' || de == null) return de;
  const e = WB[de]; return e ? e[SPR_IDX[l]] : de;
}
/* Ganzen Text übersetzen, so weit das Wörterbuch reicht (auch „A · B“) */
function TT(text) {
  if (spr() === 'de') return text;
  const s = String(text).trim(); if (!s) return text;
  if (WB[s]) return text.replace(s, T(s));
  if (s.includes(' · ')) { const teile = s.split(' · '); if (teile.some((x) => WB[x])) return text.replace(s, teile.map((x) => WB[x] ? T(x) : x).join(' · ')); }
  return text;
}

/* Fremdsprachige Befehle → deutsche Schlüsselwörter, damit absicht() sie versteht */
const BEFEHL_WOERTER = [
  [/\b(help|yardım|pomoc|помощь|допомога|ajutor)\b|مساعدة/i, 'hilfe'],
  [/what next|what now|next step|sırada ne|şimdi ne|ne yapmalı|co dalej|co teraz|что дальше|следующий шаг|що далі|наступний крок|ce urmează|pasul următor|ماذا الآن|ما التالي|الخطوة التالية/i, 'wie geht es weiter'],
  [/read aloud|sesli oku|czytaj|читай|читати|citește|اقرأ/i, 'vorlesen'],
  [/home ?page|\bhome\b|ana sayfa|strona główna|главн|головн|acasă|الرئيسية/i, 'startseite'],
  [/receipt|invoice|fiş|fatura|paragon|rachunek|чек|квитанц|bon|chitanță|إيصال|فاتورة/i, 'quittung'],
  [/\btax|vergi|podat|налог|податок|impozit|ضريبة/i, 'steuer'],
  [/shopping|buy|alışveriş|zakupy|покупк|cumpărături|مشتريات/i, 'einkaufsliste'],
  [/folding rule|metre ile|miarka|рулетк|metru|متر/i, 'zollstock'],
  [/measure|ölç|zmierz|pomiar|измер|замер|вимір|măsoar|قياس|قِس/i, 'messen'],
  [/floor ?plan|kat planı|rzut|планировк|план квартир|планування|plan casă|مخطط/i, 'grundriss'],
  [/sketch|eskiz|çizim|szkic|эскиз|ескіз|schiță|رسم/i, 'skizze'],
  [/before.*after|önce.*sonra|przed.*po|до.*после|до.*після|înainte.*după|قبل.*بعد/i, 'vorher nachher'],
  [/build sequence|construction|inşaat|budow|стройк|будівн|construcț|بناء/i, 'bauablauf'],
  [/cinema|sinema|kino|кино|кіно|سينما/i, 'kino tour'],
  [/tradesman|craftsman|handyman|\busta\b|fachow|мастер|майстер|meșter|حرفي|فني/i, 'handwerker'],
  [/garden|bahçe|ogród|ogrod|сад|grădin|حديقة/i, 'garten'],
  [/socket|outlet|electric|priz|elektrik|gniazdk|elektry|розетк|электр|електр|priză|electric|كهرباء|مقبس/i, 'steckdose'],
  [/drain|sewage|atık su|kanaliz|канализ|каналіз|canalizare|صرف/i, 'abwasser'],
  [/water|\bsu\b|woda|вода|apă|ماء/i, 'wasser'],
  [/tool|alet|narzędz|инструмент|інструмент|unelt|أدوات/i, 'werkzeug'],
  [/calculat|hesap|kalkulat|калькул|calcul|حاسبة/i, 'rechner'],
  [/backup|yedek|kopia|резерв|copie|نسخ/i, 'sicherung'],
  [/setting|ayar|ustawien|настро|налашт|setări|إعدادات/i, 'einstellung'],
  [/assistant|asistan|asystent|помощник|помічник|asistent|مساعد/i, 'assistent'],
  [/new project|yeni proje|nowy projekt|новый проект|новий проєкт|proiect nou|مشروع جديد|renovat|tadilat|remont|ремонт|renov/i, 'projekt anlegen'],
  // Tätigkeiten
  [/\btil(e|ing)|fayans|seramik|płytk|плитк|faianț|gresie|بلاط|تبليط/i, 'fliesen'],
  [/paint|boya|malow|покрас|красить|фарбув|vops|zugrăv|دهان|طلاء/i, 'streichen'],
  [/wallpaper|duvar kağıdı|tapet|обои|шпалер|تورق|ورق جدران/i, 'tapezieren'],
  [/laminate|laminat|ламинат|ламінат|باركيه/i, 'laminat'],
  [/silicone|silikon|силикон|силікон|سيليكون/i, 'silikon'],
  [/drywall|alçıpan|regips|гипсокартон|гіпсокартон|rigips|جبس/i, 'trockenbau'],
  [/fan|ventilat|havalandırma|aspiratör|wentyl|вентил|ventilat|تهوية|مروحة/i, 'lüfter'],
  [/window|pencere|okn|окн|вікн|fereastr|نافذة/i, 'fenster'],
  [/roof|çatı|dach|крыш|дах|acoperiș|سقف/i, 'dach'],
  [/facade|cephe|elewac|фасад|fațad|واجهة/i, 'fassade'],
  [/terrace|patio|teras|taras|террас|терас|terasă|تراس/i, 'terrasse'],
  [/fence|çit|ogrodzen|забор|паркан|gard|سياج/i, 'zaun'],
  [/raised bed|yükseltilmiş yatak|grządk|грядк|strat înălțat|حوض مرتفع/i, 'hochbeet'],
  [/pond|gölet|staw|пруд|став|iaz|بركة/i, 'teich'],
  [/damp|mould|mold|nem|küf|wilgo|pleś|сырост|плесен|вологіст|пліснява|umezeal|mucegai|رطوبة|عفن/i, 'feucht'],
  // Räume
  [/bathroom|\bbath\b|banyo|łazien|ванн|baie|حمام/i, 'bad'],
  [/toilet|\bwc\b|tuvalet|toalet|туалет|toaletă|مرحاض/i, 'toilette'],
  [/kitchen|mutfak|kuchni|кухн|bucătări|مطبخ/i, 'küche'],
  [/living ?room|oturma odası|salon|гостин|вітальн|sufragerie|غرفة المعيشة/i, 'wohnzimmer'],
  [/dining|yemek odası|jadaln|столов|їдальн|غرفة الطعام/i, 'esszimmer'],
  [/bedroom|yatak odası|sypialn|спальн|dormitor|غرفة النوم/i, 'schlafzimmer'],
  [/child|kids|çocuk|dziec|детск|дитяч|copii|أطفال/i, 'kinderzimmer'],
  [/office|study|ofis|çalışma odası|biur|gabinet|кабинет|кабінет|birou|مكتب/i, 'büro'],
  [/hallway|corridor|koridor|korytarz|прихож|коридор|передпок|\bhol\b|ممر/i, 'flur'],
  [/basement|cellar|bodrum|piwnic|подвал|підвал|subsol|قبو/i, 'keller'],
  [/garage|garaj|garaż|гараж|مرآب/i, 'garage'],
  [/balcony|balkon|балкон|balcon|شرفة/i, 'balkon'],
  [/attic|loft|çatı katı|poddasz|чердак|мансард|горищ|mansardă|علية/i, 'dachboden']
];
function nachDeutsch(text) {
  if (spr() === 'de') return text;
  let t = ' ' + text.toLowerCase() + ' ';
  const gefunden = [];
  BEFEHL_WOERTER.forEach(([re, de]) => { if (re.test(t)) { gefunden.push(de); t = t.replace(re, ' '); } });
  const zahlen = (text.match(/\d+([.,]\d+)?/g) || []).join(' mal ');
  return (gefunden.join(' ') + (zahlen ? ' ' + zahlen : '')).trim() || text;
}

/* Oberfläche übersetzen (nach jedem Bildaufbau) */
function oberflaecheUebersetzen() {
  const l = spr(), info = SPRACHEN.find((s) => s[0] === l) || SPRACHEN[0];
  document.documentElement.lang = l;
  document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, { acceptNode: (n) => n.parentElement && !n.parentElement.closest('script,style,textarea,.as-verlauf') && n.nodeValue.trim() ? 1 : 2 });
  const knoten = []; while (w.nextNode()) knoten.push(w.currentNode);
  // Original (Deutsch) merken → Zurückschalten auf Deutsch funktioniert ohne Neuladen
  knoten.forEach((n) => { if (n.__de == null) n.__de = n.nodeValue; const neu = TT(n.__de); if (neu !== n.nodeValue) n.nodeValue = neu; });
  document.querySelectorAll('[placeholder],[aria-label]').forEach((e) => {
    ['placeholder', 'aria-label'].forEach((a) => { const k = 'de' + a; if (e.dataset[k.replace('-', '')] == null && e.getAttribute(a)) e.dataset[k.replace('-', '')] = e.getAttribute(a); const v = e.dataset[k.replace('-', '')]; if (v) e.setAttribute(a, WB[v] ? T(v) : v); });
  });
}

/* Auswahl-Leiste (Startseite + Mehr) */
function sprachWahl() {
  return `<div class="sprach-wahl" role="group" aria-label="Sprache">${SPRACHEN.map(([k, n]) => `<button class="sprach-chip ${spr() === k ? 'an' : ''}" data-akt="sprache" data-l="${k}" lang="${k}">${n}</button>`).join('')}</div>`;
}
AKT.sprache = (d) => {
  S.einstellungen.sprache = d.l; speichern();
  render();
  sprich(T('Sprache gewechselt: Deutsch'), true, sprBcp());
};
HILFE.sprache = 'Sprache wählen. Menüs, Ansagen und Sprachbefehle laufen dann in dieser Sprache.';

/* in Startseite und Mehr einhängen + nach jedem Aufbau übersetzen */
const vorSprachenRender = render;
render = function () {
  vorSprachenRender();
  const app = document.getElementById('app') || document.querySelector('main') || document.body;
  if ((PFAD === '#/' || PFAD === '' || PFAD === '#/mehr') && !document.querySelector('.sprach-wahl')) {
    const kopfEl = app.querySelector('header.kopf');
    if (kopfEl) kopfEl.insertAdjacentHTML('afterend', sprachWahl());
  }
  oberflaecheUebersetzen();
};
oberflaecheUebersetzen();
