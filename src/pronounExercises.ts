import { createOptions, tokenize } from './trainer';
import { Exercise, Topic } from './types';

export type PronounGroup =
  | 'ich'
  | 'du'
  | 'er'
  | 'sie-singular'
  | 'es'
  | 'wir'
  | 'ihr'
  | 'sie-plural'
  | 'sie-formal';

export type PronounCase = 'nominative' | 'accusative' | 'dative';

type PronounForms = {
  nominative: string;
  accusative: string;
  dative: string;
  russian: {
    nominative: string;
    accusative: string;
    dative: string;
  };
};

type Context = {
  russian: string;
  german: string;
};

type ExerciseSentence = {
  prompt: string;
  answer: string;
};

type NominalVerb = {
  german: string[];
  russian: string[];
  object: string;
  russianObject: string;
};

type SubjectTemplate = {
  russian: string;
  german: string;
  singularVerb: string;
  pluralVerb: string;
  russianVerb: string;
  russianVerbPlural: string;
  russianObject?: string;
  germanSuffix?: string;
  russianSuffix?: string;
  pluralSubject?: boolean;
};

const GROUPS: Record<PronounGroup, PronounForms> = {
  ich: {
    nominative: 'ich',
    accusative: 'mich',
    dative: 'mir',
    russian: { nominative: 'Я', accusative: 'меня', dative: 'мне' },
  },
  du: {
    nominative: 'du',
    accusative: 'dich',
    dative: 'dir',
    russian: { nominative: 'Ты', accusative: 'тебя', dative: 'тебе' },
  },
  er: {
    nominative: 'er',
    accusative: 'ihn',
    dative: 'ihm',
    russian: { nominative: 'Он', accusative: 'его', dative: 'ему' },
  },
  'sie-singular': {
    nominative: 'sie',
    accusative: 'sie',
    dative: 'ihr',
    russian: { nominative: 'Она', accusative: 'её', dative: 'ей' },
  },
  es: {
    nominative: 'es',
    accusative: 'es',
    dative: 'ihm',
    russian: { nominative: 'Оно', accusative: 'его', dative: 'ему' },
  },
  wir: {
    nominative: 'wir',
    accusative: 'uns',
    dative: 'uns',
    russian: { nominative: 'Мы', accusative: 'нас', dative: 'нам' },
  },
  ihr: {
    nominative: 'ihr',
    accusative: 'euch',
    dative: 'euch',
    russian: { nominative: 'Вы', accusative: 'вас', dative: 'вам' },
  },
  'sie-plural': {
    nominative: 'sie',
    accusative: 'sie',
    dative: 'ihnen',
    russian: { nominative: 'Они', accusative: 'их', dative: 'им' },
  },
  'sie-formal': {
    nominative: 'Sie',
    accusative: 'Sie',
    dative: 'Ihnen',
    russian: { nominative: 'Вы', accusative: 'Вас', dative: 'Вам' },
  },
};

const GROUP_LABELS: Record<PronounGroup, string> = {
  ich: 'я',
  du: 'ты',
  er: 'он',
  'sie-singular': 'она',
  es: 'оно',
  wir: 'мы',
  ihr: 'вы (неформальное)',
  'sie-plural': 'они',
  'sie-formal': 'Вы (вежливое)',
};

const CASE_LABELS: Record<PronounCase, string> = {
  nominative: 'Nominativ — именительный',
  accusative: 'Akkusativ — винительный',
  dative: 'Dativ — дательный',
};

