import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function loadTypeScriptModule(filePath, imports = {}) {
  const source = ts.transpileModule(
    readFileSync(filePath, 'utf8'),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
      },
    },
  ).outputText;
  const module = { exports: {} };
  const resolveImport = (name) => {
    if (Object.hasOwn(imports, name)) {
      return imports[name];
    }
    throw new Error(`Unexpected import "${name}" in ${filePath}.`);
  };
  new Function('require', 'module', 'exports', source)(
    resolveImport,
    module,
    module.exports,
  );
  return module.exports;
}

const trainer = loadTypeScriptModule(path.join(root, 'src', 'trainer.ts'));
const speechMatching = loadTypeScriptModule(path.join(root, 'src', 'speechMatching.ts'));
const content = loadTypeScriptModule(
  path.join(root, 'src', 'content.ts'),
  { './trainer': trainer },
);
const authoredPools = loadTypeScriptModule(
  path.join(root, 'src', 'authoredExercisePools.ts'),
);
const pronouns = loadTypeScriptModule(
  path.join(root, 'src', 'pronounExercises.ts'),
  { './trainer': trainer },
);
const speechMatchingSource = [
  `const matchSpokenWords = ${speechMatching.matchSpokenWords.toString()};`,
  `const matchSpeechAlternatives = ${speechMatching.matchSpeechAlternatives.toString()};`,
].join('\n');

if (content.TOPICS.length !== 18) {
  throw new Error(`Expected 18 topics, found ${content.TOPICS.length}.`);
}
for (const topic of content.TOPICS) {
  if (topic.exercises.length !== 15) {
    throw new Error(`${topic.title} should contain 15 exercises.`);
  }
}

const EXERCISE_POOL_SIZE = 50;
const SESSION_EXERCISE_COUNT = 15;
const FRONTED_CONTEXTS = [
  { ru: 'Сегодня', de: 'Heute', temporal: true },
  { ru: 'На этой неделе', de: 'Diese Woche', temporal: true },
  { ru: 'В понедельник', de: 'Am Montag', temporal: true },
  { ru: 'Позже', de: 'Später', temporal: true },
  { ru: 'В этом случае', de: 'In diesem Fall' },
  { ru: 'В этой ситуации', de: 'In dieser Situation' },
  { ru: 'В повседневной жизни', de: 'Im Alltag' },
  { ru: 'Здесь', de: 'Hier' },
  { ru: 'Там', de: 'Dort' },
];
const GERMAN_SUBJECTS = [
  ['Die neuen Mitarbeiter', 'die neuen Mitarbeiter'],
  ['Alle Unterlagen', 'alle Unterlagen'],
  ['Die Fahrgäste', 'die Fahrgäste'],
  ['Die Verhandlungen', 'die Verhandlungen'],
  ['Die Nachbarn', 'die Nachbarn'],
  ['Die Kollegen', 'die Kollegen'],
  ['Die Mitarbeiter', 'die Mitarbeiter'],
  ['Der Verdächtige', 'der Verdächtige'],
  ['Der Vorstellungstermin', 'der Vorstellungstermin'],
  ['Der Kellner', 'der Kellner'],
  ['Der Minister', 'der Minister'],
  ['Der Direktor', 'der Direktor'],
  ['Der Sprecher', 'der Sprecher'],
  ['Der Leiter', 'der Leiter'],
  ['Der Nachbar', 'der Nachbar'],
  ['Der Fahrgast', 'der Fahrgast'],
  ['Der Mechaniker', 'der Mechaniker'],
  ['Der Patient', 'der Patient'],
  ['Der Student', 'der Student'],
  ['Der Mann', 'der Mann'],
  ['Der Kunde', 'der Kunde'],
  ['Der Bus', 'der Bus'],
  ['Der Zug', 'der Zug'],
  ['Der Arzt', 'der Arzt'],
  ['Der Chef', 'der Chef'],
  ['Die Kollegin', 'die Kollegin'],
  ['Die Frau', 'die Frau'],
  ['Das Mädchen', 'das Mädchen'],
  ['Die Wohnung', 'die Wohnung'],
  ['Die Polizei', 'die Polizei'],
  ['Die Zeitung', 'die Zeitung'],
  ['Die Zeugin', 'die Zeugin'],
  ['Die Firma', 'die Firma'],
  ['Die Straße', 'die Straße'],
  ['Die Rechnung', 'die Rechnung'],
  ['Die Lieferung', 'die Lieferung'],
  ['Die Bestellung', 'die Bestellung'],
  ['Die Brücke', 'die Brücke'],
  ['Die Schlüssel', 'die Schlüssel'],
  ['Die Gäste', 'die Gäste'],
  ['Die Kinder', 'die Kinder'],
  ['Die Dokumente', 'die Dokumente'],
  ['Das Unternehmen', 'das Unternehmen'],
  ['Das Gebäude', 'das Gebäude'],
  ['Das Paket', 'das Paket'],
  ['Das Fenster', 'das Fenster'],
  ['Das Fahrrad', 'das Fahrrad'],
  ['Das Geschäft', 'das Geschäft'],
  ['Das Essen', 'das Essen'],
  ['Das Formular', 'das Formular'],
  ['Das Angebot', 'das Angebot'],
  ['Das Problem', 'das Problem'],
  ['Das Team', 'das Team'],
  ['Das', 'das'],
  ['Mein Bruder', 'mein Bruder'],
  ['Meine Schwester', 'meine Schwester'],
  ['Meine Freundin', 'meine Freundin'],
  ['Ich', 'ich'],
  ['Wir', 'wir'],
  ['Du', 'du'],
  ['Er', 'er'],
  ['Sie', 'sie'],
  ['Man', 'man'],
  ['Maria', 'Maria'],
  ['Anna', 'Anna'],
];
const FRONTED_GERMAN_PHRASES = [
  'Mir',
  'Hier',
  'Dort',
  'Vor der Reise',
  'Nach der Anmeldung',
  'Während der Reparatur',
  'Wegen der Verspätung',
  'Nach der Besprechung',
  'Vor dem Vorstellungsgespräch',
  'Nach dem Umzug',
  'Dank der rechtzeitigen Reparatur',
  'Während des Wartens',
  'Nach der Ankunft',
  'Vor der Eröffnung',
  'Trotz der Absage des Fluges',
  'Beim Ausfüllen des Formulars',
  'Nach der Kündigung',
  'Aufgrund des Stromausfalls',
];
const FINITE_FIRST_QUESTION =
  /^(Haben|Hast|Hat|Bin|Bist|Ist|Sind|Seid|Kann|Kannst|Können|Könnt|Darf|Darfst|Dürfen|Muss|Musst|Müssen|Soll|Sollst|Sollen|Würde|Würdest|Würden|Hätte|Hättest|Hätten|Könnte|Könntest|Könnten|Möchte|Möchtest|Möchten|Gehen|Geht|Geh|Kommen|Kommt|Komm|Rufen|Ruf|Schicken|Schick|Sagen|Sag|Prüfen|Prüf)\s+([A-ZÄÖÜ][a-zäöüß]+)\b/;
