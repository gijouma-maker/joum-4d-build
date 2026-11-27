/* Joum 4D Build – Sprachen: Oberfläche, Vorlesen und Sprachbefehle in der gewählten Sprache.
   Offline über ein eingebautes Wörterbuch (Menüs, Startseite, Räume, Knöpfe, Ansagen).
   Lange Anleitungstexte bleiben vorerst Deutsch → volle Übersetzung über Server (siehe SERVER-CHECKLISTE). */

const SPRACHEN = [
  ['de', 'Deutsch', 'de-DE'], ['en', 'English', 'en-US'], ['tr', 'Türkçe', 'tr-TR'], ['ar', 'العربية', 'ar-SA'],
  ['pl', 'Polski', 'pl-PL'], ['ru', 'Русский', 'ru-RU'], ['uk', 'Українська', 'uk-UA'], ['ro', 'Română', 'ro-RO'],
  ['nl',  'Nederlands',  'nl-NL'],
  ['fr',  'Français',  'fr-FR'],
  ['it',  'Italiano',  'it-IT'],
  ['es',  'Español',  'es-ES'],
  ['pt',  'Português',  'pt-PT'],
  ['sv',  'Svenska',  'sv-SE'],
  ['da',  'Dansk',  'da-DK'],
  ['nb',  'Norsk',  'nb-NO'],
  ['fi',  'Suomi',  'fi-FI'],
  ['cs',  'Čeština',  'cs-CZ'],
  ['sk',  'Slovenčina',  'sk-SK'],
  ['hu',  'Magyar',  'hu-HU'],
  ['el',  'Ελληνικά',  'el-GR'],
  ['hr',  'Hrvatski',  'hr-HR'],
  ['sq',  'Shqip',  'sq-AL'],
  ['fa',  'فارسی',  'fa-IR']
];
const RTL = ['ar', 'fa'];
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
const WB = {};   // WB['Deutsch'] = { en: …, tr: …, … }
const ALT8 = ['de', 'en', 'tr', 'ar', 'pl', 'ru', 'uk', 'ro'];
WB_ROH.split('\n').forEach((z) => { const t = z.split('|'); if (t.length === 8) { WB[t[0]] = {}; ALT8.forEach((k, i) => { WB[t[0]][k] = t[i]; }); } });
/* weitere Sprachen (Kern-Wortschatz; was fehlt, kommt auf Englisch) */
const WB_NEU = {
  "Start": {"nl": "Start", "fr": "Accueil", "it": "Home", "es": "Inicio", "pt": "Início", "sv": "Start", "da": "Start", "nb": "Start", "fi": "Alku", "cs": "Domů", "sk": "Domov", "hu": "Kezdőlap", "el": "Αρχική", "hr": "Početna", "sq": "Kreu", "fa": "خانه"},
  "Projekte": {"nl": "Projecten", "fr": "Projets", "it": "Progetti", "es": "Proyectos", "pt": "Projetos", "sv": "Projekt", "da": "Projekter", "nb": "Prosjekter", "fi": "Projektit", "cs": "Projekty", "sk": "Projekty", "hu": "Projektek", "el": "Έργα", "hr": "Projekti", "sq": "Projektet", "fa": "پروژه‌ها"},
  "Garten 4D": {"nl": "Tuin 4D", "fr": "Jardin 4D", "it": "Giardino 4D", "es": "Jardín 4D", "pt": "Jardim 4D", "sv": "Trädgård 4D", "da": "Have 4D", "nb": "Hage 4D", "fi": "Puutarha 4D", "cs": "Zahrada 4D", "sk": "Záhrada 4D", "hu": "Kert 4D", "el": "Κήπος 4D", "hr": "Vrt 4D", "sq": "Kopshti 4D", "fa": "باغ 4D"},
  "Profi": {"nl": "Vakman", "fr": "Artisan", "it": "Artigiano", "es": "Profesional", "pt": "Profissional", "sv": "Hantverkare", "da": "Håndværker", "nb": "Håndverker", "fi": "Ammattilainen", "cs": "Řemeslník", "sk": "Remeselník", "hu": "Szakember", "el": "Τεχνίτης", "hr": "Majstor", "sq": "Mjeshtër", "fa": "متخصص"},
  "Mehr": {"nl": "Meer", "fr": "Plus", "it": "Altro", "es": "Más", "pt": "Mais", "sv": "Mer", "da": "Mere", "nb": "Mer", "fi": "Lisää", "cs": "Více", "sk": "Viac", "hu": "Több", "el": "Περισσότερα", "hr": "Više", "sq": "Më shumë", "fa": "بیشتر"},
  "Plan. Bau. Fertig.": {"nl": "Plan. Bouw. Klaar.", "fr": "Planifier. Construire. Terminé.", "it": "Pianifica. Costruisci. Fatto.", "es": "Planifica. Construye. Listo.", "pt": "Planeia. Constrói. Pronto.", "sv": "Planera. Bygg. Klart.", "da": "Planlæg. Byg. Færdig.", "nb": "Planlegg. Bygg. Ferdig.", "fi": "Suunnittele. Rakenna. Valmis.", "cs": "Plánuj. Stav. Hotovo.", "sk": "Plánuj. Stavaj. Hotovo.", "hu": "Tervezz. Építs. Kész.", "el": "Σχέδιο. Κατασκευή. Έτοιμο.", "hr": "Planiraj. Gradi. Gotovo.", "sq": "Planifiko. Ndërto. Gati.", "fa": "برنامه‌ریزی. ساخت. تمام."},
  "Assistent": {"nl": "Assistent", "fr": "Assistant", "it": "Assistente", "es": "Asistente", "pt": "Assistente", "sv": "Assistent", "da": "Assistent", "nb": "Assistent", "fi": "Avustaja", "cs": "Asistent", "sk": "Asistent", "hu": "Asszisztens", "el": "Βοηθός", "hr": "Asistent", "sq": "Asistenti", "fa": "دستیار"},
  "Gestalten 3D": {"nl": "Ontwerpen 3D", "fr": "Design 3D", "it": "Design 3D", "es": "Diseño 3D", "pt": "Design 3D", "sv": "Design 3D", "da": "Design 3D", "nb": "Design 3D", "fi": "Suunnittelu 3D", "cs": "Návrh 3D", "sk": "Návrh 3D", "hu": "Tervezés 3D", "el": "Σχεδίαση 3D", "hr": "Dizajn 3D", "sq": "Dizajn 3D", "fa": "طراحی سه‌بعدی"},
  "Einkauf": {"nl": "Boodschappen", "fr": "Courses", "it": "Spesa", "es": "Compras", "pt": "Compras", "sv": "Inköp", "da": "Indkøb", "nb": "Innkjøp", "fi": "Ostokset", "cs": "Nákup", "sk": "Nákup", "hu": "Bevásárlás", "el": "Αγορές", "hr": "Kupovina", "sq": "Blerjet", "fa": "خرید"},
  "Rechner": {"nl": "Rekenhulp", "fr": "Calculatrice", "it": "Calcolatrice", "es": "Calculadora", "pt": "Calculadora", "sv": "Kalkylator", "da": "Lommeregner", "nb": "Kalkulator", "fi": "Laskin", "cs": "Kalkulačka", "sk": "Kalkulačka", "hu": "Számológép", "el": "Αριθμομηχανή", "hr": "Kalkulator", "sq": "Kalkulatori", "fa": "ماشین‌حساب"},
  "Finanzen": {"nl": "Financiën", "fr": "Finances", "it": "Finanze", "es": "Finanzas", "pt": "Finanças", "sv": "Ekonomi", "da": "Økonomi", "nb": "Økonomi", "fi": "Talous", "cs": "Finance", "sk": "Financie", "hu": "Pénzügyek", "el": "Οικονομικά", "hr": "Financije", "sq": "Financat", "fa": "امور مالی"},
  "Kino-Tour": {"nl": "Bioscooptour", "fr": "Visite cinéma", "it": "Tour cinema", "es": "Tour de cine", "pt": "Tour de cinema", "sv": "Biotur", "da": "Biograftur", "nb": "Kinotur", "fi": "Elokuvakierros", "cs": "Kino prohlídka", "sk": "Kino prehliadka", "hu": "Mozitúra", "el": "Κινηματογραφική περιήγηση", "hr": "Kino obilazak", "sq": "Tur kinemaje", "fa": "تور سینمایی"},
  "Aktives Projekt": {"nl": "Actief project", "fr": "Projet actif", "it": "Progetto attivo", "es": "Proyecto activo", "pt": "Projeto ativo", "sv": "Aktivt projekt", "da": "Aktivt projekt", "nb": "Aktivt prosjekt", "fi": "Aktiivinen projekti", "cs": "Aktivní projekt", "sk": "Aktívny projekt", "hu": "Aktív projekt", "el": "Ενεργό έργο", "hr": "Aktivni projekt", "sq": "Projekti aktiv", "fa": "پروژه فعال"},
  "Nächster Schritt": {"nl": "Volgende stap", "fr": "Étape suivante", "it": "Prossimo passo", "es": "Siguiente paso", "pt": "Próximo passo", "sv": "Nästa steg", "da": "Næste trin", "nb": "Neste steg", "fi": "Seuraava vaihe", "cs": "Další krok", "sk": "Ďalší krok", "hu": "Következő lépés", "el": "Επόμενο βήμα", "hr": "Sljedeći korak", "sq": "Hapi tjetër", "fa": "مرحله بعد"},
  "Projekt öffnen": {"nl": "Project openen", "fr": "Ouvrir le projet", "it": "Apri progetto", "es": "Abrir proyecto", "pt": "Abrir projeto", "sv": "Öppna projekt", "da": "Åbn projekt", "nb": "Åpne prosjekt", "fi": "Avaa projekti", "cs": "Otevřít projekt", "sk": "Otvoriť projekt", "hu": "Projekt megnyitása", "el": "Άνοιγμα έργου", "hr": "Otvori projekt", "sq": "Hap projektin", "fa": "باز کردن پروژه"},
  "▶ 4D-Bauablauf": {"nl": "▶ 4D-bouwvolgorde", "fr": "▶ Étapes du chantier 4D", "it": "▶ Fasi del cantiere 4D", "es": "▶ Fases de obra 4D", "pt": "▶ Etapas da obra 4D", "sv": "▶ Byggordning 4D", "da": "▶ Byggeforløb 4D", "nb": "▶ Byggerekkefølge 4D", "fi": "▶ Rakennusvaiheet 4D", "cs": "▶ Průběh stavby 4D", "sk": "▶ Priebeh stavby 4D", "hu": "▶ Építési sorrend 4D", "el": "▶ Στάδια κατασκευής 4D", "hr": "▶ Tijek gradnje 4D", "sq": "▶ Fazat e ndërtimit 4D", "fa": "▶ مراحل ساخت 4D"},
  "Projekt starten": {"nl": "Project starten", "fr": "Démarrer le projet", "it": "Avvia progetto", "es": "Empezar proyecto", "pt": "Iniciar projeto", "sv": "Starta projekt", "da": "Start projekt", "nb": "Start prosjekt", "fi": "Aloita projekti", "cs": "Začít projekt", "sk": "Začať projekt", "hu": "Projekt indítása", "el": "Έναρξη έργου", "hr": "Pokreni projekt", "sq": "Fillo projektin", "fa": "شروع پروژه"},
  "Innen": {"nl": "Binnen", "fr": "Intérieur", "it": "Interno", "es": "Interior", "pt": "Interior", "sv": "Inne", "da": "Inde", "nb": "Inne", "fi": "Sisällä", "cs": "Uvnitř", "sk": "Vnútri", "hu": "Belül", "el": "Εσωτερικό", "hr": "Unutra", "sq": "Brenda", "fa": "داخل"},
  "Haus außen": {"nl": "Huis buiten", "fr": "Extérieur", "it": "Esterno casa", "es": "Exterior de la casa", "pt": "Exterior da casa", "sv": "Huset utvändigt", "da": "Huset udvendigt", "nb": "Huset utvendig", "fi": "Talon ulkopuoli", "cs": "Exteriér domu", "sk": "Exteriér domu", "hu": "Ház kívül", "el": "Εξωτερικό σπιτιού", "hr": "Vanjski dio kuće", "sq": "Jashtë shtëpisë", "fa": "بیرون خانه"},
  "Garten": {"nl": "Tuin", "fr": "Jardin", "it": "Giardino", "es": "Jardín", "pt": "Jardim", "sv": "Trädgård", "da": "Have", "nb": "Hage", "fi": "Puutarha", "cs": "Zahrada", "sk": "Záhrada", "hu": "Kert", "el": "Κήπος", "hr": "Vrt", "sq": "Kopshti", "fa": "باغ"},
  "Was jetzt?": {"nl": "Wat nu?", "fr": "Et maintenant ?", "it": "E adesso?", "es": "¿Y ahora qué?", "pt": "E agora?", "sv": "Vad nu?", "da": "Hvad nu?", "nb": "Hva nå?", "fi": "Mitä nyt?", "cs": "Co teď?", "sk": "Čo teraz?", "hu": "Most mi jön?", "el": "Τι τώρα;", "hr": "Što sada?", "sq": "Po tani?", "fa": "حالا چه؟"},
  "Vorlesen": {"nl": "Voorlezen", "fr": "Lire à voix haute", "it": "Leggi ad alta voce", "es": "Leer en voz alta", "pt": "Ler em voz alta", "sv": "Läs upp", "da": "Læs op", "nb": "Les opp", "fi": "Lue ääneen", "cs": "Číst nahlas", "sk": "Čítať nahlas", "hu": "Felolvasás", "el": "Ανάγνωση φωναχτά", "hr": "Čitaj naglas", "sq": "Lexo me zë", "fa": "بلند خواندن"},
  "Abbrechen": {"nl": "Annuleren", "fr": "Annuler", "it": "Annulla", "es": "Cancelar", "pt": "Cancelar", "sv": "Avbryt", "da": "Annuller", "nb": "Avbryt", "fi": "Peruuta", "cs": "Zrušit", "sk": "Zrušiť", "hu": "Mégse", "el": "Ακύρωση", "hr": "Odustani", "sq": "Anulo", "fa": "لغو"},
  "Los": {"nl": "Start", "fr": "Go", "it": "Vai", "es": "Ir", "pt": "Ir", "sv": "Kör", "da": "Start", "nb": "Kjør", "fi": "Aloita", "cs": "Spustit", "sk": "Spustiť", "hu": "Indítás", "el": "Πάμε", "hr": "Kreni", "sq": "Shko", "fa": "برو"},
  "Speichern": {"nl": "Opslaan", "fr": "Enregistrer", "it": "Salva", "es": "Guardar", "pt": "Guardar", "sv": "Spara", "da": "Gem", "nb": "Lagre", "fi": "Tallenna", "cs": "Uložit", "sk": "Uložiť", "hu": "Mentés", "el": "Αποθήκευση", "hr": "Spremi", "sq": "Ruaj", "fa": "ذخیره"},
  "Zurück": {"nl": "Terug", "fr": "Retour", "it": "Indietro", "es": "Atrás", "pt": "Voltar", "sv": "Tillbaka", "da": "Tilbage", "nb": "Tilbake", "fi": "Takaisin", "cs": "Zpět", "sk": "Späť", "hu": "Vissza", "el": "Πίσω", "hr": "Natrag", "sq": "Prapa", "fa": "بازگشت"},
  "Weiter": {"nl": "Verder", "fr": "Suivant", "it": "Avanti", "es": "Siguiente", "pt": "Seguinte", "sv": "Nästa", "da": "Næste", "nb": "Neste", "fi": "Seuraava", "cs": "Další", "sk": "Ďalej", "hu": "Tovább", "el": "Επόμενο", "hr": "Dalje", "sq": "Tjetër", "fa": "بعدی"},
  "Fertig": {"nl": "Klaar", "fr": "Terminé", "it": "Fatto", "es": "Listo", "pt": "Pronto", "sv": "Klart", "da": "Færdig", "nb": "Ferdig", "fi": "Valmis", "cs": "Hotovo", "sk": "Hotovo", "hu": "Kész", "el": "Έτοιμο", "hr": "Gotovo", "sq": "Gati", "fa": "تمام"},
  "+ Projekt": {"nl": "+ Project", "fr": "+ Projet", "it": "+ Progetto", "es": "+ Proyecto", "pt": "+ Projeto", "sv": "+ Projekt", "da": "+ Projekt", "nb": "+ Prosjekt", "fi": "+ Projekti", "cs": "+ Projekt", "sk": "+ Projekt", "hu": "+ Projekt", "el": "+ Έργο", "hr": "+ Projekt", "sq": "+ Projekt", "fa": "+ پروژه"},
  "Wohnzimmer": {"nl": "Woonkamer", "fr": "Salon", "it": "Soggiorno", "es": "Salón", "pt": "Sala de estar", "sv": "Vardagsrum", "da": "Stue", "nb": "Stue", "fi": "Olohuone", "cs": "Obývací pokoj", "sk": "Obývačka", "hu": "Nappali", "el": "Σαλόνι", "hr": "Dnevni boravak", "sq": "Dhoma e ndenjes", "fa": "اتاق نشیمن"},
  "Esszimmer": {"nl": "Eetkamer", "fr": "Salle à manger", "it": "Sala da pranzo", "es": "Comedor", "pt": "Sala de jantar", "sv": "Matsal", "da": "Spisestue", "nb": "Spisestue", "fi": "Ruokailuhuone", "cs": "Jídelna", "sk": "Jedáleň", "hu": "Étkező", "el": "Τραπεζαρία", "hr": "Blagovaonica", "sq": "Dhoma e ngrënies", "fa": "اتاق غذاخوری"},
  "Küche": {"nl": "Keuken", "fr": "Cuisine", "it": "Cucina", "es": "Cocina", "pt": "Cozinha", "sv": "Kök", "da": "Køkken", "nb": "Kjøkken", "fi": "Keittiö", "cs": "Kuchyně", "sk": "Kuchyňa", "hu": "Konyha", "el": "Κουζίνα", "hr": "Kuhinja", "sq": "Kuzhina", "fa": "آشپزخانه"},
  "Badezimmer": {"nl": "Badkamer", "fr": "Salle de bain", "it": "Bagno", "es": "Baño", "pt": "Casa de banho", "sv": "Badrum", "da": "Badeværelse", "nb": "Bad", "fi": "Kylpyhuone", "cs": "Koupelna", "sk": "Kúpeľňa", "hu": "Fürdőszoba", "el": "Μπάνιο", "hr": "Kupaonica", "sq": "Banjo", "fa": "حمام"},
  "Schlafzimmer": {"nl": "Slaapkamer", "fr": "Chambre", "it": "Camera da letto", "es": "Dormitorio", "pt": "Quarto", "sv": "Sovrum", "da": "Soveværelse", "nb": "Soverom", "fi": "Makuuhuone", "cs": "Ložnice", "sk": "Spálňa", "hu": "Hálószoba", "el": "Υπνοδωμάτιο", "hr": "Spavaća soba", "sq": "Dhoma e gjumit", "fa": "اتاق خواب"},
  "Kinderzimmer": {"nl": "Kinderkamer", "fr": "Chambre d'enfant", "it": "Cameretta", "es": "Habitación infantil", "pt": "Quarto das crianças", "sv": "Barnrum", "da": "Børneværelse", "nb": "Barnerom", "fi": "Lastenhuone", "cs": "Dětský pokoj", "sk": "Detská izba", "hu": "Gyerekszoba", "el": "Παιδικό δωμάτιο", "hr": "Dječja soba", "sq": "Dhoma e fëmijëve", "fa": "اتاق کودک"},
  "Keller": {"nl": "Kelder", "fr": "Cave", "it": "Cantina", "es": "Sótano", "pt": "Cave", "sv": "Källare", "da": "Kælder", "nb": "Kjeller", "fi": "Kellari", "cs": "Sklep", "sk": "Pivnica", "hu": "Pince", "el": "Υπόγειο", "hr": "Podrum", "sq": "Bodrumi", "fa": "زیرزمین"},
  "Dach": {"nl": "Dak", "fr": "Toit", "it": "Tetto", "es": "Tejado", "pt": "Telhado", "sv": "Tak", "da": "Tag", "nb": "Tak", "fi": "Katto", "cs": "Střecha", "sk": "Strecha", "hu": "Tető", "el": "Στέγη", "hr": "Krov", "sq": "Çatia", "fa": "بام"},
  "Sprache": {"nl": "Taal", "fr": "Langue", "it": "Lingua", "es": "Idioma", "pt": "Idioma", "sv": "Språk", "da": "Sprog", "nb": "Språk", "fi": "Kieli", "cs": "Jazyk", "sk": "Jazyk", "hu": "Nyelv", "el": "Γλώσσα", "hr": "Jezik", "sq": "Gjuha", "fa": "زبان"},
  "Tippe auf den blinkenden Knopf": {"nl": "Tik op de knipperende knop", "fr": "Appuie sur le bouton qui clignote", "it": "Tocca il pulsante che lampeggia", "es": "Toca el botón que parpadea", "pt": "Toca no botão a piscar", "sv": "Tryck på knappen som blinkar", "da": "Tryk på knappen, der blinker", "nb": "Trykk på knappen som blinker", "fi": "Napauta vilkkuvaa painiketta", "cs": "Klepni na blikající tlačítko", "sk": "Ťukni na blikajúce tlačidlo", "hu": "Koppints a villogó gombra", "el": "Πάτησε το κουμπί που αναβοσβήνει", "hr": "Dodirni gumb koji treperi", "sq": "Prek butonin që pulson", "fa": "روی دکمه چشمک‌زن بزن"},
  "Ich höre zu …": {"nl": "Ik luister …", "fr": "J'écoute …", "it": "Ti ascolto …", "es": "Te escucho …", "pt": "Estou a ouvir …", "sv": "Jag lyssnar …", "da": "Jeg lytter …", "nb": "Jeg lytter …", "fi": "Kuuntelen …", "cs": "Poslouchám …", "sk": "Počúvam …", "hu": "Figyelek …", "el": "Σε ακούω …", "hr": "Slušam …", "sq": "Po dëgjoj …", "fa": "گوش می‌دهم …"},
  "Hier ist": {"nl": "Hier is", "fr": "Voici", "it": "Ecco", "es": "Aquí está", "pt": "Aqui está", "sv": "Här är", "da": "Her er", "nb": "Her er", "fi": "Tässä on", "cs": "Tady je", "sk": "Tu je", "hu": "Itt van", "el": "Εδώ είναι", "hr": "Evo", "sq": "Ja", "fa": "اینجا"},
  "Sprache gewechselt: Deutsch": {"nl": "Taal gewijzigd: Nederlands", "fr": "Langue changée : français", "it": "Lingua cambiata: italiano", "es": "Idioma cambiado: español", "pt": "Idioma alterado: português", "sv": "Språk ändrat: svenska", "da": "Sprog ændret: dansk", "nb": "Språk endret: norsk", "fi": "Kieli vaihdettu: suomi", "cs": "Jazyk změněn: čeština", "sk": "Jazyk zmenený: slovenčina", "hu": "Nyelv módosítva: magyar", "el": "Η γλώσσα άλλαξε: ελληνικά", "hr": "Jezik promijenjen: hrvatski", "sq": "Gjuha u ndryshua: shqip", "fa": "زبان تغییر کرد: فارسی"},
  "Was möchtest du tun?": {"nl": "Wat wil je doen?", "fr": "Que veux-tu faire ?", "it": "Cosa vuoi fare?", "es": "¿Qué quieres hacer?", "pt": "O que queres fazer?", "sv": "Vad vill du göra?", "da": "Hvad vil du gøre?", "nb": "Hva vil du gjøre?", "fi": "Mitä haluat tehdä?", "cs": "Co chceš udělat?", "sk": "Čo chceš urobiť?", "hu": "Mit szeretnél csinálni?", "el": "Τι θέλεις να κάνεις;", "hr": "Što želiš napraviti?", "sq": "Çfarë dëshiron të bësh?", "fa": "چه کاری می‌خواهی انجام دهی؟"},
  "Befehl eintippen": {"nl": "Typ een opdracht", "fr": "Saisir une commande", "it": "Scrivi un comando", "es": "Escribe una orden", "pt": "Escreve um comando", "sv": "Skriv ett kommando", "da": "Skriv en kommando", "nb": "Skriv en kommando", "fi": "Kirjoita komento", "cs": "Napiš příkaz", "sk": "Napíš príkaz", "hu": "Írj be egy parancsot", "el": "Γράψε μια εντολή", "hr": "Upiši naredbu", "sq": "Shkruaj një komandë", "fa": "یک فرمان بنویس"},
  "Du kannst zum Beispiel sagen:": {"nl": "Je kunt bijvoorbeeld zeggen:", "fr": "Tu peux dire par exemple :", "it": "Puoi dire per esempio:", "es": "Puedes decir por ejemplo:", "pt": "Podes dizer por exemplo:", "sv": "Du kan till exempel säga:", "da": "Du kan for eksempel sige:", "nb": "Du kan for eksempel si:", "fi": "Voit sanoa esimerkiksi:", "cs": "Můžeš říct například:", "sk": "Môžeš povedať napríklad:", "hu": "Mondhatod például:", "el": "Μπορείς να πεις για παράδειγμα:", "hr": "Možeš reći na primjer:", "sq": "Mund të thuash për shembull:", "fa": "مثلاً می‌توانی بگویی:"},
  "Nicht verstanden – bitte nochmal": {"nl": "Niet begrepen – probeer opnieuw", "fr": "Pas compris – réessaie", "it": "Non ho capito – riprova", "es": "No entendido – inténtalo de nuevo", "pt": "Não percebi – tenta de novo", "sv": "Förstod inte – försök igen", "da": "Ikke forstået – prøv igen", "nb": "Forsto ikke – prøv igjen", "fi": "En ymmärtänyt – yritä uudelleen", "cs": "Nerozuměl jsem – zkus to znovu", "sk": "Nerozumel som – skús znova", "hu": "Nem értettem – próbáld újra", "el": "Δεν κατάλαβα – δοκίμασε ξανά", "hr": "Nisam razumio – pokušaj ponovno", "sq": "Nuk u kuptua – provo përsëri", "fa": "متوجه نشدم – دوباره امتحان کن"},
  "Planungs-Assistent": {"nl": "Planningsassistent", "fr": "Assistant de planification", "it": "Assistente di progettazione", "es": "Asistente de planificación", "pt": "Assistente de planeamento", "sv": "Planeringsassistent", "da": "Planlægningsassistent", "nb": "Planleggingsassistent", "fi": "Suunnitteluavustaja", "cs": "Plánovací asistent", "sk": "Plánovací asistent", "hu": "Tervezési asszisztens", "el": "Βοηθός σχεδιασμού", "hr": "Asistent za planiranje", "sq": "Asistenti i planifikimit", "fa": "دستیار برنامه‌ریزی"},
  "Gartenplaner 4D": {"nl": "Tuinplanner 4D", "fr": "Planificateur de jardin 4D", "it": "Progettista giardino 4D", "es": "Planificador de jardín 4D", "pt": "Planeador de jardim 4D", "sv": "Trädgårdsplanerare 4D", "da": "Haveplanlægger 4D", "nb": "Hageplanlegger 4D", "fi": "Puutarhasuunnittelija 4D", "cs": "Plánovač zahrady 4D", "sk": "Plánovač záhrady 4D", "hu": "Kerttervező 4D", "el": "Σχεδιαστής κήπου 4D", "hr": "Planer vrta 4D", "sq": "Planifikuesi i kopshtit 4D", "fa": "برنامه‌ریز باغ 4D"},
  "Wasser, Abwasser & Elektro": {"nl": "Water, afvoer & elektra", "fr": "Eau, évacuation & électricité", "it": "Acqua, scarichi ed elettricità", "es": "Agua, desagüe y electricidad", "pt": "Água, esgoto e eletricidade", "sv": "Vatten, avlopp & el", "da": "Vand, afløb & el", "nb": "Vann, avløp og elektro", "fi": "Vesi, viemäri ja sähkö", "cs": "Voda, odpad a elektřina", "sk": "Voda, odpad a elektrina", "hu": "Víz, szennyvíz és villany", "el": "Νερό, αποχέτευση & ηλεκτρικά", "hr": "Voda, odvodnja i struja", "sq": "Ujë, kanalizim dhe elektrikë", "fa": "آب، فاضلاب و برق"},
  "Messen": {"nl": "Meten", "fr": "Mesurer", "it": "Misurare", "es": "Medir", "pt": "Medir", "sv": "Mäta", "da": "Måle", "nb": "Måle", "fi": "Mittaa", "cs": "Měření", "sk": "Meranie", "hu": "Mérés", "el": "Μέτρηση", "hr": "Mjerenje", "sq": "Matje", "fa": "اندازه‌گیری"},
  "Weitere Projekte": {"nl": "Meer projecten", "fr": "Autres projets", "it": "Altri progetti", "es": "Más proyectos", "pt": "Mais projetos", "sv": "Fler projekt", "da": "Flere projekter", "nb": "Flere prosjekter", "fi": "Muut projektit", "cs": "Další projekty", "sk": "Ďalšie projekty", "hu": "További projektek", "el": "Άλλα έργα", "hr": "Ostali projekti", "sq": "Projekte të tjera", "fa": "پروژه‌های دیگر"},
  "Willkommen bei Joum 4D Build": {"nl": "Welkom bij Joum 4D Build", "fr": "Bienvenue dans Joum 4D Build", "it": "Benvenuto in Joum 4D Build", "es": "Bienvenido a Joum 4D Build", "pt": "Bem-vindo ao Joum 4D Build", "sv": "Välkommen till Joum 4D Build", "da": "Velkommen til Joum 4D Build", "nb": "Velkommen til Joum 4D Build", "fi": "Tervetuloa Joum 4D Buildiin", "cs": "Vítej v Joum 4D Build", "sk": "Vitaj v Joum 4D Build", "hu": "Üdv a Joum 4D Buildben", "el": "Καλώς ήρθες στο Joum 4D Build", "hr": "Dobro došli u Joum 4D Build", "sq": "Mirë se vini në Joum 4D Build", "fa": "به Joum 4D Build خوش آمدید"},
  "Werkzeug": {"nl": "Gereedschap", "fr": "Outils", "it": "Attrezzi", "es": "Herramientas", "pt": "Ferramentas", "sv": "Verktyg", "da": "Værktøj", "nb": "Verktøy", "fi": "Työkalut", "cs": "Nářadí", "sk": "Náradie", "hu": "Szerszámok", "el": "Εργαλεία", "hr": "Alat", "sq": "Veglat", "fa": "ابزار"},
  "Garage / Carport": {"nl": "Garage / carport", "fr": "Garage / carport", "it": "Garage / tettoia", "es": "Garaje / cochera", "pt": "Garagem / telheiro", "sv": "Garage / carport", "da": "Garage / carport", "nb": "Garasje / carport", "fi": "Autotalli / katos", "cs": "Garáž / přístřešek", "sk": "Garáž / prístrešok", "hu": "Garázs / beálló", "el": "Γκαράζ / στέγαστρο", "hr": "Garaža / nadstrešnica", "sq": "Garazhi / strehë", "fa": "گاراژ / سایبان"},
  "Flur / Diele": {"nl": "Gang / hal", "fr": "Couloir / entrée", "it": "Corridoio / ingresso", "es": "Pasillo / recibidor", "pt": "Corredor / entrada", "sv": "Hall / entré", "da": "Gang / entré", "nb": "Gang / entré", "fi": "Eteinen / käytävä", "cs": "Chodba / předsíň", "sk": "Chodba / predsieň", "hu": "Folyosó / előszoba", "el": "Διάδρομος / χολ", "hr": "Hodnik / predsoblje", "sq": "Korridori / hyrja", "fa": "راهرو"}
};
WB_NEU["Plan. Bau. Fertig. – Wähle einen Raum, Haus außen oder Garten und leg dein erstes Projekt an."] = {"en": "Choose a room, the house exterior or the garden and create your first project.", "tr": "Bir oda, evin dışı veya bahçe seç ve ilk projeni oluştur.", "ar": "اختر غرفة أو خارج المنزل أو الحديقة وأنشئ مشروعك الأول.", "pl": "Wybierz pomieszczenie, zewnętrze domu lub ogród i utwórz pierwszy projekt.", "ru": "Выберите комнату, фасад или сад и создайте первый проект.", "uk": "Виберіть кімнату, фасад або сад і створіть перший проєкт.", "ro": "Alege o cameră, exteriorul casei sau grădina și creează primul proiect.", "nl": "Kies een kamer, de buitenkant van het huis of de tuin en maak je eerste project.", "fr": "Choisis une pièce, l'extérieur ou le jardin et crée ton premier projet.", "it": "Scegli una stanza, l’esterno della casa o il giardino e crea il tuo primo progetto.", "es": "Elige una habitación, el exterior de la casa o el jardín y crea tu primer proyecto.", "pt": "Escolhe uma divisão, o exterior da casa ou o jardim e cria o teu primeiro projeto.", "sv": "Välj ett rum, husets utsida eller trädgården och skapa ditt första projekt.", "da": "Vælg et rum, husets ydre eller haven og opret dit første projekt.", "nb": "Velg et rom, husets utside eller hagen og opprett ditt første prosjekt.", "fi": "Valitse huone, talon ulkopuoli tai puutarha ja luo ensimmäinen projektisi.", "cs": "Vyber místnost, exteriér domu nebo zahradu a založ svůj první projekt.", "sk": "Vyber miestnosť, exteriér domu alebo záhradu a založ svoj prvý projekt.", "hu": "Válassz egy helyiséget, a ház külsejét vagy a kertet, és hozd létre az első projektedet.", "el": "Διάλεξε ένα δωμάτιο, το εξωτερικό του σπιτιού ή τον κήπο και ξεκίνα το πρώτο σου έργο.", "hr": "Odaberi prostoriju, vanjski dio kuće ili vrt i napravi svoj prvi projekt.", "sq": "Zgjidh një dhomë, pjesën e jashtme të shtëpisë ose kopshtin dhe krijo projektin tënd të parë.", "fa": "یک اتاق، بیرون خانه یا باغ را انتخاب کن و اولین پروژه‌ات را بساز."};
Object.keys(WB_NEU).forEach((de) => { WB[de] = Object.assign(WB[de] || { de }, WB_NEU[de]); });

