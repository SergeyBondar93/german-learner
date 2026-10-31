import { describe, expect, it } from '@jest/globals';
import {
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

});
