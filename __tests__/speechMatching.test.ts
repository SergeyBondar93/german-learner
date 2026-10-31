import { describe, expect, it } from '@jest/globals';
import {
  evaluateSpeechText,
  matchSpeechAlternatives,
  matchSpokenWords,
} from '../src/speechMatching';

describe('speech matching', () => {
  it('matches a slightly misrecognized long word to an answer option', () => {
    const result = matchSpokenWords(
      'Ich habe meine Geldbörze',
      ['Ich', 'habe', 'meine', 'Geldbörse.', 'Heute'],
      'Ich habe meine Geldbörse.',
    );

    expect(result.selected).toEqual([0, 1, 2, 3]);
    expect(result.approximate).toEqual([{ spoken: 'Geldbörze', matched: 'Geldbörse.' }]);
    expect(result.unrecognized).toEqual([]);
  });

  it('leaves a fuzzy match unresolved when answer words are equally close', () => {
    const result = matchSpokenWords('Kutter', ['Mutter', 'Butter'], 'Mutter Butter');

    expect(result.selected).toEqual([]);
    expect(result.unrecognized).toEqual(['Kutter']);
  });

  it('does not guess between very short words', () => {
    const result = matchSpokenWords('du', ['zu', 'ich'], 'zu ich');

    expect(result.selected).toEqual([]);
    expect(result.unrecognized).toEqual(['du']);
  });

  it('keeps exact distractor matches and chooses the best recognition alternative', () => {
    const result = matchSpeechAlternatives(
      ['Ich habe meine Geldbörze', 'Ich habe meine Geldbörse'],
      ['Ich', 'habe', 'meine', 'Geldbörse.', 'Geldbörze'],
      'Ich habe meine Geldbörse.',
    );

    expect(result.transcript).toBe('Ich habe meine Geldbörse');
    expect(result.selected).toEqual([0, 1, 2, 3]);
    expect(result.approximate).toEqual([]);
  });

  it('colors exact words and matching letters green', () => {
    const result = evaluateSpeechText('Ich habe Zeit.', 'Ich habe Zeit.');

    expect(result.words.map((word) => word.color)).toEqual(['green', 'green', 'green']);
    expect(
      result.words[2].letters
        .filter((letter) => letter.color !== 'neutral')
        .every((letter) => letter.color === 'green'),
    ).toBe(true);
    expect(result.missing).toEqual([]);
  });

  it('shows misspelled letters and word similarity separately', () => {
    const result = evaluateSpeechText('Ich habe Geldbörze', 'Ich habe Geldbörse.');
    const misspelled = result.words[2];

    expect(misspelled.expected).toBe('Geldbörse.');
    expect(misspelled.color).toBe('yellow');
    expect(misspelled.letters.map((letter) => letter.color)).toContain('yellow');
    expect(result.words.slice(0, 2).map((word) => word.color)).toEqual(['green', 'green']);
  });

  it('aligns later words correctly after a word is omitted', () => {
    const result = evaluateSpeechText('Ich heute Zeit', 'Ich habe heute keine Zeit.');

    expect(result.words.map((word) => word.expected)).toEqual(['Ich', 'heute', 'Zeit.']);
    expect(result.missing).toEqual(['habe', 'keine']);
  });

  it('marks recognized words that do not match the answer in red', () => {
    const result = evaluateSpeechText('Ich habe Marmelade', 'Ich habe Geldbörse.');

    expect(result.words[2].color).toBe('red');
    expect(result.words[2].expected).toBe('Geldbörse.');
  });

  it('uses orange for words with noticeable but partial spelling similarity', () => {
    const result = evaluateSpeechText('Geldbohne', 'Geldbörse');

    expect(result.words[0].color).toBe('orange');
    expect(result.words[0].score).toBeGreaterThanOrEqual(0.5);
    expect(result.words[0].letters.some((letter) => letter.color === 'orange')).toBe(true);
  });
});
