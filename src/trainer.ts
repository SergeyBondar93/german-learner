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

export function distractorCount(answerWordCount: number): number {
  return Math.max(2, Math.floor(answerWordCount * 0.3));
}

export function createOptions(
  answer: string,
  distractors: string[],
): string[] {
  const answerWords = tokenize(answer);
  const requiredDistractorCount = distractorCount(answerWords.length);
  const correctWords = new Set(answerWords.map(normalizeWord));
  const uniqueDistractors = Array.from(
    new Set(distractors.filter((word) => !correctWords.has(normalizeWord(word)))),
  );

  if (uniqueDistractors.length < requiredDistractorCount) {
    throw new Error(
      `Need ${requiredDistractorCount} unique distractors for "${answer}", got ${uniqueDistractors.length}.`,
    );
  }

  return [...answerWords, ...uniqueDistractors.slice(0, requiredDistractorCount)];
}
