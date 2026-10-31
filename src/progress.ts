export type ProgressStorage = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

export function createProgressStore(storage: ProgressStorage) {
  const storageKey = 'wort-fuer-wort-progress-v1';

  const isProgressRecord = (value: unknown): value is Record<string, string[]> =>
    typeof value === 'object'
    && value !== null
    && !Array.isArray(value)
    && Object.values(value).every(
      (exerciseIds) => Array.isArray(exerciseIds) && exerciseIds.every((id) => typeof id === 'string'),
    );

  const read = (): Record<string, string[]> => {
    const stored = storage.getItem(storageKey);
    if (stored === null) return {};

    const value: unknown = JSON.parse(stored);
    if (!isProgressRecord(value)) {
      throw new Error('Сохранённый прогресс повреждён. Очисти прогресс и попробуй снова.');
    }

    return value;
  };

  return {
    getCompletedCount(topicId: string): number {
      return new Set(read()[topicId] || []).size;
    },
    markCompleted(topicId: string, exerciseId: string): void {
      const progress = read();
      const completed = new Set(progress[topicId] || []);
      completed.add(exerciseId);
      progress[topicId] = [...completed];
      storage.setItem(storageKey, JSON.stringify(progress));
    },
    clear(): void {
      storage.removeItem(storageKey);
    },
  };
}
