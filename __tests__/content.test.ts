import { TOPICS, getTopicsByLevel, LEVELS } from '../src/content';
import { AUTHORED_EXERCISE_POOLS } from '../src/authoredExercisePools';
import { validateContent } from '../src/contentValidation';
import {
  getPronounExerciseCounts,
  PRONOUN_EXERCISES,
  validatePronounExercises,
} from '../src/pronounExercises';
import { distractorCount, tokenize } from '../src/trainer';
import { describe, expect, it } from '@jest/globals';

describe('learning content', () => {
  it('has 50 unique, correctly sized hand-authored exercises for every topic', () => {
    expect(Object.keys(AUTHORED_EXERCISE_POOLS).sort()).toEqual(
      TOPICS.map(({ id }) => id).sort(),
    );

    for (const topic of TOPICS) {
      const additions = AUTHORED_EXERCISE_POOLS[topic.id];
      expect(additions).toHaveLength(35);
      const exercises = [
        ...topic.exercises.map(({ prompt, answer }) => [prompt, answer] as const),
        ...additions,
      ];
      expect(exercises).toHaveLength(50);
      expect(new Set(exercises.map(([prompt]) => prompt)).size).toBe(50);
      expect(
        new Set(exercises.map(([prompt, answer]) => `${prompt}\u0000${answer}`)).size,
      ).toBe(50);

      for (const [prompt, answer] of exercises) {
        expect(prompt).toMatch(/[\u0400-\u04FF]/);
        expect(tokenize(prompt).length).toBeGreaterThanOrEqual(4);
        expect(tokenize(prompt).length).toBeLessThanOrEqual(12);
        expect(tokenize(answer).length).toBeGreaterThanOrEqual(4);
        expect(tokenize(answer).length).toBeLessThanOrEqual(12);
      }
    }
  });

  it('contains the expected topic and exercise counts at each level', () => {
    const expectedCounts = { A2: 8, B1: 9, B2: 8 };
    for (const level of LEVELS) {
      expect(getTopicsByLevel(level)).toHaveLength(expectedCounts[level]);
      expect(getTopicsByLevel(level).reduce((total, topic) => total + topic.exercises.length, 0))
        .toBe(expectedCounts[level] * 15);
    }
  });

  it('covers the grammar topics added from the A2–B2 comparison', () => {
    expect(TOPICS.map(({ id }) => id)).toEqual(expect.arrayContaining([
      'a2-adjektivdeklination',
      'a2-komparativ-superlativ',
      'b1-verben-mit-praepositionen',
      'b1-indirekte-fragen',
      'b1-temporalsaetze',
      'b2-genitiv',
      'b2-partizipialattribute',
    ]));
  });

  it('satisfies all lesson and word-bank requirements', () => {
    expect(() => validateContent(TOPICS)).not.toThrow();
  });

  it('contains exactly 500 pronoun exercises with the requested singular/plural split', () => {
    expect(() => validatePronounExercises()).not.toThrow();
    expect(PRONOUN_EXERCISES).toHaveLength(500);
    expect(getPronounExerciseCounts()).toMatchObject({
      counts: { singular: 150, plural: 350 },
      byGroup: {
        ich: 30,
        du: 30,
        er: 30,
        'sie-singular': 30,
        es: 30,
        wir: 90,
        ihr: 90,
        'sie-plural': 90,
        'sie-formal': 80,
      },
      byCase: { nominative: 167, accusative: 167, dative: 166 },
    });
  });

  it('keeps every pronoun exercise unique and applies the distractor ratio', () => {
    const sentencePairs = PRONOUN_EXERCISES.map(
      ({ prompt, answer }) => `${prompt}\u0000${answer}`,
    );
    expect(new Set(sentencePairs).size).toBe(500);

    for (const exercise of PRONOUN_EXERCISES) {
      const answerWords = tokenize(exercise.answer);
      expect(tokenize(exercise.prompt).length).toBeGreaterThanOrEqual(4);
      expect(tokenize(exercise.prompt).length).toBeLessThanOrEqual(12);
      expect(answerWords.length).toBeGreaterThanOrEqual(4);
      expect(answerWords.length).toBeLessThanOrEqual(12);
      expect(exercise.options).toHaveLength(answerWords.length + distractorCount(answerWords.length));
      for (const word of answerWords) {
        expect(exercise.options).toContain(word);
      }
    }
  });
});