const NOMINATIVE_VERBS: NominalVerb[] = [
  {
    german: ['lese', 'liest', 'liest', 'liest', 'lesen', 'lest', 'lesen', 'lesen'],
    russian: ['читаю', 'читаешь', 'читает', 'читает', 'читаем', 'читаете', 'читают', 'читаете'],
    object: 'den Bericht',
    russianObject: 'отчёт',
  },
  {
    german: ['höre', 'hörst', 'hört', 'hört', 'hören', 'hört', 'hören', 'hören'],
    russian: ['слушаю', 'слушаешь', 'слушает', 'слушает', 'слушаем', 'слушаете', 'слушают', 'слушаете'],
    object: 'die Nachrichten',
    russianObject: 'новости',
  },
  {
    german: ['beantworte', 'beantwortest', 'beantwortet', 'beantwortet', 'beantworten', 'beantwortet', 'beantworten', 'beantworten'],
    russian: ['отвечаю', 'отвечаешь', 'отвечает', 'отвечает', 'отвечаем', 'отвечаете', 'отвечают', 'отвечаете'],
    object: 'die Nachricht',
    russianObject: 'сообщение',
  },
  {
    german: ['öffne', 'öffnest', 'öffnet', 'öffnet', 'öffnen', 'öffnet', 'öffnen', 'öffnen'],
    russian: ['открываю', 'открываешь', 'открывает', 'открывает', 'открываем', 'открываете', 'открывают', 'открываете'],
    object: 'das Fenster',
    russianObject: 'окно',
  },
  {
    german: ['kaufe', 'kaufst', 'kauft', 'kauft', 'kaufen', 'kauft', 'kaufen', 'kaufen'],
    russian: ['покупаю', 'покупаешь', 'покупает', 'покупает', 'покупаем', 'покупаете', 'покупают', 'покупаете'],
    object: 'ein Ticket',
    russianObject: 'билет',
  },
  {
    german: ['bestelle', 'bestellst', 'bestellt', 'bestellt', 'bestellen', 'bestellt', 'bestellen', 'bestellen'],
    russian: ['заказываю', 'заказываешь', 'заказывает', 'заказывает', 'заказываем', 'заказываете', 'заказывают', 'заказываете'],
    object: 'einen Kaffee',
    russianObject: 'кофе',
  },
  {
    german: ['prüfe', 'prüfst', 'prüft', 'prüft', 'prüfen', 'prüft', 'prüfen', 'prüfen'],
    russian: ['проверяю', 'проверяешь', 'проверяет', 'проверяет', 'проверяем', 'проверяете', 'проверяют', 'проверяете'],
    object: 'die Rechnung',
    russianObject: 'счёт',
  },
  {
    german: ['schreibe', 'schreibst', 'schreibt', 'schreibt', 'schreiben', 'schreibt', 'schreiben', 'schreiben'],
    russian: ['пишу', 'пишешь', 'пишет', 'пишет', 'пишем', 'пишете', 'пишут', 'пишете'],
    object: 'eine E-Mail',
    russianObject: 'письмо',
  },
  {
    german: ['buche', 'buchst', 'bucht', 'bucht', 'buchen', 'bucht', 'buchen', 'buchen'],
    russian: ['бронирую', 'бронируешь', 'бронирует', 'бронирует', 'бронируем', 'бронируете', 'бронируют', 'бронируете'],
    object: 'ein Zimmer',
    russianObject: 'номер',
  },
  {
    german: ['hole', 'holst', 'holt', 'holt', 'holen', 'holt', 'holen', 'holen'],
    russian: ['забираю', 'забираешь', 'забирает', 'забирает', 'забираем', 'забираете', 'забирают', 'забираете'],
    object: 'das Paket',
    russianObject: 'посылку',
  },
];

const NOMINATIVE_CONTEXTS: Context[] = [
  { russian: 'утром', german: 'am Morgen' },
  { russian: 'после работы', german: 'nach der Arbeit' },
  { russian: 'в перерыве', german: 'in der Pause' },
];

const ES_NOMINATIVE: ExerciseSentence[] = [
  { prompt: 'Оно лежит рядом с дверью.', answer: 'Es liegt neben der Tür.' },
  { prompt: 'Оно лежит на столе.', answer: 'Es liegt auf dem Tisch.' },
  { prompt: 'Оно лежит в коробке.', answer: 'Es liegt in der Schachtel.' },
  { prompt: 'Оно стоит у входа.', answer: 'Es steht am Eingang.' },
  { prompt: 'Оно стоит перед домом.', answer: 'Es steht vor dem Haus.' },
  { prompt: 'Оно работает без проблем.', answer: 'Es funktioniert ohne Probleme.' },
  { prompt: 'Оно снова работает после ремонта.', answer: 'Es funktioniert nach der Reparatur wieder.' },
  { prompt: 'Оно остаётся открытым до вечера.', answer: 'Es bleibt bis zum Abend geöffnet.' },
  { prompt: 'Оно помещается в эту сумку.', answer: 'Es passt in diese Tasche.' },
  { prompt: 'Оно находится рядом с отелем.', answer: 'Es liegt neben dem Hotel.' },
  { prompt: 'Оно выглядит совершенно новым.', answer: 'Es sieht ganz neu aus.' },
  { prompt: 'Оно выглядит лучше после ремонта.', answer: 'Es sieht nach der Reparatur besser aus.' },
  { prompt: 'Оно начинается ровно в восемь.', answer: 'Es beginnt genau um acht Uhr.' },
  { prompt: 'Оно длится всего десять минут.', answer: 'Es dauert nur zehn Minuten.' },
  { prompt: 'Оно лежит в верхнем ящике.', answer: 'Es liegt in der oberen Schublade.' },
  { prompt: 'Оно стоит возле главного входа.', answer: 'Es steht am Haupteingang.' },
  { prompt: 'Оно работает только по выходным.', answer: 'Es funktioniert nur am Wochenende.' },
  { prompt: 'Оно остаётся закрытым до понедельника.', answer: 'Es bleibt bis Montag geschlossen.' },
  { prompt: 'Оно помещается в маленький рюкзак.', answer: 'Es passt in den kleinen Rucksack.' },
  { prompt: 'Оно находится на втором этаже.', answer: 'Es liegt im zweiten Stock.' },
  { prompt: 'Оно выглядит очень аккуратно после уборки.', answer: 'Es sieht nach dem Aufräumen sehr ordentlich aus.' },
  { prompt: 'Оно начинается после короткого перерыва.', answer: 'Es beginnt nach einer kurzen Pause.' },
  { prompt: 'Оно длится почти целый час.', answer: 'Es dauert fast eine ganze Stunde.' },
  { prompt: 'Оно лежит прямо перед вами.', answer: 'Es liegt direkt vor Ihnen.' },
  { prompt: 'Оно стоит в центре комнаты.', answer: 'Es steht mitten im Zimmer.' },
  { prompt: 'Оно работает сегодня до шести.', answer: 'Es funktioniert heute bis sechs Uhr.' },
  { prompt: 'Оно остаётся бесплатным для детей.', answer: 'Es bleibt für Kinder kostenlos.' },
  { prompt: 'Оно подходит для этой поездки.', answer: 'Es passt zu dieser Reise.' },
  { prompt: 'Оно принадлежит нашему отелю.', answer: 'Es gehört zu unserem Hotel.' },
  { prompt: 'Оно лежит на полке в коридоре.', answer: 'Es liegt im Regal im Flur.' },
];