const SUBJECTLESS_PROMPT_START =
  /^(?:obwohl|wenn|als|weil|dass|je\b|sofern|falls|чем\b|хотя\b|если\b|когда\b|поскольку\b|перед\b|после\b|во время\b|из-за\b|несмотря\b|по словам\b|где\b|вот\b)/i;
const TIME_WORDS =
  /\b(?:heute|gestern|morgen|später|früh|abends|morgens|wochenende|montag|freitag|woche|heute abend|heute morgen)\b|сегодня|вчера|завтра|позже|утром|вечером|выходных|понедельник|пятницу|неделе/i;
const RUSSIAN_PROPER_NAMES = new Set(['мария', 'анна', 'макс', 'иван', 'олег']);

function lowerFirst(value) {
  const firstCharacter = Array.from(value)[0];
  return firstCharacter.toLocaleLowerCase('de-DE') + value.slice(firstCharacter.length);
}

function lowerFirstRussian(value) {
  const firstWord = value.match(/^[\p{L}Ёё-]+/u)?.[0];
  if (firstWord && RUSSIAN_PROPER_NAMES.has(firstWord.toLocaleLowerCase('ru-RU'))) {
    return value;
  }
  const firstCharacter = Array.from(value)[0];
  return firstCharacter.toLocaleLowerCase('ru-RU') + value.slice(firstCharacter.length);
}

