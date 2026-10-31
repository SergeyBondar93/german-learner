import { useRouter } from 'expo-router';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader, styles, TopicList } from '../../App';

export default function TopicListRoute() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
        <AppHeader />
        <TopicList
          onOpen={(topic) =>
            router.push({
              pathname: '/lesson/[topicId]',
              params: { topicId: topic.id },
            })
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
}