const ACCUSATIVE_SUBJECTS: SubjectTemplate[] = [
  {
    russian: 'Преподаватель',
    german: 'Der Lehrer',
    singularVerb: 'sieht',
    pluralVerb: 'sehen',
    russianVerb: 'видит',
    russianVerbPlural: 'видят',
    russianObject: '',
    germanSuffix: '',
    russianSuffix: '',
  },
  {
    russian: 'Коллега',
    german: 'Die Kollegin',
    singularVerb: 'trifft',
    pluralVerb: 'treffen',
    russianVerb: 'встречает',
    russianVerbPlural: 'встречают',
    russianObject: '',
    germanSuffix: 'am Bahnhof',
    russianSuffix: 'на вокзале',
    pluralSubject: false,
  },
  {
    russian: 'Врач',
    german: 'Der Arzt',
    singularVerb: 'besucht',
    pluralVerb: 'besuchen',
    russianVerb: 'навещает',
    russianVerbPlural: 'навещают',
    russianObject: '',
    germanSuffix: 'zu Hause',
    russianSuffix: 'дома',
    pluralSubject: false,
  },
  {
    russian: 'Соседи',
    german: 'Die Nachbarn',
    singularVerb: 'besuchen',
    pluralVerb: 'besuchen',
    russianVerb: 'навещают',
    russianVerbPlural: 'навещают',
    russianObject: '',
    pluralSubject: true,
  },
  {
    russian: 'Клиент',
    german: 'Der Kunde',
    singularVerb: 'fragt',
    pluralVerb: 'fragen',
    russianVerb: 'спрашивает',
    russianVerbPlural: 'спрашивают',
    russianObject: '',
    germanSuffix: 'nach dem neuen Termin',
    russianSuffix: 'о новом времени',
    pluralSubject: false,
  },
  {
    russian: 'Руководительница',
    german: 'Die Leiterin',
    singularVerb: 'erkennt',
    pluralVerb: 'erkennen',
    russianVerb: 'узнаёт',
    russianVerbPlural: 'узнают',
    russianObject: '',
    germanSuffix: 'im Büro',
    russianSuffix: 'в офисе',
    pluralSubject: false,
  },
  {
    russian: 'Сотрудники',
    german: 'Die Mitarbeiter',
    singularVerb: 'begleiten',
    pluralVerb: 'begleiten',
    russianVerb: 'сопровождают',
    russianVerbPlural: 'сопровождают',
    russianObject: '',
    germanSuffix: 'zum Büro',
    russianSuffix: 'до офиса',
    pluralSubject: true,
  },
  {
    russian: 'Подруга',
    german: 'Die Freundin',
    singularVerb: 'lädt',
    pluralVerb: 'laden',
    russianVerb: 'приглашает',
    russianVerbPlural: 'приглашают',
    russianObject: '',
    germanSuffix: 'zum Abendessen ein',
    russianSuffix: 'на ужин',
    pluralSubject: false,
  },
  {
    russian: 'Водитель',
    german: 'Der Fahrer',
    singularVerb: 'bringt',
    pluralVerb: 'bringen',
    russianVerb: 'отвозит',
    russianVerbPlural: 'отвозят',
    russianObject: '',
    germanSuffix: 'zum Hotel',
    russianSuffix: 'до отеля',
    pluralSubject: false,
  },
  {
    russian: 'Гости',
    german: 'Die Gäste',
    singularVerb: 'begrüßen',
    pluralVerb: 'begrüßen',
    russianVerb: 'приветствуют',
    russianVerbPlural: 'приветствуют',
    russianObject: '',
    germanSuffix: 'am Eingang',
    russianSuffix: 'у входа',
    pluralSubject: true,
  },
];

