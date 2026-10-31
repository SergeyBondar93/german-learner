export function tokenize(sentence: string): string[] {
  return sentence.trim().split(/\s+/).filter(Boolean);
}

export function normalizeWord(word: string): string {
  return word
    .toLocaleLowerCase('de-DE')
    .replace(/^[„“"'([{]+/, '')
    .replace(/[.,!?;:…»”"')\]}“]+$/, '');
}

export function answersMatch(selected: string[], answer: string): boolean {
  const expected = tokenize(answer).map(normalizeWord);
  return (
    selected.length === expected.length &&
    selected.every((word, index) => normalizeWord(word) === expected[index])
  );
}

export function createOptions(
  answer: string,
  distractors: string[],
): string[] {
  const answerWords = tokenize(answer);
  const correctWords = new Set(answerWords.map(normalizeWord));
  const uniqueDistractors = Array.from(
    new Set(distractors.filter((word) => !correctWords.has(normalizeWord(word)))),
  );

  if (uniqueDistractors.length < answerWords.length) {
    throw new Error(
      `Need ${answerWords.length} unique distractors for "${answer}", got ${uniqueDistractors.length}.`,
    );
  }

  return [...answerWords, ...uniqueDistractors.slice(0, answerWords.length)];
}