function contextVariants(exercise) {
  const variants = [];
  const seen = new Set([`${exercise.prompt}\u0000${exercise.answer}`]);
  const answerWords = exercise.answer.trim().split(/\s+/);

  function addVariant(prompt, answer, idSuffix) {
    if (
      prompt === exercise.prompt ||
      answer === exercise.answer ||
      prompt.trim().split(/\s+/).length > 12 ||
      answer.trim().split(/\s+/).length > 12
    ) {
      return;
    }
    const key = `${prompt}\u0000${answer}`;
    if (seen.has(key)) return;
    seen.add(key);
    variants.push({
      id: `${exercise.id}-${idSuffix}`,
      prompt,
      answer,
    });
  }

  if (!SUBJECTLESS_PROMPT_START.test(exercise.prompt) && !TIME_WORDS.test(exercise.prompt + ' ' + exercise.answer)) {
    const germanSubject = GERMAN_SUBJECTS.find(([phrase]) =>
      exercise.answer.toLocaleLowerCase('de-DE').startsWith(`${phrase.toLocaleLowerCase('de-DE')} `),
    );
    if (germanSubject) {
      const subjectWords = germanSubject[0].split(/\s+/);
      const predicate = answerWords.slice(subjectWords.length);
      if (predicate.length > 0) {
        const finiteVerb = predicate[0].replace(/,$/, '');
        const commaAfterVerb = predicate[0].endsWith(',');
        const predicateTail = predicate.slice(1).join(' ');
        for (const [index, context] of FRONTED_CONTEXTS.entries()) {
          if (context.temporal && TIME_WORDS.test(`${exercise.prompt} ${exercise.answer}`)) continue;
          const prompt = `${context.ru} ${lowerFirstRussian(exercise.prompt)}`;
          const answer = `${context.de} ${finiteVerb} ${germanSubject[1]}${commaAfterVerb ? ',' : ''}${predicateTail ? ` ${predicateTail}` : ''}`;
          addVariant(prompt, answer, `context-${index + 1}`);
        }
      }
    }
  }

  const finiteFirst = exercise.answer.match(FINITE_FIRST_QUESTION);
  if (finiteFirst) {
    const finiteVerb = finiteFirst[1];
    const subject = finiteFirst[2];
    const remainder = exercise.answer.slice(finiteFirst[0].length);
    for (const [index, context] of FRONTED_CONTEXTS.entries()) {
      if (context.temporal && TIME_WORDS.test(`${exercise.prompt} ${exercise.answer}`)) continue;
      addVariant(
        `${context.ru} ${lowerFirstRussian(exercise.prompt)}`,
        `${context.de} ${lowerFirst(finiteVerb)} ${subject}${remainder}`,
        `question-${index + 1}`,
      );
    }
  }

  for (const phrase of FRONTED_GERMAN_PHRASES) {
    if (!exercise.answer.startsWith(`${phrase} `)) continue;
    const tail = exercise.answer.slice(phrase.length + 1).split(/\s+/);
    if (tail.length < 2) continue;
    const finiteVerb = tail[0].replace(/,$/, '');
    const commaAfterVerb = tail[0].endsWith(',');
    const rest = tail.slice(1).join(' ');
    const formalSubject = rest.match(/^(Sie|du|ihr|wir|er|sie|man)\b/);
    for (const [index, context] of FRONTED_CONTEXTS.entries()) {
      if (context.temporal && TIME_WORDS.test(`${exercise.prompt} ${exercise.answer}`)) continue;
      const prompt = `${context.ru} ${lowerFirstRussian(exercise.prompt)}`;
      const answer = formalSubject
        ? `${context.de} ${finiteVerb} ${formalSubject[1]} ${lowerFirst(phrase)}${rest.slice(formalSubject[0].length)}`
        : `${context.de} ${finiteVerb}${commaAfterVerb ? ',' : ''} ${lowerFirst(phrase)} ${rest}`;
      addVariant(prompt, answer, `fronted-${index + 1}`);
    }
  }

  return variants;
}

function shuffle(items) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function buildExercisePool(topic) {
  const additions = authoredPools.AUTHORED_EXERCISE_POOLS[topic.id];
  if (!additions || additions.length !== EXERCISE_POOL_SIZE - topic.exercises.length) {
    throw new Error(
      `${topic.id}: expected ${EXERCISE_POOL_SIZE - topic.exercises.length} authored additions.`,
    );
  }
  const distractorBank = topic.exercises.flatMap((exercise) => exercise.options);
  const pool = [
    ...topic.exercises,
    ...additions.map(([prompt, answer], index) => ({
      id: `${topic.id}-authored-${index + 1}`,
      prompt,
      answer,
      options: trainer.createOptions(answer, distractorBank),
    })),
  ];
  const knownSentences = new Set();
  for (const exercise of pool) {
    const key = `${exercise.prompt}\u0000${exercise.answer}`;
    if (knownSentences.has(key)) {
      throw new Error(`${topic.id}/${exercise.id}: duplicate authored exercise.`);
    }
    knownSentences.add(key);
  }
  const result = {
    ...topic,
    exercises: pool,
  };
  const exerciseIds = new Set(result.exercises.map((exercise) => exercise.id));
  if (exerciseIds.size !== EXERCISE_POOL_SIZE) {
    throw new Error(`${topic.id}: exercise ids must be unique.`);
  }
  for (const exercise of result.exercises) {
    const wordCount = trainer.tokenize(exercise.answer).length;
    const distractorCount = Math.max(2, Math.floor(wordCount * 0.3));
    if (
      exercise.options.length !== wordCount + distractorCount ||
      trainer.tokenize(exercise.prompt).length < 4 ||
      trainer.tokenize(exercise.prompt).length > 12 ||
      wordCount < 4 ||
      wordCount > 12
    ) {
      throw new Error(`${topic.id}/${exercise.id}: invalid prompt or word bank.`);
    }
  }
  const promptSet = new Set(result.exercises.map(({ prompt }) => prompt));
  if (promptSet.size !== EXERCISE_POOL_SIZE) {
    throw new Error(`${topic.id}: Russian prompts must be unique.`);
  }
  return result;
}