const ACCUSATIVE_CONTEXTS: Context[] = [
  { russian: 'сегодня', german: 'heute' },
  { russian: 'после обеда', german: 'am Nachmittag' },
  { russian: 'после урока', german: 'nach dem Unterricht' },
];

const ES_ACCUSATIVE_SUBJECTS = [
  {
    russianOpening: 'Устройство новое',
    germanOpening: 'Das Gerät ist neu',
    russianSubject: 'техник',
    germanSubject: 'der Techniker',
    russianVerb: 'проверяет',
    germanVerb: 'prüft',
  },
  {
    russianOpening: 'Документ готов',
    germanOpening: 'Das Dokument ist fertig',
    russianSubject: 'секретарь',
    germanSubject: 'die Sekretärin',
    russianVerb: 'печатает',
    germanVerb: 'druckt',
  },
  {
    russianOpening: 'Предложение выгодное',
    germanOpening: 'Das Angebot ist günstig',
    russianSubject: 'менеджер',
    germanSubject: 'der Manager',
    russianVerb: 'проверяет',
    germanVerb: 'prüft',
  },
  {
    russianOpening: 'Отель ещё закрыт',
    germanOpening: 'Das Hotel ist noch geschlossen',
    russianSubject: 'агент',
    germanSubject: 'der Reiseberater',
    russianVerb: 'бронирует',
    germanVerb: 'bucht',
  },
  {
    russianOpening: 'Автомобиль стоит рядом',
    germanOpening: 'Das Auto steht in der Nähe',
    russianSubject: 'механик',
    germanSubject: 'der Mechaniker',
    russianVerb: 'ремонтирует',
    germanVerb: 'repariert',
  },
  {
    russianOpening: 'Велосипед сломан',
    germanOpening: 'Das Fahrrad ist kaputt',
    russianSubject: 'мастер',
    germanSubject: 'der Mechaniker',
    russianVerb: 'ремонтирует',
    germanVerb: 'repariert',
  },
  {
    russianOpening: 'Офис уже открыт',
    germanOpening: 'Das Büro ist schon geöffnet',
    russianSubject: 'сотрудник',
    germanSubject: 'der Mitarbeiter',
    russianVerb: 'убирает',
    germanVerb: 'reinigt',
  },
  {
    russianOpening: 'Билет уже куплен',
    germanOpening: 'Das Ticket ist schon gekauft',
    russianSubject: 'проводник',
    germanSubject: 'der Schaffner',
    russianVerb: 'проверяет',
    germanVerb: 'kontrolliert',
  },
  {
    russianOpening: 'Бланк ещё пустой',
    germanOpening: 'Das Formular ist noch leer',
    russianSubject: 'секретарь',
    germanSubject: 'die Sekretärin',
    russianVerb: 'заполняет',
    germanVerb: 'füllt',
    germanEnding: ' aus',
  },
  {
    russianOpening: 'Снимок выглядит хорошо',
    germanOpening: 'Das Foto sieht gut aus',
    russianSubject: 'фотограф',
    germanSubject: 'der Fotograf',
    russianVerb: 'печатает',
    germanVerb: 'druckt',
  },
];

const ES_ACCUSATIVE_CONTEXTS: Context[] = [
  { russian: 'сегодня', german: 'heute' },
  { russian: 'сейчас', german: 'jetzt' },
  { russian: 'завтра', german: 'morgen' },
];

