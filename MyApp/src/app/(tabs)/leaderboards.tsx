import { useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import ParallaxScrollView from '@/src/components/parallax-scroll-view';
import { ThemedText } from '@/src/components/themed-text';
import { ThemedView } from '@/src/components/themed-view';

interface LeaderboardEntry {
  id: string;
  username: string;
  score: number;
  event_name: string;
}

export default function LeaderboardsScreen() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const mockData: LeaderboardEntry[] = [
          { id: '1', username: 'KekoaY', score: 9820, event_name: 'Step Challenge' },
          { id: '2', username: 'MariaL', score: 9475, event_name: 'Step Challenge' },
          { id: '3', username: 'JohnS', score: 9050, event_name: 'Step Challenge' },
        ];
        setLeaderboard(mockData);
      } catch (error) {
        console.error('Error loading leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const renderItem = ({
    item,
    index,
  }: {
    item: LeaderboardEntry;
    index: number;
  }) => (
    <ThemedView style={styles.card}>
      <View style={styles.rankBadge}>
        <ThemedText style={styles.rankText}>#{index + 1}</ThemedText>
      </View>

      <ThemedView style={styles.cardContent}>
        <ThemedText type="subtitle">{item.username}</ThemedText>
        <ThemedText style={styles.metaText}>
          {item.event_name}
        </ThemedText>
      </ThemedView>

      <ThemedText style={styles.scoreText}>
        {item.score.toLocaleString()}
      </ThemedText>
    </ThemedView>
  );

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.headerImage}
        />
      }
    >
      {/* Header */}
      <ThemedView style={styles.header}>
        <ThemedText type="title">🥇 Leaderboards</ThemedText>
        <ThemedText style={styles.subtitle}>
          Top performers across TrekTrak events
        </ThemedText>
      </ThemedView>

      {/* Content */}
      <ThemedView style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#1D3D47" />
        ) : leaderboard.length > 0 ? (
          <FlatList
            data={leaderboard}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
          />
        ) : (
          <ThemedText style={styles.emptyText}>
            No leaderboard data yet. Check back soon!
          </ThemedText>
        )}
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    height: 170,
    width: 280,
    position: 'absolute',
    bottom: 0,
    left: 0,
  },

  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  subtitle: {
    marginTop: 6,
    opacity: 0.7,
  },

  content: {
    paddingHorizontal: 16,
  },
  list: {
    gap: 12,
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 14,
    elevation: 2,
  },

  rankBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#E6F0F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankText: {
    fontWeight: '700',
    color: '#1D3D47',
  },

  cardContent: {
    flex: 1,
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    opacity: 0.6,
  },

  scoreText: {
    fontWeight: '700',
    fontSize: 16,
    color: '#1D3D47',
  },

  emptyText: {
    textAlign: 'center',
    marginTop: 24,
    opacity: 0.7,
  },
});