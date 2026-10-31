export type SpeechWordMatch = {
  selected: number[];
  approximate: { spoken: string; matched: string }[];
  unrecognized: string[];
  exactCount: number;
  answerCount: number;
};

export type SpeechAlternativeMatch = SpeechWordMatch & {
  transcript: string;
};

export type SpeechTextEvaluation = {
  words: {
    spoken: string;
    expected: string | null;
    score: number;
    color: 'green' | 'yellow' | 'orange' | 'red';
    letters: { value: string; color: 'green' | 'yellow' | 'orange' | 'red' | 'neutral' }[];
  }[];
  missing: string[];
};

export function evaluateSpeechText(transcript: string, answer: string): SpeechTextEvaluation {
  const normalize = (word: string) => word
    .toLocaleLowerCase('de-DE')
    .replace(/^[„“"'([{]+/, '')
    .replace(/[.,!?;:…»”"')\]}“]+$/, '');
  const spoken = transcript.trim().split(/\s+/).filter(Boolean);
  const expected = answer.trim().split(/\s+/).filter(Boolean);
  const left = spoken.map((word) => Array.from(normalize(word)));
  const right = expected.map((word) => Array.from(normalize(word)));
  const wordDistance = (first: string[], second: string[]) => {
    let previous = Array.from({ length: second.length + 1 }, (_, index) => index);
    for (let firstIndex = 1; firstIndex <= first.length; firstIndex += 1) {
      const current = [firstIndex];
      for (let secondIndex = 1; secondIndex <= second.length; secondIndex += 1) {
        current[secondIndex] = Math.min(
          current[secondIndex - 1] + 1,
          previous[secondIndex] + 1,
          previous[secondIndex - 1] + (first[firstIndex - 1] === second[secondIndex - 1] ? 0 : 1),
        );
      }
      previous = current;
    }
    return previous[second.length];
  };
  const similarity = (first: string[], second: string[]) => {
    const longest = Math.max(first.length, second.length);
    return longest === 0 ? 1 : 1 - wordDistance(first, second) / longest;
  };
  const rows = left.length + 1;
  const columns = right.length + 1;
  const costs = Array.from({ length: rows }, () => Array<number>(columns).fill(0));
  const steps = Array.from({ length: rows }, () => Array<'match' | 'insert' | 'delete'>(columns).fill('match'));
  for (let row = 1; row < rows; row += 1) {
    costs[row][0] = row * 0.8;
    steps[row][0] = 'insert';
  }
  for (let column = 1; column < columns; column += 1) {
    costs[0][column] = column * 0.8;
    steps[0][column] = 'delete';
  }
  for (let row = 1; row < rows; row += 1) {
    for (let column = 1; column < columns; column += 1) {
      const choices = [
        { cost: costs[row - 1][column - 1] + 1 - similarity(left[row - 1], right[column - 1]), step: 'match' as const },
        { cost: costs[row - 1][column] + 0.8, step: 'insert' as const },
        { cost: costs[row][column - 1] + 0.8, step: 'delete' as const },
      ].sort((first, second) => first.cost - second.cost);
      costs[row][column] = choices[0].cost;
      steps[row][column] = choices[0].step;
    }
  }

  const expectedForSpoken = Array<number | null>(spoken.length).fill(null);
  const matchedExpected = new Set<number>();
  let row = spoken.length;
  let column = expected.length;
  while (row > 0 || column > 0) {
    const step = row === 0 ? 'delete' : column === 0 ? 'insert' : steps[row][column];
    if (step === 'match') {
      expectedForSpoken[row - 1] = column - 1;
      matchedExpected.add(column - 1);
      row -= 1;
      column -= 1;
    } else if (step === 'insert') {
      row -= 1;
    } else {
      column -= 1;
    }
  }

  const words = spoken.map((word, index) => {
    const expectedIndex = expectedForSpoken[index];
    const target = expectedIndex === null ? null : expected[expectedIndex];
    const normalized = left[index];
    const targetLetters = expectedIndex === null ? [] : right[expectedIndex];
    const score = target === null ? 0 : similarity(normalized, targetLetters);
    const color: SpeechTextEvaluation['words'][number]['color'] = score >= 0.9
      ? 'green'
      : score >= 0.75
        ? 'yellow'
        : score >= 0.5
          ? 'orange'
          : 'red';

    let previous = Array.from({ length: targetLetters.length + 1 }, (_, letterIndex) => letterIndex);
    const letterSteps = Array.from(
      { length: normalized.length + 1 },
      () => Array<'match' | 'insert' | 'delete'>(targetLetters.length + 1).fill('match'),
    );
    for (let letterIndex = 1; letterIndex <= normalized.length; letterIndex += 1) {
      letterSteps[letterIndex][0] = 'insert';
    }
    for (let letterIndex = 1; letterIndex <= targetLetters.length; letterIndex += 1) {
      letterSteps[0][letterIndex] = 'delete';
    }
    for (let letterIndex = 1; letterIndex <= normalized.length; letterIndex += 1) {
      const current = [letterIndex];
      for (let targetIndex = 1; targetIndex <= targetLetters.length; targetIndex += 1) {
        const choices = [
          { cost: previous[targetIndex - 1] + (normalized[letterIndex - 1] === targetLetters[targetIndex - 1] ? 0 : 1), step: 'match' as const },
          { cost: current[targetIndex - 1] + 1, step: 'delete' as const },
          { cost: previous[targetIndex] + 1, step: 'insert' as const },
        ].sort((first, second) => first.cost - second.cost);
        current[targetIndex] = choices[0].cost;
        letterSteps[letterIndex][targetIndex] = choices[0].step;
      }
      previous = current;
    }
    const letterColors: ('green' | 'yellow' | 'orange' | 'red')[] = Array(normalized.length).fill('red');
    let letterIndex = normalized.length;
    let targetIndex = targetLetters.length;
    while (letterIndex > 0 || targetIndex > 0) {
      const step = letterIndex === 0 ? 'delete' : targetIndex === 0 ? 'insert' : letterSteps[letterIndex][targetIndex];
      if (step === 'match') {
        letterColors[letterIndex - 1] = normalized[letterIndex - 1] === targetLetters[targetIndex - 1]
          ? 'green'
          : color === 'green' ? 'yellow' : color;
        letterIndex -= 1;
        targetIndex -= 1;
      } else if (step === 'insert') {
        letterColors[letterIndex - 1] = 'red';
        letterIndex -= 1;
      } else {
        targetIndex -= 1;
      }
    }

    let normalizedIndex = 0;
    const letters = Array.from(word).map((value) => {
      const normalizedValue = normalize(value);
      if (!normalizedValue) return { value, color: 'neutral' as const };
      const color = letterColors[normalizedIndex] || 'red';
      normalizedIndex += Array.from(normalizedValue).length;
      return { value, color };
    });

    return {
      spoken: word,
      expected: target,
      score,
      color,
      letters,
    };
  });

  return {
    words,
    missing: expected.filter((_, index) => !matchedExpected.has(index)),
  };
}

export function matchSpokenWords(
  transcript: string,
  options: string[],
  answer: string,
): SpeechWordMatch {
  const normalize = (word: string) => word
    .toLocaleLowerCase('de-DE')
    .replace(/^[„“"'([{]+/, '')
    .replace(/[.,!?;:…»”"')\]}“]+$/, '');
  const editDistance = (left: string, right: string) => {
    let previous = Array.from({ length: right.length + 1 }, (_, index) => index);
    for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
      const current = [leftIndex];
      for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
        current[rightIndex] = Math.min(
          current[rightIndex - 1] + 1,
          previous[rightIndex] + 1,
          previous[rightIndex - 1] + (left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1),
        );
      }
      previous = current;
    }
    return previous[right.length];
  };
  const maxFuzzyDistance = (spoken: string, candidate: string) => {
    const longest = Math.max(spoken.length, candidate.length);
    if (longest < 3) return Number.POSITIVE_INFINITY;
    const maximum = longest >= 8 ? 2 : 1;
    const distance = editDistance(spoken, candidate);
    return distance <= maximum && (longest - distance) / longest >= 0.75
      ? distance
      : Number.POSITIVE_INFINITY;
  };

  const answerOptions = new Set(
    answer.trim().split(/\s+/).map(normalize).map((word) => options.findIndex((option) => normalize(option) === word)),
  );
  const usedOptions = new Set<number>();
  const selected: number[] = [];
  const approximate: SpeechWordMatch['approximate'] = [];
  const unrecognized: string[] = [];
  let exactCount = 0;
  let answerCount = 0;

  for (const spokenWord of transcript.trim().split(/\s+/).filter(Boolean)) {
    const normalizedSpoken = normalize(spokenWord);
    const exactIndex = options.findIndex((option, index) =>
      !usedOptions.has(index) && normalize(option) === normalizedSpoken,
    );
    if (exactIndex !== -1) {
      usedOptions.add(exactIndex);
      selected.push(exactIndex);
      exactCount += 1;
      if (answerOptions.has(exactIndex)) answerCount += 1;
      continue;
    }

    const candidates = [...answerOptions]
      .filter((index) => index >= 0 && !usedOptions.has(index))
      .map((index) => ({
        index,
        distance: maxFuzzyDistance(normalizedSpoken, normalize(options[index])),
      }))
      .filter((candidate) => Number.isFinite(candidate.distance))
      .sort((left, right) => left.distance - right.distance);
    if (candidates.length && (candidates.length === 1 || candidates[0].distance < candidates[1].distance)) {
      const match = candidates[0];
      usedOptions.add(match.index);
      selected.push(match.index);
      approximate.push({ spoken: spokenWord, matched: options[match.index] });
      answerCount += 1;
    } else {
      unrecognized.push(spokenWord);
    }
  }

  return { selected, approximate, unrecognized, exactCount, answerCount };
}

export function matchSpeechAlternatives(
  transcripts: string[],
  options: string[],
  answer: string,
): SpeechAlternativeMatch {
  const matches = transcripts
    .map((transcript) => ({
      transcript,
      ...matchSpokenWords(transcript, options, answer),
      wordCount: transcript.trim().split(/\s+/).filter(Boolean).length,
    }))
    .sort((left, right) =>
      right.answerCount / Math.max(right.wordCount, 1) - left.answerCount / Math.max(left.wordCount, 1)
      || right.answerCount - left.answerCount
      || right.selected.length / Math.max(right.wordCount, 1) - left.selected.length / Math.max(left.wordCount, 1)
      || right.selected.length - left.selected.length
      || right.exactCount - left.exactCount
      || left.approximate.length - right.approximate.length,
    );
  const bestMatch = matches[0];
  return bestMatch
    ? {
      transcript: bestMatch.transcript,
      selected: bestMatch.selected,
      approximate: bestMatch.approximate,
      unrecognized: bestMatch.unrecognized,
      exactCount: bestMatch.exactCount,
      answerCount: bestMatch.answerCount,
    }
    : { transcript: '', selected: [], approximate: [], unrecognized: [], exactCount: 0, answerCount: 0 };
}
