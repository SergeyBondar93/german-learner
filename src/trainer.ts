export function tokenize(sentence: string): string[] {
  return sentence.trim().split(/\s+/).filter(Boolean);
}

export function normalizeWord(word: string): string {
  return word
    .toLocaleLowerCase('de-DE')
    .replace(/^[„“"'([{]+/, '')
    .replace(/[.,!?;:…»”"')\]}“]+$/, '');
}

export const ARTICLE_ALTERNATIVES: Record<string, string> = {
  einen: 'den',
  den: 'einen',
  einem: 'dem',
  dem: 'einem',
  eines: 'des',
  des: 'eines',
};

export const DATIVE_ARTICLES = new Set([
  'dem', 'einem', 'meinem', 'deinem', 'seinem', 'ihrem', 'unserem', 'eurem',
  'keinem', 'diesem', 'jenem', 'welchem',
  'der', 'einer', 'meiner', 'deiner', 'seiner', 'ihrer', 'unserer', 'eurer',
  'keiner', 'dieser', 'jener', 'welcher',
]);

export const ACCUSATIVE_ARTICLES = new Set([
  'den', 'einen', 'meinen', 'deinen', 'seinen', 'ihren', 'unseren', 'euren',
  'keinen', 'diesen', 'jenen', 'welchen',
  'die', 'eine', 'meine', 'deine', 'seine', 'ihre', 'unsere', 'eure',
  'diese', 'jene', 'welche',
  'das', 'ein', 'mein', 'dein', 'sein', 'ihr', 'unser', 'euer', 'kein',
  'dieses', 'jenes', 'welches',
]);

export const DITRANSITIVE_VERBS = new Set([
  'gebe', 'gibst', 'gibt', 'geben', 'gebt', 'gab', 'gaben', 'gegeben',
  'schenke', 'schenkst', 'schenkt', 'schenken', 'schenkte', 'geschenkt',
  'schicke', 'schickst', 'schickt', 'schicken', 'schickte', 'geschickt',
  'zeige', 'zeigst', 'zeigt', 'zeigen', 'zeigte', 'gezeigt',
  'bringe', 'bringst', 'bringt', 'bringen', 'brachte', 'gebracht',
  'leihe', 'leihst', 'leiht', 'leihen', 'lieh', 'geliehen',
  'erkläre', 'erklärst', 'erklärt', 'erklären', 'erklärte',
  'empfehle', 'empfiehlst', 'empfiehlt', 'empfehlen', 'empfohlen',
  'biete', 'bietest', 'bietet', 'bieten', 'bot', 'boten', 'angeboten',
  'sende', 'sendest', 'sendet', 'senden', 'sandte', 'gesendet',
  'schreibe', 'schreibst', 'schreibt', 'schreiben', 'schrieb', 'geschrieben',
  'erzähle', 'erzählst', 'erzählt', 'erzählen', 'erzählte', 'erzählt',
  'serviere', 'servierst', 'serviert', 'servieren',
]);

export const ARTICLE_WORDS = new Set([
  'der', 'die', 'das', 'den', 'dem', 'des',
  'ein', 'eine', 'einen', 'einem', 'einer', 'eines',
]);

export const ARTICLELESS_PLURALS = new Set([
  'Äpfel', 'Anträge', 'Angebote', 'Antworten', 'Arbeiten', 'Ärzte', 'Aufzüge',
  'Ausflüge', 'Autobusse', 'Bahnsteige', 'Bälle', 'Bänke', 'Berge', 'Besucher',
  'Bewohner', 'Bewerbungen', 'Briefe', 'Brücken', 'Bücher', 'Busse', 'Dinge',
  'Dokumente', 'Eier', 'Eltern', 'Fahrgäste', 'Fahrkarten', 'Fahrzeuge',
  'Fehler', 'Fenster', 'Flaschen', 'Flüge', 'Fragen', 'Freunde', 'Gäste',
  'Gebäude', 'Geschäfte', 'Gespräche', 'Getränke', 'Gläser', 'Gründe',
  'Handys', 'Häuser', 'Heizungen', 'Hotels', 'Hunde', 'Informationen',
  'Instrumente', 'Karten', 'Kinder', 'Kollegen', 'Kolleginnen', 'Koffer',
  'Kunden', 'Kündigungen', 'Läden', 'Leute', 'Lichter', 'Lösungen',
  'Mitarbeiter', 'Mitarbeiterinnen', 'Möglichkeiten', 'Nachbarn', 'Nachrichten',
  'Nummern', 'Obstsorten', 'Orte', 'Papiere', 'Parks', 'Patienten',
  'Personen', 'Pflanzen', 'Probleme', 'Produkte', 'Prüfungen', 'Rechnungen',
  'Reisen', 'Restaurants', 'Rückgaben', 'Sachen', 'Schlüssel', 'Schränke',
  'Schuhe', 'Seiten', 'Städte', 'Stellen', 'Stellenangebote', 'Stühle',
  'Tage', 'Taschen', 'Tassen', 'Teams', 'Teilnehmer', 'Teilnehmerinnen',
  'Termine', 'Tickets', 'Tische', 'Türen', 'Unterlagen', 'Untersuchungen',
  'Urlaube', 'Varianten', 'Verträge', 'Vorschläge', 'Wagen', 'Wände',
  'Wohnungen', 'Wörter', 'Züge',
].map((word) => word.toLocaleLowerCase('de-DE')));

export const ARTICLELESS_MASS_NOUNS = new Set([
  'Abendessen', 'Arbeit', 'Bargeld', 'Benzin', 'Bier', 'Brot', 'Butter',
  'Essen', 'Fleisch', 'Frühstück', 'Geld', 'Gepäck', 'Gemüse', 'Getreide',
  'Gold', 'Holz', 'Kaffee', 'Käse', 'Lärm', 'Luft', 'Mehl', 'Milch',
  'Mittagessen', 'Musik', 'Öl', 'Obst', 'Papier', 'Pfeffer', 'Reis', 'Regen',
  'Salz', 'Schnee', 'Strom', 'Tee', 'Verkehr', 'Wasser', 'Wein', 'Wetter',
  'Zeit', 'Zucker',
].map((word) => word.toLocaleLowerCase('de-DE')));

export function getOptionalArticleIndexes(words: string[]): Set<number> {
  const normalized = words.map(normalizeWord);
  const optional = new Set<number>();
  for (let index = 0; index + 1 < normalized.length; index += 1) {
    if (!ARTICLE_WORDS.has(normalized[index])) continue;
    const followingWord = normalized[index + 1];
    if (ARTICLELESS_PLURALS.has(followingWord) || ARTICLELESS_MASS_NOUNS.has(followingWord)) {
      optional.add(index);
    }
  }
  return optional;
}

export function getDativeAccusativeReordering(
  originalWords: string[],
  normalizedWords: string[],
): string[][] {
  if (!normalizedWords.some((word) => DITRANSITIVE_VERBS.has(word))) {
    return [];
  }

  const phraseEnds = (start: number): number => {
    if (start + 1 >= normalizedWords.length) return -1;
    let end = start + 2;
    while (
      end < normalizedWords.length
      && /^[a-zäöüß]/.test(originalWords[end])
      && /(?:e|en|em|er|es)$/.test(normalizedWords[end])
      && !DATIVE_ARTICLES.has(normalizedWords[end])
      && !ACCUSATIVE_ARTICLES.has(normalizedWords[end])
    ) {
      end += 1;
    }
    return end;
  };
  const isDative = (word: string) => DATIVE_ARTICLES.has(word);
  const isAccusative = (word: string) => ACCUSATIVE_ARTICLES.has(word);

  for (let firstStart = 0; firstStart < normalizedWords.length; firstStart += 1) {
    const firstEnd = phraseEnds(firstStart);
    if (firstEnd < 0 || firstEnd >= normalizedWords.length) continue;

    const secondStart = firstEnd;
    const secondEnd = phraseEnds(secondStart);
    if (secondEnd < 0) continue;

    const firstIsDativeAccusativePair =
      isDative(normalizedWords[firstStart]) && isAccusative(normalizedWords[secondStart]);
    const firstIsAccusativeDativePair =
      isAccusative(normalizedWords[firstStart]) && isDative(normalizedWords[secondStart]);
    if (!firstIsDativeAccusativePair && !firstIsAccusativeDativePair) continue;

    return [[
      ...normalizedWords.slice(0, firstStart),
      ...normalizedWords.slice(secondStart, secondEnd),
      ...normalizedWords.slice(firstStart, firstEnd),
      ...normalizedWords.slice(secondEnd),
    ]];
  }
  return [];
}

export function answersMatch(
  selected: string[],
  answer: string,
  options?: string[],
): boolean {
  const originalExpected = tokenize(answer);
  const expected = originalExpected.map(normalizeWord);
  const allowedAlternatives = new Set((options ?? []).map(normalizeWord));
  const reorderedAnswers = getDativeAccusativeReordering(originalExpected, expected);

  const matchesTokens = (candidate: string[]) => {
    const optionalArticleIndexes = getOptionalArticleIndexes(candidate);
    const matchesFrom = (expectedIndex: number, selectedIndex: number): boolean => {
      if (expectedIndex === candidate.length) return selectedIndex === selected.length;
      if (
        optionalArticleIndexes.has(expectedIndex)
        && matchesFrom(expectedIndex + 1, selectedIndex)
      ) {
        return true;
      }
      if (selectedIndex === selected.length) return false;

      const selectedWord = normalizeWord(selected[selectedIndex]);
      const expectedWord = candidate[expectedIndex];
      const alternative = ARTICLE_ALTERNATIVES[expectedWord];
      const wordMatches = selectedWord === expectedWord
        || (alternative === selectedWord && allowedAlternatives.has(selectedWord));
      return wordMatches && matchesFrom(expectedIndex + 1, selectedIndex + 1);
    };

    return matchesFrom(0, 0);
  };

  return matchesTokens(expected) || reorderedAnswers.some(matchesTokens);
}

export function distractorCount(answerWordCount: number): number {
  return Math.max(2, Math.floor(answerWordCount * 0.3));
}

export function createOptions(
  answer: string,
  distractors: string[],
  distractorOffset = 0,
): string[] {
  const answerWords = tokenize(answer);
  const requiredDistractorCount = distractorCount(answerWords.length);
  const correctWords = new Set(answerWords.map(normalizeWord));
  const articleAlternatives = answerWords
    .map((word) => ARTICLE_ALTERNATIVES[normalizeWord(word)])
    .filter((word): word is string => Boolean(word));
  const topicalDistractors = Array.from(new Set(distractors))
    .filter((word) => !correctWords.has(normalizeWord(word)));
  const offset = topicalDistractors.length
    ? ((Math.trunc(distractorOffset) % topicalDistractors.length) + topicalDistractors.length)
      % topicalDistractors.length
    : 0;
  const rotatedDistractors = [
    ...topicalDistractors.slice(offset),
    ...topicalDistractors.slice(0, offset),
  ];
  const uniqueDistractors = Array.from(
    new Set([...articleAlternatives, ...rotatedDistractors]),
  ).filter((word) => !correctWords.has(normalizeWord(word)));

  if (uniqueDistractors.length < requiredDistractorCount) {
    throw new Error(
      `Need ${requiredDistractorCount} unique distractors for "${answer}", got ${uniqueDistractors.length}.`,
    );
  }

  return [...answerWords, ...uniqueDistractors.slice(0, requiredDistractorCount)];
}
