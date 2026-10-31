import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader, LessonScreen, styles } from '../../../App';
import { TOPICS } from '../../content';
import { answersMatch } from '../../trainer';
import { Exercise } from '../../types';

export default function LessonRoute() {
  const { topicId } = useLocalSearchParams<{ topicId: string }>();
  const router = useRouter();
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);

  const topic = TOPICS.find((item) => item.id === topicId);
  if (!topic) {
    return <Redirect href="/" />;
  }

  const exerciseCount = topic.exercises.length;
  const exercise = topic.exercises[exerciseIndex];

  function selectOption(optionIndex: number) {
    if (feedback === 'correct' || selectedOptions.includes(optionIndex)) {
      return;
    }
    setSelectedOptions((current) => [...current, optionIndex]);
    setFeedback(null);
  }

  function removeOption(optionIndex: number) {
    if (feedback === 'correct') {
      return;
    }
    setSelectedOptions((current) => current.filter((index) => index !== optionIndex));
    setFeedback(null);
  }

  function checkAnswer(currentExercise: Exercise) {
    const chosenWords = selectedOptions.map((index) => currentExercise.options[index]);
    setFeedback(answersMatch(chosenWords, currentExercise.answer) ? 'correct' : 'incorrect');
  }

  function moveToExercise(nextIndex: number) {
    if (nextIndex < 0 || nextIndex >= exerciseCount) {
      return;
    }
    setExerciseIndex(nextIndex);
    setSelectedOptions([]);
    setFeedback(null);
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
        <AppHeader />
        <LessonScreen
          topic={topic}
          exercise={exercise}
          exerciseIndex={exerciseIndex}
          selectedOptions={selectedOptions}
          feedback={feedback}
          onBack={() => router.replace('/')}
          onSelect={selectOption}
          onRemove={removeOption}
          onCheck={() => checkAnswer(exercise)}
          onMove={moveToExercise}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