const exerciseTopics = content.TOPICS.map(buildExercisePool);
pronouns.validatePronounExercises();
for (const exercise of pronouns.PRONOUN_EXERCISES) {
  const wordCount = trainer.tokenize(exercise.answer).length;
  const distractorCount = Math.max(2, Math.floor(wordCount * 0.3));
  if (
    exercise.options.length !== wordCount + distractorCount ||
    trainer.tokenize(exercise.prompt).length < 4 ||
    trainer.tokenize(exercise.prompt).length > 12 ||
    wordCount < 4 ||
    wordCount > 12
  ) {
    throw new Error(`personal-pronouns/${exercise.id}: invalid prompt or word bank.`);
  }
}
const pronounTopic = {
  ...pronouns.PRONOUNS_TOPIC,
  exercises: pronouns.PRONOUN_EXERCISES,
};
const topicData = JSON.stringify([...exerciseTopics, pronounTopic]).replace(/</g, '\\u003c');
const output = `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="theme-color" content="#f5f7fb">
  <meta name="description" content="Мобильный веб-тренажёр немецкой грамматики A2–B2 с объяснениями на русском.">
  <title>Wort für Wort — немецкий по шагам</title>
  <style>
    :root {
      color-scheme: light;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #182230;
      background: #f5f7fb;
      font-synthesis: none;
      text-rendering: optimizeLegibility;
      -webkit-text-size-adjust: 100%;
      --ink: #182230;
      --muted: #667085;
      --accent: #3657d6;
      --accent-light: #e8edff;
      --border: #dde3ee;
      --surface: #fff;
    }
    * { box-sizing: border-box; }
    body { margin: 0; min-width: 320px; min-height: 100vh; }
    button, a { font: inherit; }
    button { color: inherit; }
    .page { width: min(100% - 32px, 720px); margin: 0 auto; padding: 0 0 calc(32px + env(safe-area-inset-bottom)); }
    .page.lesson-page { padding-bottom: calc(104px + env(safe-area-inset-bottom)); }
    .header { padding: calc(16px + env(safe-area-inset-top)) 0 18px; border-bottom: 1px solid var(--border); }
    .brand { margin: 0; font-size: 17px; font-weight: 800; letter-spacing: .3px; }
    .caption { margin: 3px 0 0; color: var(--muted); font-size: 12px; }
    .intro { padding: 28px 0 8px; }
    .eyebrow, .label { margin: 0 0 8px; color: var(--accent); font-size: 11px; font-weight: 800; letter-spacing: 1.1px; }
    h1 { margin: 0 0 8px; font-size: clamp(26px, 7vw, 32px); line-height: 1.18; letter-spacing: -.5px; }
    .body-copy { margin: 0; color: var(--muted); font-size: 15px; line-height: 1.55; }
    .level-tabs { display: flex; gap: 8px; overflow-x: auto; padding: 16px 0 4px; scrollbar-width: none; }
    .level-tabs::-webkit-scrollbar { display: none; }
    .tab { min-width: 62px; min-height: 44px; padding: 0 16px; border: 1px solid var(--border); border-radius: 24px; background: var(--surface); color: var(--muted); font-weight: 800; cursor: pointer; }
    .tab[aria-pressed="true"] { border-color: var(--accent); background: var(--accent); color: #fff; }
    .level-heading { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; margin: 18px 0 10px; }
    .level-heading h2 { margin: 0; font-size: 20px; }
    .level-heading span, .topic-meta { color: var(--muted); font-size: 12px; }
    .topic-card, .info-card, .exercise-card { border: 1px solid var(--border); border-radius: 16px; background: var(--surface); }
    .topic-card { display: block; width: 100%; margin: 0 0 10px; padding: 16px; text-align: left; cursor: pointer; transition: border-color .15s, transform .15s; }
    .topic-card:active, .word:active, .button:active, .tab:active { transform: scale(.985); }
    .topic-card:hover { border-color: #b8c6ff; }
    .topic-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
    .topic-number { color: var(--accent); font-size: 12px; font-weight: 800; }
    .topic-meta { padding: 5px 9px; border-radius: 20px; background: #f5f7fb; }
    .topic-title { display: block; margin-bottom: 5px; font-size: 17px; font-weight: 750; line-height: 1.35; }
    .topic-summary { display: block; color: var(--muted); font-size: 13px; line-height: 1.5; }
    .back { min-height: 44px; margin: 8px 0 6px -10px; padding: 0 10px; border: 0; background: transparent; color: var(--accent); font-weight: 750; cursor: pointer; }
    .lesson-heading { padding: 4px 0 16px; }
    .lesson-heading h1 { font-size: clamp(25px, 6vw, 30px); }
    .info-card { padding: 16px; }
    .label { color: var(--muted); margin-bottom: 9px; }
    .example { margin: 0 0 6px; font-size: 15px; line-height: 1.55; overflow-wrap: anywhere; }
    .tip { margin-top: 13px; padding: 12px; border-radius: 12px; background: var(--accent-light); }
    .tip strong { display: block; margin-bottom: 4px; color: var(--accent); font-size: 12px; }
    .tip p { margin: 0; font-size: 13px; line-height: 1.5; }
    .reference { display: inline-block; margin-top: 12px; color: var(--accent); font-size: 13px; line-height: 1.5; }
    .trainer-heading { display: flex; justify-content: space-between; align-items: end; gap: 12px; margin: 24px 0 9px; }
    .trainer-heading .label { margin-bottom: 5px; }
    .trainer-heading h2 { margin: 0; font-size: 20px; }
    .progress-text { color: var(--muted); font-size: 12px; font-weight: 750; white-space: nowrap; }
    .progress-track { height: 5px; margin-bottom: 12px; overflow: hidden; border-radius: 10px; background: var(--border); }
    .progress-fill { height: 100%; border-radius: inherit; background: var(--accent); transition: width .2s ease; }
    .exercise-card { padding: 16px; }
    .prompt-label { margin: 0 0 6px; color: var(--muted); font-size: 12px; }
    .prompt { margin: 0; font-size: 20px; font-weight: 750; line-height: 1.45; overflow-wrap: anywhere; }
    .answer-area { display: flex; min-height: 72px; align-items: center; margin: 16px 0; padding: 10px; border: 1px dashed var(--border); border-radius: 12px; }
    .placeholder { width: 100%; color: var(--muted); font-size: 12px; line-height: 1.5; text-align: center; }
    .words { display: flex; flex-wrap: wrap; gap: 8px; }
    .answer-area .words { display: block; width: 100%; line-height: 1.9; }
    .word { min-height: 42px; padding: 8px 12px; border: 1px solid var(--border); border-radius: 24px; background: #f5f7fb; font-size: 14px; font-weight: 650; cursor: pointer; touch-action: manipulation; }
    .speech-controls { display: grid; grid-template-columns: 80% minmax(0, 1fr); gap: 7px 8px; margin: 0 0 12px; }
    .speech-button { width: 100%; }
    .play-answer-button { width: 100%; padding: 0 8px; font-size: 20px; }
    .speech-status { grid-column: 1 / -1; min-height: 18px; margin: 0; color: var(--muted); font-size: 12px; line-height: 1.5; }
    .word.selected { border-color: #b8c6ff; background: var(--accent-light); color: var(--accent); font-weight: 750; }
    .word:disabled { opacity: .35; cursor: default; transform: none; }
    .answer-word { display: inline; min-height: 0; margin: 0; padding: 0; border: 0; border-radius: 0; background: transparent; color: var(--accent); font-size: 16px; font-weight: 650; line-height: inherit; cursor: pointer; touch-action: manipulation; }
    .answer-word:disabled { color: var(--ink); cursor: default; }
    .feedback { margin-top: 15px; padding: 12px; border-radius: 12px; }
    .feedback.correct { background: #e7f6ee; color: #16794a; }
    .feedback.incorrect { background: #feeceb; color: #b42318; }
    .feedback strong { display: block; font-size: 14px; }
    .feedback p { margin: 4px 0 0; color: var(--muted); font-size: 12px; line-height: 1.5; }
    .feedback .correct-answer { color: var(--ink); font-size: 15px; font-weight: 750; }
    .button { display: inline-flex; min-height: 48px; align-items: center; justify-content: center; padding: 0 16px; border: 1px solid var(--border); border-radius: 12px; background: var(--surface); font-size: 14px; font-weight: 750; cursor: pointer; touch-action: manipulation; }
    .button.primary { width: 100%; margin-top: 15px; border-color: var(--accent); background: var(--accent); color: #fff; }
    .exercise-action-bar { position: fixed; z-index: 10; inset: auto 0 0; padding: 10px 16px calc(10px + env(safe-area-inset-bottom)); border-top: 1px solid var(--border); background: rgba(245, 247, 251, .96); backdrop-filter: blur(12px); }
    .exercise-action-bar .button.primary { display: flex; width: min(100%, 688px); min-height: 52px; margin: 0 auto; }
    .navigation { display: flex; justify-content: space-between; gap: 12px; margin-top: 12px; }
    .navigation .button { min-width: 104px; }
    .button:disabled { opacity: .42; cursor: default; transform: none; }
    .footer { margin-top: 24px; color: var(--muted); font-size: 12px; line-height: 1.5; text-align: center; }
    @media (min-width: 600px) {
      .page { width: min(100% - 48px, 720px); }
      .header { padding-bottom: 22px; }
      .topic-card, .info-card, .exercise-card { padding: 19px; }
    }
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after { scroll-behavior: auto !important; transition-duration: .01ms !important; }
    }
  </style>
</head>
<body>
  <main class="page" id="app" aria-live="polite"></main>
  <script id="topic-data" type="application/json">${topicData}</script>
  <script>
    'use strict';
    const TOPICS = JSON.parse(document.getElementById('topic-data').textContent);
    const LEVELS = ['A2', 'B1', 'B2', 'Местоимения'];
    const app = document.getElementById('app');
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const state = {
      level: 'A2',
      selected: [],
      feedback: null,
      exerciseSets: Object.create(null),
      hasAttempted: false,
      speechStatus: SpeechRecognition
        ? 'Произнеси предложение по-немецки. Для сомнительных слов я попробую подобрать похожие слова из ответа.'
        : 'Голосовой ввод не поддерживается этим браузером. Можно выбрать слова вручную.',
      speechListening: false,
    };
    const canSynthesizeSpeech = 'speechSynthesis' in window
      && typeof window.SpeechSynthesisUtterance === 'function';
    let activeRecognition = null;
    const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    })[char]);
    const tokenize = (sentence) => sentence.trim().split(/\\s+/).filter(Boolean);
    const normalizeWord = (word) => word
      .toLocaleLowerCase('de-DE')
      .replace(/^[„“"'([{]+/, '')
      .replace(/[.,!?;:…»”"')\\]}“]+$/, '');
    const answersMatch = (selected, answer) => {
      const expected = tokenize(answer).map(normalizeWord);
      return selected.length === expected.length
        && selected.every((word, index) => normalizeWord(word) === expected[index]);
    };
    ${speechMatchingSource}
    const speechErrorMessage = (error) => {
      const messages = {
        'not-allowed': 'Нет доступа к микрофону. Разреши его в настройках браузера.',
        'service-not-allowed': 'Браузер запретил службу распознавания речи.',
        'no-speech': 'Речь не распознана. Попробуй говорить громче и ближе к микрофону.',
        'audio-capture': 'Не удалось получить звук с микрофона.',
        network: 'Для распознавания речи этому браузеру может понадобиться интернет.',
        aborted: 'Распознавание остановлено.',
      };
      return messages[error] || 'Ошибка распознавания речи. Попробуй ещё раз или собери ответ вручную.';
    };
    const stopSpeechRecognition = () => {
      if (!activeRecognition) return;
      state.speechListening = false;
      activeRecognition.stop();
    };
    const playCorrectAnswer = () => {
      const route = currentRoute();
      if (!canSynthesizeSpeech || !state.hasAttempted || !route) return;
      const utterance = new window.SpeechSynthesisUtterance(route.topic.exercises[route.index].answer);
      utterance.lang = 'de-DE';
      const germanVoice = window.speechSynthesis.getVoices()
        .find((voice) => voice.lang.toLocaleLowerCase().startsWith('de'));
      if (germanVoice) utterance.voice = germanVoice;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    };
    const startSpeechRecognition = () => {
      if (!SpeechRecognition) return;
      const route = currentRoute();
      if (!route) return;
      const exerciseId = route.topic.exercises[route.index].id;
      state.selected = [];
      state.feedback = null;
      state.speechStatus = 'Слушаю… Говори по-немецки.';
      state.speechListening = true;
      const recognition = new SpeechRecognition();
      activeRecognition = recognition;
      recognition.lang = 'de-DE';
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 5;
      recognition.onresult = (event) => {
        const current = currentRoute();
        if (
          !current ||
          current.topic.id !== route.topic.id ||
          current.topic.exercises[current.index].id !== exerciseId
        ) return;
        const exercise = current.topic.exercises[current.index];
        const alternatives = Array.from(event.results[0], (alternative) => alternative.transcript.trim())
          .filter(Boolean);
        const match = matchSpeechAlternatives(alternatives, exercise.options, exercise.answer);
        state.selected = match.selected;
        state.speechListening = false;
        const approximateStatus = match.approximate.length
          ? 'Похожие слова сопоставлены: ' + match.approximate.map(({ spoken, matched }) => '«' + spoken + '» → «' + matched + '»').join(', ') + '. '
          : '';
        const unrecognizedStatus = match.unrecognized.length
          ? 'Не распознаны: ' + match.unrecognized.join(', ') + '. Ответ можно поправить вручную.'
          : 'Слова выбраны — проверь ответ.';
        state.speechStatus = 'Распознано: «' + match.transcript + '». ' + approximateStatus + unrecognizedStatus;
        render();
      };
      recognition.onerror = (event) => {
        const current = currentRoute();
        if (
          !current ||
          current.topic.id !== route.topic.id ||
          current.topic.exercises[current.index].id !== exerciseId
        ) return;
        state.speechListening = false;
        state.speechStatus = speechErrorMessage(event.error);
        render();
      };
      recognition.onend = () => {
        if (activeRecognition !== recognition) return;
        if (activeRecognition === recognition) activeRecognition = null;
        if (state.speechListening) {
          state.speechListening = false;
          state.speechStatus = 'Речь не распознана. Попробуй ещё раз или выбери слова вручную.';
          render();
        }
      };
      try {
        recognition.start();
        render();
      } catch (error) {
        state.speechListening = false;
        state.speechStatus = 'Не удалось запустить микрофон: ' + (error.message || 'попробуй ещё раз.');
        activeRecognition = null;
        render();
      }
    };
    const shuffleWordOptions = (options, answer) => {
      const shuffled = [...options];
      for (let index = shuffled.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
      }
      const answerWords = tokenize(answer).map(normalizeWord);
      if (answerWords.every((word, index) => normalizeWord(shuffled[index]) === word)) {
        [shuffled[0], shuffled[answerWords.length]] = [shuffled[answerWords.length], shuffled[0]];
      }
      return shuffled;
    };
    const pickExerciseSet = (exercises) => {
      const shuffled = [...exercises];
      for (let index = shuffled.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
      }
      return shuffled.slice(0, ${SESSION_EXERCISE_COUNT}).map((exercise) => ({
        ...exercise,
        options: shuffleWordOptions(exercise.options, exercise.answer),
      }));
    };
    const goHome = () => { location.hash = '#/'; };
    const goToExercise = (topicId, index) => {
      location.hash = '#/topic/' + encodeURIComponent(topicId) + '/' + index;
    };
    const currentRoute = () => {
      const parts = decodeURIComponent(location.hash.replace(/^#\\/?/, '')).split('/');
      if (parts[0] !== 'topic' || !parts[1]) return null;
      const topicPool = TOPICS.find((item) => item.id === parts[1]);
      if (!topicPool) return null;
      const exercises = state.exerciseSets[topicPool.id]
        || (state.exerciseSets[topicPool.id] = pickExerciseSet(topicPool.exercises));
      const topic = { ...topicPool, exercises };
      const index = Number.parseInt(parts[2] || '0', 10);
      return { topic, index: Number.isFinite(index) ? Math.max(0, Math.min(index, topic.exercises.length - 1)) : 0 };
    };
    const renderHeader = () => '<header class="header"><p class="brand">Wort für Wort</p><p class="caption">Немецкий — по шагам</p></header>';
    function renderHome() {
      const topics = TOPICS.filter((topic) => topic.level === state.level);
      const pronounsSelected = state.level === 'Местоимения';
      const sectionTitle = pronounsSelected ? 'Местоимения' : 'Уровень ' + state.level;
      const sectionSummary = pronounsSelected
        ? '500 упражнений · 15 случайно за раунд · 150 для ед. числа и 350 для мн. числа'
        : '6 тем · 50 упражнений в банке · 15 случайно за раунд';
      app.innerHTML = renderHeader()
        + '<section class="intro"><p class="eyebrow">ТВОЯ ПРАКТИКА</p><h1>Выбери тему</h1><p class="body-copy">Разбирай грамматику на русском и сразу закрепляй её в предложениях из жизни.</p></section>'
        + '<nav class="level-tabs" aria-label="Уровень немецкого">'
        + LEVELS.map((level) => '<button class="tab" type="button" data-action="level" data-level="' + level + '" aria-pressed="' + (state.level === level) + '">' + level + '</button>').join('')
        + '</nav><section aria-label="Темы: ' + escapeHtml(sectionTitle) + '"><div class="level-heading"><h2>' + escapeHtml(sectionTitle) + '</h2><span>' + escapeHtml(sectionSummary) + '</span></div>'
        + topics.map((topic, index) => '<button class="topic-card" type="button" data-action="open" data-topic="' + escapeHtml(topic.id) + '"><span class="topic-top"><span class="topic-number">' + String(index + 1).padStart(2, '0') + '</span><span class="topic-meta">' + topic.exercises.length + ' заданий</span></span><span class="topic-title">' + escapeHtml(topic.title) + '</span><span class="topic-summary">' + escapeHtml(topic.summary) + '</span></button>').join('')
        + '</section><footer class="footer">Разбирай грамматику на русском и практикуй немецкий в предложениях из жизни.</footer>';
    }
    function renderLesson(topic, index) {
      const exercise = topic.exercises[index];
      const examples = topic.examples.map((example) => '<p class="example">' + escapeHtml(example) + '</p>').join('');
      const reference = topic.reference
        ? '<a class="reference" href="' + escapeHtml(topic.reference.url) + '" target="_blank" rel="noopener noreferrer">Полезно на английском: ' + escapeHtml(topic.reference.label) + '</a>'
        : '';
      const selectedWords = state.selected.map((optionIndex) => {
        const word = exercise.options[optionIndex];
        return '<button class="answer-word" type="button" data-action="remove" data-index="' + optionIndex + '" aria-label="Убрать слово ' + escapeHtml(word) + '"' + (state.feedback ? ' disabled' : '') + '>' + escapeHtml(word) + '</button>';
      }).join(' ');
      const answer = state.selected.length
        ? '<div class="words">' + selectedWords + '</div>'
        : '<span class="placeholder">Нажимай на слова ниже, чтобы собрать ответ</span>';
      const options = exercise.options.map((word, optionIndex) => {
        const selected = state.selected.includes(optionIndex);
        return '<button class="word" type="button" data-action="add" data-index="' + optionIndex + '" aria-label="Добавить слово ' + escapeHtml(word) + '"' + (selected || state.feedback ? ' disabled' : '') + '>' + escapeHtml(word) + '</button>';
      }).join('');
      const speechControls = '<div class="speech-controls"><button class="button speech-button" type="button" data-action="speak"' + (SpeechRecognition ? '' : ' disabled') + '>' + (state.speechListening ? 'Остановить запись' : '🎙 Сказать предложение') + '</button><button class="button play-answer-button" type="button" data-action="play-answer" aria-label="Воспроизвести правильный ответ" title="Воспроизвести правильный ответ"' + (canSynthesizeSpeech && state.hasAttempted ? '' : ' disabled') + '>🔊</button><p class="speech-status" role="status">' + escapeHtml(state.speechStatus) + '</p></div>';
      let feedback = '';
      if (state.feedback) {
        const isCorrect = state.feedback === 'correct';
        feedback = '<div class="feedback ' + (isCorrect ? 'correct' : 'incorrect') + '" role="status"><strong>' + (isCorrect ? 'Верно! Отличная работа.' : 'Пока не совпало') + '</strong>' + (isCorrect ? '<p>Порядок слов и форма глагола верны.</p>' : '<p>Правильный ответ:</p><p class="correct-answer">' + escapeHtml(exercise.answer) + '</p>') + '</div>';
      }
      const actionLabel = state.feedback
        ? index < topic.exercises.length - 1 ? 'Дальше' : 'К темам'
        : 'Проверить ответ';
      const action = '<aside class="exercise-action-bar"><button class="button primary" type="button" data-action="primary">' + actionLabel + '</button></aside>';
      app.innerHTML = renderHeader()
        + '<button class="back" type="button" data-action="home">‹  Все темы</button>'
        + '<section class="lesson-heading"><p class="eyebrow">' + escapeHtml(topic.level) + ' · ГРАММАТИКА</p><h1>' + escapeHtml(topic.title) + '</h1><p class="body-copy">' + escapeHtml(topic.explanation) + '</p></section>'
        + '<section class="info-card"><p class="label">ПРИМЕРЫ</p>' + examples
        + '<div class="tip"><strong>Лайфхак</strong><p>' + escapeHtml(topic.tip) + '</p></div>' + reference + '</section>'
        + '<section class="trainer-heading"><div><p class="label">ТРЕНАЖЁР</p><h2>Собери предложение</h2></div><span class="progress-text">' + (index + 1) + ' / ' + topic.exercises.length + '</span></section>'
        + '<div class="progress-track" role="progressbar" aria-label="Прогресс темы" aria-valuemin="1" aria-valuemax="' + topic.exercises.length + '" aria-valuenow="' + (index + 1) + '"><div class="progress-fill" style="width:' + ((index + 1) / topic.exercises.length * 100) + '%"></div></div>'
        + '<section class="exercise-card"><p class="prompt-label">Переведи на немецкий</p><p class="prompt">' + escapeHtml(exercise.prompt) + '</p>'
        + '<div class="answer-area" aria-label="Твой ответ">' + answer + '</div>' + speechControls + '<div class="words">' + options + '</div>' + feedback + '</section>'
        + '<nav class="navigation" aria-label="Упражнения"><button class="button" type="button" data-action="previous"' + (index === 0 ? ' disabled' : '') + '>Назад</button>'
        + '</nav>' + action;
    }
    function render() {
      const route = currentRoute();
      app.classList.toggle('lesson-page', Boolean(route));
      if (!route) {
        if (location.hash && location.hash !== '#/' && location.hash !== '#') {
          location.hash = '#/';
          return;
        }
        state.selected = [];
        state.feedback = null;
        renderHome();
        return;
      }
      if (route.topic.exercises[route.index].id !== state.exerciseId) {
        stopSpeechRecognition();
        state.selected = [];
        state.feedback = null;
        state.hasAttempted = false;
        state.exerciseId = route.topic.exercises[route.index].id;
        state.speechStatus = SpeechRecognition
          ? 'Нажми и произнеси предложение по-немецки. Распознавание зависит от браузера и может использовать интернет.'
          : 'Голосовой ввод не поддерживается этим браузером. Можно выбрать слова вручную.';
      }
      renderLesson(route.topic, route.index);
    }
    app.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-action]');
      if (!button || button.disabled) return;
      const route = currentRoute();
      switch (button.dataset.action) {
        case 'level':
          state.level = button.dataset.level;
          renderHome();
          break;
        case 'open': {
          const topic = TOPICS.find((item) => item.id === button.dataset.topic);
          if (topic) {
            stopSpeechRecognition();
            state.exerciseSets[topic.id] = pickExerciseSet(topic.exercises);
            goToExercise(topic.id, 0);
            window.scrollTo(0, 0);
          }
          break;
        }
        case 'home':
          stopSpeechRecognition();
          goHome();
          break;
        case 'speak':
          if (state.speechListening) {
            stopSpeechRecognition();
            state.speechStatus = 'Запись остановлена.';
            render();
          } else {
            startSpeechRecognition();
          }
          break;
        case 'play-answer':
          playCorrectAnswer();
          break;
        case 'add':
          state.selected.push(Number(button.dataset.index));
          state.feedback = null;
          render();
          break;
        case 'remove':
          state.selected = state.selected.filter((index) => index !== Number(button.dataset.index));
          state.feedback = null;
          render();
          break;
        case 'primary': {
          if (!route) break;
          if (state.feedback) {
            if (route.index < route.topic.exercises.length - 1) {
              stopSpeechRecognition();
              goToExercise(route.topic.id, route.index + 1);
            } else {
              stopSpeechRecognition();
              goHome();
            }
            break;
          }
          const exercise = route.topic.exercises[route.index];
          const words = state.selected.map((index) => exercise.options[index]);
          state.hasAttempted = true;
          state.feedback = answersMatch(words, exercise.answer) ? 'correct' : 'incorrect';
          render();
          break;
        }
        case 'previous':
          if (!route) break;
          stopSpeechRecognition();
          goToExercise(route.topic.id, route.index - 1);
          break;
      }
    });
    window.addEventListener('hashchange', render);
    render();
  </script>
</body>
</html>
`;

const outputPath = path.join(root, 'index.html');
writeFileSync(outputPath, output, 'utf8');
console.log(`Created ${path.relative(root, outputPath)} with 18 topics at 50 exercises each, 500 pronoun exercises, and ${SESSION_EXERCISE_COUNT} randomly selected per visit.`);
