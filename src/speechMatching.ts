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
