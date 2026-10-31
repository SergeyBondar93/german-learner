import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { LEVELS, TOPICS } from './src/content';
import { Exercise, Topic } from './src/types';

const COLORS = {
  background: '#F5F7FB',
  surface: '#FFFFFF',
  ink: '#182230',
  muted: '#667085',
  accent: '#3657D6',
  accentLight: '#E8EDFF',
  border: '#DDE3EE',
  success: '#16794A',
  successLight: '#E7F6EE',
  error: '#B42318',
  errorLight: '#FEECEB',
};

export function AppHeader() {
  return (
    <View style={styles.header}>
      <Text style={styles.brand}>Wort für Wort</Text>
      <Text style={styles.headerCaption}>Немецкий — по шагам</Text>
    </View>
  );
}

export function TopicList({ onOpen }: { onOpen: (topic: Topic) => void }) {
  return (
    <>
      <View style={styles.intro}>
        <Text style={styles.eyebrow}>ТВОЯ ПРАКТИКА</Text>
        <Text style={styles.pageTitle}>Выбери тему</Text>
        <Text style={styles.bodyText}>
          Разбирай грамматику на русском и сразу закрепляй её в предложениях из жизни.
        </Text>
      </View>
      {LEVELS.map((level) => {
        const topics = TOPICS.filter((topic) => topic.level === level);
        return (
          <View key={level} style={styles.levelSection}>
            <View style={styles.levelHeading}>
              <Text style={styles.levelTitle}>{level}</Text>
              <Text style={styles.levelCaption}>{topics.length} тем · 15 упражнений в каждой</Text>
            </View>
            {topics.map((topic, index) => (
              <Pressable
                key={topic.id}
                accessibilityRole="button"
                accessibilityLabel={`Открыть тему: ${topic.title}`}
                onPress={() => onOpen(topic)}
                style={({ pressed }) => [styles.topicCard, pressed && styles.pressed]}
              >
                <View style={styles.topicCardTop}>
                  <Text style={styles.topicNumber}>{String(index + 1).padStart(2, '0')}</Text>
                  <Text style={styles.topicMeta}>{topic.exercises.length} заданий</Text>
                </View>
                <Text style={styles.topicTitle}>{topic.title}</Text>
                <Text style={styles.topicSummary}>{topic.summary}</Text>
              </Pressable>
            ))}
          </View>
        );
      })}
    </>
  );
}

export type LessonScreenProps = {
  topic: Topic;
  exercise: Exercise;
  exerciseIndex: number;
  selectedOptions: number[];
  feedback: 'correct' | 'incorrect' | null;
  onBack: () => void;
  onSelect: (optionIndex: number) => void;
  onRemove: (optionIndex: number) => void;
  onCheck: () => void;
  onMove: (nextIndex: number) => void;
};

