import {
  answersMatch,
  createOptions,
  distractorCount,
  normalizeWord,
  tokenize,
} from '../src/trainer';
import { describe, expect, it } from '@jest/globals';

describe('trainer helpers', () => {
  it('tokenizes whitespace-separated answers', () => {
    expect(tokenize('  Ich  habe Zeit. ')).toEqual(['Ich', 'habe', 'Zeit.']);
  });

  it('ignores capitalization and final punctuation without changing word order', () => {
    expect(answersMatch(['ich', 'HABE', 'Zeit!'], 'Ich habe Zeit.')).toBe(true);
    expect(answersMatch(['Zeit.', 'habe', 'Ich'], 'Ich habe Zeit.')).toBe(false);
    expect(answersMatch(['Ich', 'habe'], 'Ich habe Zeit.')).toBe(false);
  });

  it('builds a word bank with 30 percent distractors rounded down and at least two', () => {
    const options = createOptions('Ich rufe dich an.', ['heute', 'später', 'morgen', 'gleich']);
    expect(distractorCount(4)).toBe(2);
    expect(distractorCount(6)).toBe(2);
    expect(distractorCount(9)).toBe(2);
    expect(distractorCount(10)).toBe(3);
    expect(distractorCount(12)).toBe(3);
    expect(options).toHaveLength(6);
    expect(new Set(options.slice(4)).size).toBe(2);
    expect(options.slice(4)).not.toContain('Ich');
  });

  it('requires enough distractors for the calculated ratio', () => {
    expect(() => createOptions('Ich rufe dich an.', ['Ich', 'heute'])).toThrow(/unique distractors/);
    expect(() => createOptions('Ich rufe dich an.', ['Ich', 'heute', 'morgen'])).not.toThrow();
  });

  it('normalizes punctuation around a word', () => {
    expect(normalizeWord('„Hallo!“')).toBe('hallo');
  });
});
