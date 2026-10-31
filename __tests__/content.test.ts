import { TOPICS, getTopicsByLevel, LEVELS } from '../src/content';
import { validateContent } from '../src/contentValidation';
import { describe, expect, it } from '@jest/globals';

describe('learning content', () => {
  it('contains six topics and 90 exercises at each level', () => {
    for (const level of LEVELS) {
      expect(getTopicsByLevel(level)).toHaveLength(6);
      expect(getTopicsByLevel(level).reduce((total, topic) => total + topic.exercises.length, 0)).toBe(90);
    }
  });

  it('satisfies all lesson and word-bank requirements', () => {
    expect(() => validateContent(TOPICS)).not.toThrow();
  });
});
