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

  it('accepts definite and indefinite articles with the same case ending', () => {
    const options = createOptions('Ich gebe seiner Mutter einen Apfel.', ['heute', 'gleich']);

    expect(options).toContain('den');
    expect(answersMatch(
      ['Ich', 'gebe', 'seiner', 'Mutter', 'den', 'Apfel'],
      'Ich gebe seiner Mutter einen Apfel.',
      options,
    )).toBe(true);
    expect(answersMatch(
      ['Ich', 'gebe', 'seiner', 'Mutter', 'dem', 'Apfel'],
      'Ich gebe seiner Mutter einen Apfel.',
      [...options, 'dem'],
    )).toBe(false);
  });

  it('accepts omitted articles before plural and mass nouns, but not count nouns', () => {
    const pluralAnswer = 'Ich kaufe die Äpfel.';
    expect(answersMatch(
      ['Ich', 'kaufe', 'Äpfel.'],
      pluralAnswer,
      createOptions(pluralAnswer, ['heute', 'gleich']),
    )).toBe(true);

    const massNounAnswer = 'Ich trinke jeden Tag den Kaffee.';
    expect(answersMatch(
      ['Ich', 'trinke', 'jeden', 'Tag', 'Kaffee.'],
      massNounAnswer,
      createOptions(massNounAnswer, ['heute', 'gleich']),
    )).toBe(true);

    const countNounAnswer = 'Ich esse einen Apfel.';
    expect(answersMatch(
      ['Ich', 'esse', 'Apfel.'],
      countNounAnswer,
      createOptions(countNounAnswer, ['heute', 'gleich']),
    )).toBe(false);
  });

  it('accepts dative and accusative noun phrases in either order for ditransitive verbs', () => {
    const answer = 'Ich gebe seiner Mutter einen Apfel.';
    const options = createOptions(answer, ['heute', 'gleich']);

    expect(answersMatch(
      ['Ich', 'gebe', 'einen', 'Apfel', 'seiner', 'Mutter'],
      answer,
      options,
    )).toBe(true);
    expect(answersMatch(
      ['Ich', 'gebe', 'seiner', 'Apfel', 'einen', 'Mutter'],
      answer,
      options,
    )).toBe(false);
    expect(answersMatch(
      ['Ich', 'sehe', 'einen', 'Apfel', 'seiner', 'Mutter'],
      'Ich sehe seiner Mutter einen Apfel.',
      options,
    )).toBe(false);
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

  it('rotates topical distractors across authored exercises', () => {
    const answer = 'Ich kaufe heute Brot.';
    const distractors = ['morgen', 'gestern', 'Milch', 'Käse'];
    const firstOptions = createOptions(answer, distractors, 0);
    const nextOptions = createOptions(answer, distractors, 1);

    expect(firstOptions.slice(4)).toEqual(['morgen', 'gestern']);
    expect(nextOptions.slice(4)).toEqual(['gestern', 'Milch']);
    expect(nextOptions.slice(0, 4)).toEqual(tokenize(answer));
  });

  it('normalizes punctuation around a word', () => {
    expect(normalizeWord('„Hallo!“')).toBe('hallo');
  });
});