const DATIVE_SUBJECTS: SubjectTemplate[] = [
  {
    russian: 'Учитель',
    german: 'Der Lehrer',
    singularVerb: 'hilft',
    pluralVerb: 'helfen',
    russianVerb: 'помогает',
    russianVerbPlural: 'помогают',
    russianObject: 'с документами',
    germanSuffix: 'bei den Unterlagen',
    pluralSubject: false,
  },
  {
    russian: 'Коллега',
    german: 'Die Kollegin',
    singularVerb: 'antwortet',
    pluralVerb: 'antworten',
    russianVerb: 'отвечает',
    russianVerbPlural: 'отвечают',
    russianObject: 'на письмо',
    germanSuffix: 'auf die E-Mail',
    pluralSubject: false,
  },
  {
    russian: 'Соседи',
    german: 'Die Nachbarn',
    singularVerb: 'bringen',
    pluralVerb: 'bringen',
    russianVerb: 'приносят',
    russianVerbPlural: 'приносят',
    russianObject: 'запасной ключ',
    germanSuffix: 'einen Ersatzschlüssel',
    pluralSubject: true,
  },
  {
    russian: 'Гости',
    german: 'Die Gäste',
    singularVerb: 'danken',
    pluralVerb: 'danken',
    russianVerb: 'благодарят',
    russianVerbPlural: 'благодарят',
    russianObject: 'за помощь',
    germanSuffix: 'für die Hilfe',
    pluralSubject: true,
  },
  {
    russian: 'Менеджер',
    german: 'Der Manager',
    singularVerb: 'erklärt',
    pluralVerb: 'erklären',
    russianVerb: 'объясняет',
    russianVerbPlural: 'объясняют',
    russianObject: 'новое правило',
    germanSuffix: 'die neue Regel',
    pluralSubject: false,
  },
  {
    russian: 'Врач',
    german: 'Der Arzt',
    singularVerb: 'gibt',
    pluralVerb: 'geben',
    russianVerb: 'даёт',
    russianVerbPlural: 'дают',
    russianObject: 'полезный совет',
    germanSuffix: 'einen hilfreichen Rat',
    pluralSubject: false,
  },
  {
    russian: 'Руководительница',
    german: 'Die Leiterin',
    singularVerb: 'zeigt',
    pluralVerb: 'zeigen',
    russianVerb: 'показывает',
    russianVerbPlural: 'показывают',
    russianObject: 'новый план',
    germanSuffix: 'den neuen Plan',
    pluralSubject: false,
  },
  {
    russian: 'Друзья',
    german: 'Die Freunde',
    singularVerb: 'empfehlen',
    pluralVerb: 'empfehlen',
    russianVerb: 'рекомендуют',
    russianVerbPlural: 'рекомендуют',
    russianObject: 'этот ресторан',
    germanSuffix: 'dieses Restaurant',
    pluralSubject: true,
  },
  {
    russian: 'Преподавательница',
    german: 'Die Lehrerin',
    singularVerb: 'schickt',
    pluralVerb: 'schicken',
    russianVerb: 'присылает',
    russianVerbPlural: 'присылают',
    russianObject: 'расписание',
    germanSuffix: 'den Stundenplan',
    pluralSubject: false,
  },
  {
    russian: 'Компания',
    german: 'Das Unternehmen',
    singularVerb: 'bietet',
    pluralVerb: 'bieten',
    russianVerb: 'предлагает',
    russianVerbPlural: 'предлагают',
    russianObject: 'удобное время',
    germanSuffix: 'einen passenden Termin',
    pluralSubject: false,
  },
];

const DATIVE_CONTEXTS: Context[] = [
  { russian: 'сегодня', german: 'Heute' },
  { russian: 'завтра', german: 'Morgen' },
  { russian: 'после встречи', german: 'Nach dem Treffen' },
];