/* Beispiel-Befehle je Sprache (für Hilfe-Ansage) */
const BEISPIELE = {
  de: 'Ich will mein Bad fliesen. Quittung speichern. Wie geht es weiter? Garten planen.',
  en: 'I want to tile my bathroom. Save receipt. What next? Plan the garden.',
  tr: 'Banyomu fayanslamak istiyorum. Fişi kaydet. Sırada ne var? Bahçe planla.',
  ar: 'أريد تبليط الحمام. احفظ الإيصال. ما التالي؟ خطط الحديقة.',
  pl: 'Chcę położyć płytki w łazience. Zapisz paragon. Co dalej? Zaplanuj ogród.',
  ru: 'Хочу положить плитку в ванной. Сохранить чек. Что дальше? Спланировать сад.',
  uk: 'Хочу покласти плитку у ванній. Зберегти чек. Що далі? Спланувати сад.',
  ro: 'Vreau să pun faianță în baie. Salvează bonul. Ce urmează? Planifică grădina.',
  nl: "Ik wil mijn badkamer betegelen. Bon opslaan. Wat nu? Tuin plannen.",
  fr: "Je veux carreler ma salle de bain. Enregistrer le reçu. Et maintenant ? Planifier le jardin.",
  it: "Voglio piastrellare il bagno. Salva lo scontrino. E adesso? Progetta il giardino.",
  es: "Quiero alicatar el baño. Guardar el recibo. ¿Y ahora qué? Planificar el jardín.",
  pt: "Quero azulejar a casa de banho. Guardar o recibo. E agora? Planear o jardim.",
  sv: "Jag vill kakla badrummet. Spara kvittot. Vad nu? Planera trädgården.",
  da: "Jeg vil flise badeværelset. Gem kvitteringen. Hvad nu? Planlæg haven.",
  nb: "Jeg vil flislegge badet. Lagre kvitteringen. Hva nå? Planlegg hagen.",
  fi: "Haluan laatoittaa kylpyhuoneen. Tallenna kuitti. Mitä nyt? Suunnittele puutarha.",
  cs: "Chci obložit koupelnu. Uložit účtenku. Co teď? Naplánovat zahradu.",
  sk: "Chcem obložiť kúpeľňu. Uložiť bloček. Čo teraz? Naplánovať záhradu.",
  hu: "Csempézni szeretném a fürdőszobát. Nyugta mentése. Most mi jön? Kert tervezése.",
  el: "Θέλω πλακάκια στο μπάνιο. Αποθήκευση απόδειξης. Τι τώρα; Σχεδίασε τον κήπο.",
  hr: "Želim popločiti kupaonicu. Spremi račun. Što sada? Planiraj vrt.",
  sq: "Dua të shtroj pllaka në banjo. Ruaj faturën. Po tani? Planifiko kopshtin.",
  fa: "می‌خواهم حمام را کاشی کنم. رسید را ذخیره کن. حالا چه؟ باغ را برنامه‌ریزی کن."
};

