import { answersMatch, createOptions, normalizeWord, tokenize } from '../src/trainer';
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

  it('builds a word bank with exactly one unique distractor per answer word', () => {
    const options = createOptions('Ich rufe dich an.', ['heute', 'später', 'morgen', 'gleich']);
    expect(options).toHaveLength(8);
    expect(new Set(options.slice(4)).size).toBe(4);
    expect(options.slice(4)).not.toContain('Ich');
  });

  it('fails loudly when there are not enough usable distractors', () => {
    expect(() => createOptions('Ich rufe dich an.', ['Ich', 'heute'])).toThrow(/unique distractors/);
  });

  it('normalizes punctuation around a word', () => {
    expect(normalizeWord('„Hallo!“')).toBe('hallo');
  });
});