const ES_DATIVE_SUBJECTS = [
  {
    russianOpening: 'Ребёнку нужна помощь',
    germanOpening: 'Das Kind braucht Hilfe',
    russianSubject: 'мама',
    germanSubject: 'die Mutter',
    russianVerb: 'помогает',
    germanVerb: 'hilft',
    russianEnding: '',
    germanEnding: '',
  },
  {
    russianOpening: 'У ребёнка есть вопрос',
    germanOpening: 'Das Kind hat eine Frage',
    russianSubject: 'учитель',
    germanSubject: 'der Lehrer',
    russianVerb: 'отвечает',
    germanVerb: 'antwortet',
    russianEnding: '',
    germanEnding: '',
  },
  {
    russianOpening: 'Малыш проголодался',
    germanOpening: 'Das Baby hat Hunger',
    russianSubject: 'мама',
    germanSubject: 'die Mutter',
    russianVerb: 'готовит',
    germanVerb: 'kocht',
    russianEnding: 'обед',
    germanEnding: 'das Mittagessen',
  },
  {
    russianOpening: 'Ребёнок плачет',
    germanOpening: 'Das Kind weint',
    russianSubject: 'соседка',
    germanSubject: 'die Nachbarin',
    russianVerb: 'приносит',
    germanVerb: 'bringt',
    russianEnding: 'игрушку',
    germanEnding: 'ein Spielzeug',
  },
  {
    russianOpening: 'Малыш заболел',
    germanOpening: 'Das Baby ist krank',
    russianSubject: 'врач',
    germanSubject: 'der Arzt',
    russianVerb: 'даёт',
    germanVerb: 'gibt',
    russianEnding: 'лекарство',
    germanEnding: 'Medizin',
  },
  {
    russianOpening: 'Ребёнку страшно',
    germanOpening: 'Das Kind hat Angst',
    russianSubject: 'отец',
    germanSubject: 'der Vater',
    russianVerb: 'рассказывает',
    germanVerb: 'erzählt',
    russianEnding: 'сказку',
    germanEnding: 'eine Geschichte',
  },
  {
    russianOpening: 'Малыш хочет пить',
    germanOpening: 'Das Baby hat Durst',
    russianSubject: 'медсестра',
    germanSubject: 'die Pflegerin',
    russianVerb: 'приносит',
    germanVerb: 'bringt',
    russianEnding: 'воду',
    germanEnding: 'Wasser',
  },
  {
    russianOpening: 'У ребёнка день рождения',
    germanOpening: 'Das Kind hat Geburtstag',
    russianSubject: 'друзья',
    germanSubject: 'die Freunde',
    russianVerb: 'дарят',
    germanVerb: 'schenken',
    russianEnding: 'подарок',
    germanEnding: 'ein Geschenk',
  },
  {
    russianOpening: 'Малыш плачет',
    germanOpening: 'Das Baby weint',
    russianSubject: 'врач',
    germanSubject: 'der Arzt',
    russianVerb: 'рекомендует',
    germanVerb: 'empfiehlt',
    russianEnding: 'спокойный вечерний ритуал',
    germanEnding: 'ein ruhiges Abendritual',
  },
  {
    russianOpening: 'Ребёнку нужна новая обувь',
    germanOpening: 'Das Kind braucht neue Schuhe',
    russianSubject: 'мама',
    germanSubject: 'die Mutter',
    russianVerb: 'покупает',
    germanVerb: 'kauft',
    russianEnding: 'новые ботинки',
    germanEnding: 'neue Schuhe',
  },
];

const ES_DATIVE_CONTEXTS: Context[] = [
  { russian: 'сегодня', german: 'heute' },
  { russian: 'сейчас', german: 'jetzt' },
  { russian: 'утром', german: 'morgens' },
];

const GROUP_COUNTS: Record<PronounGroup, Record<PronounCase, number>> = {
  ich: { nominative: 10, accusative: 10, dative: 10 },
  du: { nominative: 10, accusative: 10, dative: 10 },
  er: { nominative: 10, accusative: 10, dative: 10 },
  'sie-singular': { nominative: 10, accusative: 10, dative: 10 },
  es: { nominative: 10, accusative: 10, dative: 10 },
  wir: { nominative: 30, accusative: 30, dative: 30 },
  ihr: { nominative: 30, accusative: 30, dative: 30 },
  'sie-plural': { nominative: 30, accusative: 30, dative: 30 },
  'sie-formal': { nominative: 27, accusative: 27, dative: 26 },
};

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function lowercaseFirst(value: string): string {
  const firstCharacter = Array.from(value)[0];
  return firstCharacter.toLocaleLowerCase('de-DE') + value.slice(firstCharacter.length);
}

function uppercaseFirst(value: string): string {
  const firstCharacter = Array.from(value)[0];
  return firstCharacter.toLocaleUpperCase('ru-RU') + value.slice(firstCharacter.length);
}

function nominativeSentences(group: PronounGroup): ExerciseSentence[] {
  if (group === 'es') return ES_NOMINATIVE;

  const groupIndex = (
    ['ich', 'du', 'er', 'sie-singular', 'wir', 'ihr', 'sie-plural', 'sie-formal'] as const
  ).indexOf(group as Exclude<PronounGroup, 'es'>);
  const forms = GROUPS[group];
  const russianPronoun = group === 'sie-formal'
    ? 'Вы'
    : lowercaseFirst(forms.russian.nominative);
  return NOMINATIVE_VERBS.flatMap((verb) =>
    NOMINATIVE_CONTEXTS.map((context) => ({
      prompt: `${uppercaseFirst(context.russian)} ${russianPronoun} ${verb.russian[groupIndex]} ${verb.russianObject}.`,
      answer: `${context.german} ${verb.german[groupIndex]} ${forms.nominative} ${verb.object}.`,
    })),
  );
}

