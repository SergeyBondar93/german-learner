import { describe, expect, it } from '@jest/globals';
import { createProgressStore } from '../src/progress';

function createMemoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
}

describe('progress store', () => {
  it('counts completed exercises once per topic and persists them', () => {
    const storage = createMemoryStorage();
    const progress = createProgressStore(storage);

    progress.markCompleted('a2-perfekt', 'exercise-1');
    progress.markCompleted('a2-perfekt', 'exercise-1');
    progress.markCompleted('a2-perfekt', 'exercise-2');
    progress.markCompleted('b1-passive', 'exercise-1');

    expect(progress.getCompletedCount('a2-perfekt')).toBe(2);
    expect(progress.getCompletedCount('b1-passive')).toBe(1);
    expect(createProgressStore(storage).getCompletedCount('a2-perfekt')).toBe(2);
  });

  it('clears only stored exercise progress', () => {
    const storage = createMemoryStorage();
    storage.setItem('another-app-setting', 'keep');
    const progress = createProgressStore(storage);
    progress.markCompleted('a2-perfekt', 'exercise-1');

    progress.clear();

    expect(progress.getCompletedCount('a2-perfekt')).toBe(0);
    expect(storage.getItem('another-app-setting')).toBe('keep');
  });

  it('rejects malformed saved progress instead of misreporting its count', () => {
    const storage = createMemoryStorage();
    storage.setItem('wort-fuer-wort-progress-v1', '{"a2-perfekt":[1]}');

    expect(() => createProgressStore(storage).getCompletedCount('a2-perfekt'))
      .toThrow('Сохранённый прогресс повреждён');
  });
});
