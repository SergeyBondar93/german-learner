import { fireEvent, render } from '@testing-library/react-native';
import { describe, expect, it, jest } from '@jest/globals';
import { useState } from 'react';
import { AppHeader, LessonScreen, TopicList } from '../App';
import { TOPICS } from '../src/content';
import { normalizeWord } from '../src/trainer';
import { Topic } from '../src/types';

function LessonHarness({ topic }: { topic: Topic }) {
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const exercise = topic.exercises[exerciseIndex];

  return (
    <LessonScreen
      topic={topic}
      exercise={exercise}
      exerciseIndex={exerciseIndex}
      selectedOptions={selectedOptions}
      feedback={feedback}
      onBack={jest.fn()}
      onSelect={(index) => {
        setSelectedOptions((current) => [...current, index]);
        setFeedback(null);
      }}
      onRemove={(index) => {
        setSelectedOptions((current) => current.filter((selected) => selected !== index));
        setFeedback(null);
      }}
      onCheck={() => {
        const answer = selectedOptions.map((index) => exercise.options[index]);
        setFeedback(answer.map(normalizeWord).join(' ') === exercise.answer.split(/\s+/).map(normalizeWord).join(' ') ? 'correct' : 'incorrect');
      }}
      onMove={(index) => {
        setExerciseIndex(index);
        setSelectedOptions([]);
        setFeedback(null);
      }}
    />
  );
}

describe('learning app screens', () => {
  it('shows the topic list grouped by all three levels and opens a selected topic', async () => {
    const onOpen = jest.fn();
    const view = await render(
      <>
        <AppHeader />
        <TopicList onOpen={onOpen} />
      </>,
    );
    expect(view.getByText('Выбери тему')).toBeTruthy();
    expect(view.getByText('A2')).toBeTruthy();
    expect(view.getByText('B1')).toBeTruthy();
    expect(view.getByText('B2')).toBeTruthy();

    await fireEvent.press(view.getByLabelText(`Открыть тему: ${TOPICS[0].title}`));
    expect(onOpen).toHaveBeenCalledWith(TOPICS[0]);
  });

  it('builds and checks the first answer, then advances to the next exercise', async () => {
    const view = await render(<LessonHarness topic={TOPICS[0]} />);
    const exercise = TOPICS[0].exercises[0];

    for (const word of exercise.answer.split(/\s+/)) {
      await fireEvent.press(view.getAllByLabelText(`Добавить слово ${word}`)[0]);
    }
    await fireEvent.press(view.getByText('Проверить ответ'));
    expect(view.getByText('Верно! Отличная работа.')).toBeTruthy();

    await fireEvent.press(view.getByText('Дальше'));
    expect(view.getByText('2 / 15')).toBeTruthy();
    expect(view.getByText(TOPICS[0].exercises[1].prompt)).toBeTruthy();
  });

  it('allows removing a selected word and shows incorrect feedback', async () => {
    const view = await render(<LessonHarness topic={TOPICS[0]} />);
    const exercise = TOPICS[0].exercises[0];
    const firstAnswerWord = exercise.answer.split(/\s+/)[1];
    await fireEvent.press(view.getAllByLabelText(`Добавить слово ${firstAnswerWord}`)[0]);
    await fireEvent.press(view.getByLabelText(`Убрать слово ${firstAnswerWord}`));
    expect(view.getByText('Нажимай на слова ниже, чтобы собрать ответ')).toBeTruthy();

    const answerWords = exercise.answer.split(/\s+/).map(normalizeWord);
    const distractor = exercise.options.find((word) => !answerWords.includes(normalizeWord(word)));
    if (!distractor) {
      throw new Error('Expected the exercise to contain at least one distractor.');
    }
    await fireEvent.press(view.getAllByLabelText(`Добавить слово ${distractor}`)[0]);
    await fireEvent.press(view.getByText('Проверить ответ'));
    expect(view.getByText('Пока не совпало')).toBeTruthy();
  });
});