export function LessonScreen({
  topic,
  exercise,
  exerciseIndex,
  selectedOptions,
  feedback,
  onBack,
  onSelect,
  onRemove,
  onCheck,
  onMove,
}: LessonScreenProps) {
  return (
    <>
      <Pressable
        accessibilityRole="button"
        onPress={onBack}
        style={styles.backButton}
      >
        <Text style={styles.backText}>‹  Все темы</Text>
      </Pressable>

      <View style={styles.lessonHeading}>
        <Text style={styles.eyebrow}>{topic.level} · ГРАММАТИКА</Text>
        <Text style={styles.pageTitle}>{topic.title}</Text>
        <Text style={styles.bodyText}>{topic.explanation}</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.cardLabel}>ПРИМЕРЫ</Text>
        {topic.examples.map((example) => (
          <Text key={example} style={styles.exampleText}>{example}</Text>
        ))}
        <View style={styles.tipBox}>
          <Text style={styles.tipLabel}>Лайфхак</Text>
          <Text style={styles.tipText}>{topic.tip}</Text>
        </View>
        {topic.reference ? (
          <ReferenceLink label={topic.reference.label} url={topic.reference.url} />
        ) : null}
      </View>

      <View style={styles.trainerHeading}>
        <View>
          <Text style={styles.cardLabel}>ТРЕНАЖЁР</Text>
          <Text style={styles.trainerTitle}>Собери предложение</Text>
        </View>
        <Text style={styles.progressText}>{exerciseIndex + 1} / {topic.exercises.length}</Text>
      </View>
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${((exerciseIndex + 1) / topic.exercises.length) * 100}%` },
          ]}
        />
      </View>

      <View style={styles.exerciseCard}>
        <Text style={styles.promptLabel}>Переведи на немецкий</Text>
        <Text style={styles.promptText}>{exercise.prompt}</Text>
        <View style={styles.answerArea}>
          {selectedOptions.length === 0 ? (
            <Text style={styles.answerPlaceholder}>Нажимай на слова ниже, чтобы собрать ответ</Text>
          ) : (
            <View style={styles.wordWrap}>
              {selectedOptions.map((optionIndex, position) => (
                <Pressable
                  key={`${optionIndex}-${position}`}
                  accessibilityRole="button"
                  accessibilityLabel={`Убрать слово ${exercise.options[optionIndex]}`}
                  onPress={() => onRemove(optionIndex)}
                  style={[styles.wordTile, styles.selectedTile]}
                >
                  <Text style={styles.selectedWord}>{exercise.options[optionIndex]}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
        <View style={styles.wordWrap}>
          {exercise.options.map((word, index) => {
            const selected = selectedOptions.includes(index);
            return (
              <Pressable
                key={`${word}-${index}`}
                accessibilityRole="button"
                accessibilityLabel={`Добавить слово ${word}`}
                accessibilityState={{ disabled: selected || feedback === 'correct' }}
                disabled={selected || feedback === 'correct'}
                onPress={() => onSelect(index)}
                style={({ pressed }) => [
                  styles.wordTile,
                  selected && styles.disabledTile,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.wordText, selected && styles.disabledWord]}>{word}</Text>
              </Pressable>
            );
          })}
        </View>

        {feedback ? (
          <View style={[styles.feedback, feedback === 'correct' ? styles.correctFeedback : styles.incorrectFeedback]}>
            <Text style={[styles.feedbackTitle, feedback === 'correct' ? styles.correctText : styles.incorrectText]}>
              {feedback === 'correct' ? 'Верно! Отличная работа.' : 'Пока не совпало'}
            </Text>
            <Text style={styles.feedbackBody}>
              {feedback === 'correct'
                ? 'Порядок слов и форма глагола верны.'
                : 'Проверь порядок слов и попробуй ещё раз.'}
            </Text>
          </View>
        ) : null}

        {feedback !== 'correct' ? (
          <Pressable
            accessibilityRole="button"
            onPress={onCheck}
            style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
          >
            <Text style={styles.primaryButtonText}>Проверить ответ</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.exerciseNavigation}>
        <Pressable
          accessibilityRole="button"
          disabled={exerciseIndex === 0}
          onPress={() => onMove(exerciseIndex - 1)}
          style={[styles.secondaryButton, exerciseIndex === 0 && styles.navDisabled]}
        >
          <Text style={styles.secondaryButtonText}>Назад</Text>
        </Pressable>
        {exerciseIndex < topic.exercises.length - 1 ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => onMove(exerciseIndex + 1)}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>Дальше</Text>
          </Pressable>
        ) : (
          <Pressable accessibilityRole="button" onPress={onBack} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>К темам</Text>
          </Pressable>
        )}
      </View>
    </>
  );
}

function ReferenceLink({ label, url }: { label: string; url: string }) {
  return (
    <Pressable
      accessibilityRole="link"
      onPress={() => {
        Linking.openURL(url).catch((error: unknown) => {
          console.error('Не удалось открыть учебную ссылку.', error);
        });
      }}
      style={styles.referenceButton}
    >
      <Text style={styles.referenceText}>Полезно на английском: {label}</Text>
    </Pressable>
  );
}

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  page: {
    paddingHorizontal: 20,
    paddingBottom: 48,
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    paddingTop: 16,
    paddingBottom: 28,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  brand: {
    color: COLORS.ink,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  headerCaption: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 3,
  },
  intro: {
    paddingTop: 30,
    paddingBottom: 12,
  },
  eyebrow: {
    color: COLORS.accent,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  pageTitle: {
    color: COLORS.ink,
    fontSize: 29,
    fontWeight: '800',
    lineHeight: 36,
    marginBottom: 8,
  },
  bodyText: {
    color: COLORS.muted,
    fontSize: 15,
    lineHeight: 23,
  },
  levelSection: {
    marginTop: 24,
  },
  levelHeading: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 11,
  },
  levelTitle: {
    color: COLORS.ink,
    fontSize: 20,
    fontWeight: '800',
  },
  levelCaption: {
    color: COLORS.muted,
    fontSize: 12,
  },
  topicCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 17,
    marginBottom: 10,
  },
  topicCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  topicNumber: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: '800',
  },
  topicMeta: {
    color: COLORS.muted,
    fontSize: 11,
    backgroundColor: COLORS.background,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
  },
  topicTitle: {
    color: COLORS.ink,
    fontWeight: '700',
    fontSize: 17,
    marginBottom: 5,
  },
  topicSummary: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  pressed: {
    opacity: 0.76,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 15,
    paddingRight: 12,
  },
  backText: {
    color: COLORS.accent,
    fontWeight: '700',
    fontSize: 14,
  },
  lessonHeading: {
    paddingTop: 5,
    paddingBottom: 17,
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
  },
  cardLabel: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.1,
    marginBottom: 7,
  },
  exampleText: {
    color: COLORS.ink,
    fontSize: 15,
    lineHeight: 23,
    marginBottom: 4,
  },
  tipBox: {
    marginTop: 13,
    padding: 12,
    borderRadius: 12,
    backgroundColor: COLORS.accentLight,
  },
  tipLabel: {
    color: COLORS.accent,
    fontWeight: '800',
    fontSize: 12,
    marginBottom: 4,
  },
  tipText: {
    color: COLORS.ink,
    fontSize: 13,
    lineHeight: 19,
  },
  referenceText: {
    color: COLORS.accent,
    fontSize: 12,
    marginTop: 12,
    textDecorationLine: 'underline',
  },
  referenceButton: {
    alignSelf: 'flex-start',
  },
  trainerHeading: {
    marginTop: 26,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 9,
  },
  trainerTitle: {
    color: COLORS.ink,
    fontWeight: '800',
    fontSize: 20,
  },
  progressText: {
    color: COLORS.muted,
    fontWeight: '700',
    fontSize: 12,
  },
  progressTrack: {
    height: 5,
    backgroundColor: COLORS.border,
    borderRadius: 10,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 10,
    backgroundColor: COLORS.accent,
  },
  exerciseCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 17,
  },
  promptLabel: {
    color: COLORS.muted,
    fontSize: 12,
    marginBottom: 7,
  },
  promptText: {
    color: COLORS.ink,
    fontWeight: '700',
    fontSize: 20,
    lineHeight: 28,
  },
  answerArea: {
    minHeight: 66,
    marginVertical: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
  },
  answerPlaceholder: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
  },
  wordWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  wordTile: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  selectedTile: {
    backgroundColor: COLORS.accentLight,
    borderColor: '#B8C6FF',
  },
  wordText: {
    color: COLORS.ink,
    fontSize: 14,
    fontWeight: '600',
  },
  selectedWord: {
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: '700',
  },
  disabledTile: {
    opacity: 0.34,
  },
  disabledWord: {
    color: COLORS.muted,
  },
  feedback: {
    marginTop: 16,
    borderRadius: 12,
    padding: 12,
  },
  correctFeedback: {
    backgroundColor: COLORS.successLight,
  },
  incorrectFeedback: {
    backgroundColor: COLORS.errorLight,
  },
  feedbackTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  correctText: {
    color: COLORS.success,
  },
  incorrectText: {
    color: COLORS.error,
  },
  feedbackBody: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 4,
    lineHeight: 18,
  },
  primaryButton: {
    marginTop: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: COLORS.accent,
  },
  primaryButtonText: {
    color: COLORS.surface,
    fontSize: 14,
    fontWeight: '800',
  },
  exerciseNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  secondaryButton: {
    paddingHorizontal: 15,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  secondaryButtonText: {
    color: COLORS.ink,
    fontSize: 13,
    fontWeight: '700',
  },
  navDisabled: {
    opacity: 0.4,
  },
});
