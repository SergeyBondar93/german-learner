import { Exercise, Level, Topic } from './types';
import { distractorCount, normalizeWord, tokenize } from './trainer';

const REQUIRED_LEVELS: Level[] = ['A2', 'B1', 'B2'];
const EXPECTED_TOPIC_COUNTS: Record<Level, number> = {
  A2: 8,
  B1: 9,
  B2: 8,
};

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function validateExercise(exercise: Exercise, topic: Topic): void {
  const label = `${topic.id}/${exercise.id}`;
  const answerWords = tokenize(exercise.answer);
  const promptWords = tokenize(exercise.prompt);

  assert(promptWords.length >= 4 && promptWords.length <= 12, `${label}: prompt must contain 4–12 words.`);
  assert(/[\u0400-\u04FF]/.test(exercise.prompt), `${label}: prompt must be in Russian.`);
  assert(answerWords.length >= 4 && answerWords.length <= 12, `${label}: answer must contain 4–12 words.`);
  const expectedDistractorCount = distractorCount(answerWords.length);
  assert(
    exercise.options.length === answerWords.length + expectedDistractorCount,
    `${label}: expected ${answerWords.length + expectedDistractorCount} options, received ${exercise.options.length}.`,
  );

  const normalizedOptions = exercise.options.map(normalizeWord);
  const answerCounts = countWords(answerWords.map(normalizeWord));
  const optionCounts = countWords(normalizedOptions);
  for (const [word, count] of answerCounts) {
    assert(
      (optionCounts.get(word) ?? 0) >= count,
      `${label}: answer word "${word}" is missing from options.`,
    );
  }

  const distractors = normalizedOptions.filter((word) => !answerCounts.has(word));
  assert(distractors.length === expectedDistractorCount, `${label}: expected ${expectedDistractorCount} distractors.`);
  assert(new Set(distractors).size === distractors.length, `${label}: distractors must be unique.`);
  assert(exercise.id.length > 0, `${label}: exercise id must not be empty.`);
}

function countWords(words: string[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const word of words) {
    counts.set(word, (counts.get(word) ?? 0) + 1);
  }
  return counts;
}

export function validateContent(topics: Topic[]): void {
  assert(topics.length === 25, `Expected 25 topics, received ${topics.length}.`);
  const ids = new Set(topics.map((topic) => topic.id));
  assert(ids.size === topics.length, 'Topic ids must be unique.');

  for (const level of REQUIRED_LEVELS) {
    const levelTopics = topics.filter((topic) => topic.level === level);
    assert(
      levelTopics.length === EXPECTED_TOPIC_COUNTS[level],
      `Expected ${EXPECTED_TOPIC_COUNTS[level]} topics for ${level}, received ${levelTopics.length}.`,
    );
  }

  for (const topic of topics) {
    assert(topic.title.trim().length > 0, `${topic.id}: title must not be empty.`);
    assert(topic.summary.trim().length > 0, `${topic.id}: summary must not be empty.`);
    assert(topic.explanation.trim().length > 0, `${topic.id}: explanation must not be empty.`);
    assert(topic.examples.length > 0, `${topic.id}: at least one example is required.`);
    assert(topic.tip.trim().length > 0, `${topic.id}: a memory tip is required.`);
    assert(topic.exercises.length === 15, `${topic.id}: expected 15 exercises, received ${topic.exercises.length}.`);
    if (topic.reference) {
      assert(/^https:\/\/.+/.test(topic.reference.url), `${topic.id}: reference must use HTTPS.`);
    }

    const exerciseIds = new Set(topic.exercises.map((exercise) => exercise.id));
    assert(exerciseIds.size === topic.exercises.length, `${topic.id}: exercise ids must be unique.`);
    topic.exercises.forEach((exercise) => validateExercise(exercise, topic));
  }
}