function accusativeSentences(group: PronounGroup): ExerciseSentence[] {
  const forms = GROUPS[group];
  if (group === 'es') {
    return ES_ACCUSATIVE_SUBJECTS.flatMap((subject) =>
      ES_ACCUSATIVE_CONTEXTS.map((context) => ({
        prompt: `${subject.russianOpening}, и ${context.russian} ${subject.russianSubject} ${subject.russianVerb} ${forms.russian.accusative}.`,
        answer: `${subject.germanOpening}, und ${context.german} ${subject.germanVerb} ${subject.germanSubject} ${forms.accusative}${subject.germanEnding ?? ''}.`,
      })),
    );
  }
  return ACCUSATIVE_SUBJECTS.flatMap((subject) =>
    ACCUSATIVE_CONTEXTS.map((context) => {
      const verb = subject.pluralSubject ? subject.pluralVerb : subject.singularVerb;
      const russianVerb = subject.pluralSubject
        ? subject.russianVerbPlural
        : subject.russianVerb;
      return {
        prompt: `${subject.russian} ${russianVerb} ${forms.russian.accusative} ${context.russian}${subject.russianSuffix ? ` ${subject.russianSuffix}` : ''}.`,
        answer: `${subject.german} ${verb} ${forms.accusative} ${context.german}${subject.germanSuffix ? ` ${subject.germanSuffix}` : ''}.`,
      };
    }),
  );
}

function dativeSentences(group: PronounGroup): ExerciseSentence[] {
  const forms = GROUPS[group];
  if (group === 'es') {
    return ES_DATIVE_SUBJECTS.flatMap((subject) =>
      ES_DATIVE_CONTEXTS.map((context) => {
        const russianEnding = subject.russianEnding ? ` ${subject.russianEnding}` : '';
        const germanEnding = subject.germanEnding ? ` ${subject.germanEnding}` : '';
        return {
          prompt: `${subject.russianOpening}, и ${context.russian} ${subject.russianSubject} ${subject.russianVerb} ему${russianEnding}.`,
          answer: `${subject.germanOpening}, und ${context.german} ${subject.germanVerb} ihm ${subject.germanSubject}${germanEnding}.`,
        };
      }),
    );
  }
  return DATIVE_SUBJECTS.flatMap((subject) =>
    DATIVE_CONTEXTS.map((context) => {
      const verb = subject.singularVerb;
      const russianVerb = subject.pluralSubject
        ? subject.russianVerbPlural
        : subject.russianVerb;
      const germanSuffix = subject.germanSuffix ? ` ${subject.germanSuffix}` : '';
      const russianObject = subject.russianObject ? ` ${subject.russianObject}` : '';
      return {
        prompt: `${uppercaseFirst(context.russian)} ${lowercaseFirst(subject.russian)} ${russianVerb} ${forms.russian.dative}${russianObject}.`,
        answer: `${context.german} ${verb} ${lowercaseFirst(subject.german)} ${forms.dative}${germanSuffix}.`,
      };
    }),
  );
}

function buildSentencePool(group: PronounGroup, grammaticalCase: PronounCase): ExerciseSentence[] {
  if (grammaticalCase === 'nominative') return nominativeSentences(group);
  if (grammaticalCase === 'accusative') return accusativeSentences(group);
  return dativeSentences(group);
}