/* Übersetzung + Sprache, in der sie tatsächlich vorliegt (Ersatz: Englisch, dann Deutsch) */
function TL(de) {
  const l = spr(); if (l === 'de' || de == null) return [de, 'de-DE'];
  const e = WB[de]; if (!e) return [de, 'de-DE'];
  if (e[l]) return [e[l], sprBcp()];
  return e.en ? [e.en, 'en-US'] : [de, 'de-DE'];
}
function T(de) { return TL(de)[0]; }
/* wie TT, liefert zusätzlich die Sprache für die Stimme */
function TTL(text) {
  const s = String(text).trim();
  if (spr() === 'de' || !s) return [text, 'de-DE'];
  if (WB[s]) { const [t, lg] = TL(s); return [text.replace(s, t), lg]; }
  return [TT(text), sprBcp()];
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
BEFEHL_WOERTER.push(
  [/log ?in|sign ?in|account|giriş|hesap|zaloguj|konto|войти|аккаунт|увійти|conect|connexion|accedi|iniciar sesión|entrar|logga in|kirjaudu|přihlás|prihlás|bejelentkez|σύνδεση|prijav|hyr|ورود|تسجيل الدخول/i, 'anmelden'],
  [/hulp|\baide\b|aiuto|ayuda|ajuda|hjälp|hjælp|hjelp|apua|nápověda|pomoc|segítség|βοήθεια|pomoć|ndihmë|کمک/i, 'hilfe'],
  [/wat nu|et maintenant|e adesso|y ahora|e agora|vad nu|hvad nu|hva nå|mitä nyt|co teď|čo teraz|most mi|τι τώρα|što sada|po tani|حالا چه|volgende stap|prochaine étape|prossimo passo|siguiente paso|próximo passo/i, 'wie geht es weiter'],
  [/accueil|inicio|início|startsida|forside|etusivu|domů|domov|kezdőlap|αρχική|početna|\bkreu\b|خانه/i, 'startseite'],
  [/kassabon|\bbon\b|bonnetje|reçu|ticket de caisse|scontrino|ricevuta|recibo|kvitto|kvittering|kuitti|účtenk|bloček|nyugta|blokk|απόδειξη|račun|fatur|رسید/i, 'quittung'],
  [/boodschappen|courses|spesa|compras|inköp|indkøb|innkjøp|ostokset|nákup|bevásárl|αγορές|kupovin|blerje|خرید/i, 'einkaufsliste'],
  [/meten|mesurer|misur|medir|mäta|måle|mittaa|měř|meran|mérés|mérni|μέτρη|mjeren|matje|mat\b|اندازه/i, 'messen'],
  [/plattegrond|planimetria|planritning|plantegning|pohjapiirros|půdorys|pôdorys|alaprajz|κάτοψη|tlocrt|نقشه/i, 'grundriss'],
  [/\btuin|jardin|giardin|jardín|jardim|trädgård|\bhaven\b|\bhage|puutarha|zahrad|záhrad|\bkert|κήπ|\bvrt|kopsht|باغ/i, 'garten'],
  [/\beau\b|acqua|agua|água|vatten|\bvand\b|\bvann\b|\bvesi|víz|νερό|\bujë|آب/i, 'wasser'],
  [/stopcontact|électri|elettric|elétric|eléctric|eluttag|stikkontakt|pistorasia|zásuvk|konnektor|villany|πρίζα|utičnic|prizë|پریز|برق/i, 'steckdose'],
  [/gereedschap|outil|attrezz|herramienta|ferrament|verktyg|værktøj|verktøy|työkalu|nářadí|náradie|szerszám|εργαλεί|\balat|vegl|ابزار/i, 'werkzeug'],
  [/tegel|carrel|piastrell|alicat|azulej|kakel|kakla|flise|flislegg|laatoit|obklad|oblož|obkla|csempé|πλακάκ|pločic|popločit|pllak|کاشی/i, 'fliesen'],
  [/verven|schilder|peindre|peinture|dipinger|pittur|pintar|måla|maling|maalat|malovat|maľovať|festeni|βάψ|bojati|bojenje|lyej|رنگ/i, 'streichen'],
  [/kinderkamer|chambre d.enfant|cameretta|infantil|crianças|barnrum|børneværelse|barnerom|lastenhuone|dětský|detská|gyerekszob|παιδικό|dječj|fëmijë|کودک/i, 'kinderzimmer'],
  [/badkamer|salle de bain|bagno|baño|casa de banho|badrum|badeværelse|\bbadet\b|\bbad\b|kylpyhuone|koupeln|kúpeľ|fürdő|μπάνιο|kupaon|banjo/i, 'bad'],
  [/keuken|cuisine|cucina|cocina|cozinha|\bkök|køkken|kjøkken|keittiö|kuchyn|kuchyň|konyh|κουζίν|kuhinj|kuzhin|آشپزخانه/i, 'küche'],
  [/woonkamer|soggiorno|salón|sala de estar|vardagsrum|\bstue\b|olohuone|obývací|obývačk|nappali|σαλόνι|dnevni boravak|dhoma e ndenjes|نشیمن/i, 'wohnzimmer'],
  [/slaapkamer|chambre|camera da letto|dormitorio|quarto|sovrum|soveværelse|soverom|makuuhuone|ložnic|spáln|hálószob|υπνοδωμάτιο|spavać|dhoma e gjumit|اتاق خواب/i, 'schlafzimmer'],
  [/kelder|\bcave\b|cantina|sótano|källare|kælder|kjeller|kellari|sklep|pivnic|pince|υπόγειο|podrum|زیرزمین/i, 'keller'],
  [/\bdak\b|\btoit|tetto|tejado|telhado|\btaket|katto|střech|strech|tető|στέγη|\bkrov|çati|بام/i, 'dach'],
  [/terras|terrazz|terraz|terraço|altan|terassi|terasa|terasz|βεράντα|tarrac|ایوان/i, 'terrasse'],
  [/renover|rénov|ristruttur|reforma|renovar|renovera|remontoi|rekonstruk|felújít|ανακαίνιση|obnov|rinovim|بازسازی|nieuw project|nouveau projet|nuovo progetto|nuevo proyecto|novo projeto/i, 'projekt anlegen']
);
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
  document.documentElement.dir = RTL.includes(l) ? 'rtl' : 'ltr';
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
    const an = document.querySelector('.sprach-chip.an'); if (an && an.parentElement) an.parentElement.scrollLeft = an.offsetLeft - 16;
  }
  oberflaecheUebersetzen();
};
oberflaecheUebersetzen();