function buildExercises(): Exercise[] {
  const sentences: (ExerciseSentence & {
    group: PronounGroup;
    grammaticalCase: PronounCase;
  })[] = [];
  for (const [group, cases] of Object.entries(GROUP_COUNTS) as [
    PronounGroup,
    Record<PronounCase, number>
  ][]) {
    for (const grammaticalCase of ['nominative', 'accusative', 'dative'] as const) {
      const pool = buildSentencePool(group, grammaticalCase);
      const requiredCount = cases[grammaticalCase];
      assert(
        pool.length >= requiredCount,
        `${group}/${grammaticalCase}: expected ${requiredCount} sentence variants, found ${pool.length}.`,
      );
      sentences.push(
        ...pool.slice(0, requiredCount).map((sentence) => ({
          ...sentence,
          group,
          grammaticalCase,
        })),
      );
    }
  }

  assert(sentences.length === 500, `Expected 500 pronoun exercises, found ${sentences.length}.`);
  const uniqueSentences = new Set(sentences.map(({ prompt, answer }) => `${prompt}\u0000${answer}`));
  assert(uniqueSentences.size === sentences.length, 'Pronoun exercise sentences must be unique.');
  const uniquePrompts = new Set(sentences.map(({ prompt }) => prompt));
  assert(uniquePrompts.size === sentences.length, 'Pronoun exercise prompts must be unique.');

  const distractorBank = [
    ...sentences.flatMap(({ answer }) => tokenize(answer)),
    'mich', 'dich', 'ihn', 'sie', 'es', 'uns', 'euch', 'Sie',
    'mir', 'dir', 'ihm', 'ihr', 'ihnen', 'Ihnen',
    'ich', 'du', 'er', 'wir', 'ihr', 'sie', 'man',
    'dem', 'den', 'der', 'das', 'die', 'einen', 'einem',
    'heute', 'morgen', 'gestern', 'später', 'dort', 'hier',
    'hilft', 'helfen', 'sieht', 'sehen', 'gibt', 'geben',
  ];

  return sentences.map((sentence, index) => {
    const answerWords = tokenize(sentence.answer);
    const exercise: Exercise & {
      pronounGroup: PronounGroup;
      grammaticalCase: PronounCase;
    } = {
      id: `pronouns-${index + 1}`,
      prompt: sentence.prompt,
      answer: sentence.answer,
      options: createOptions(sentence.answer, distractorBank),
      pronounGroup: sentence.group,
      grammaticalCase: sentence.grammaticalCase,
    };
    assert(
      answerWords.length >= 4 &&
        answerWords.length <= 12 &&
        tokenize(sentence.prompt).length >= 4 &&
        tokenize(sentence.prompt).length <= 12,
      `${exercise.id}: expected Russian and German sentences with 4–12 words.`,
    );
    return exercise;
  });
}

const exercises = buildExercises();

export const PRONOUN_EXERCISES = exercises as (Exercise & {
  pronounGroup: PronounGroup;
  grammaticalCase: PronounCase;
})[];

export const PRONOUNS_TOPIC: Omit<Topic, 'level'> & { level: 'Местоимения' } = {
  id: 'personal-pronouns',
  level: 'Местоимения',
  title: 'Личные местоимения и падежи',
  summary: 'Разбираем Nominativ, Akkusativ и Dativ на примерах для всех лиц.',
  explanation:
    'В немецком личное местоимение зависит от роли в предложении: Nominativ обозначает подлежащее, Akkusativ — прямое дополнение, Dativ — адресата или дополнение после глаголов и предлогов, которые требуют Dativ. Сравните: ich → mich → mir; du → dich → dir; er → ihn → ihm; wir → uns → uns; ihr → euch → euch; sie → sie → ihnen; Sie → Sie → Ihnen.',
  examples: [
    'Ich sehe ihn heute. — Сегодня я вижу его.',
    'Sie hilft mir bei den Unterlagen. — Она помогает мне с документами.',
  ],
  tip:
    'Сначала найдите роль местоимения: кто выполняет действие — Nominativ; кого/что — Akkusativ; кому — Dativ. Отдельно запомните формы ihr → euch/ihnen и вежливое Sie → Sie/Ihnen.',
  exercises,
};

export function getPronounExerciseCounts() {
  const counts: Record<'singular' | 'plural', number> = { singular: 0, plural: 0 };
  const byGroup = {} as Record<PronounGroup, number>;
  const byCase: Record<PronounCase, number> = {
    nominative: 0,
    accusative: 0,
    dative: 0,
  };

  for (const exercise of PRONOUN_EXERCISES) {
    const group = exercise.pronounGroup;
    const grammaticalCase = exercise.grammaticalCase;
    counts[group === 'ich' || group === 'du' || group === 'er' ||
      group === 'sie-singular' || group === 'es' ? 'singular' : 'plural'] += 1;
    byGroup[group] = (byGroup[group] ?? 0) + 1;
    byCase[grammaticalCase] += 1;
  }
  return { counts, byGroup, byCase };
}

export function validatePronounExercises(): void {
  assert(PRONOUN_EXERCISES.length === 500, 'Expected exactly 500 pronoun exercises.');
  const { counts, byGroup } = getPronounExerciseCounts();
  assert(counts.singular === 150, `Expected 150 singular pronoun exercises, got ${counts.singular}.`);
  assert(counts.plural === 350, `Expected 350 plural pronoun exercises, got ${counts.plural}.`);
  for (const [group, cases] of Object.entries(GROUP_COUNTS) as [
    PronounGroup,
    Record<PronounCase, number>
  ][]) {
    const expectedCount = Object.values(cases).reduce((total, count) => total + count, 0);
    assert(byGroup[group] === expectedCount, `${group}: expected ${expectedCount} exercises.`);
  }
}

export const PRONOUN_CASE_LABELS = CASE_LABELS;
export const PRONOUN_GROUP_LABELS = GROUP_LABELS;
