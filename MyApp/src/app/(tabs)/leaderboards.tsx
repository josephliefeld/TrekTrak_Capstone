import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';

import ParallaxScrollView from '../../components/parallax-scroll-view';
import { ThemedText } from '../../components/themed-text';
import { ThemedView } from '../../components/themed-view';


// Type for leaderboard entries (will match your Supabase schema later)
interface LeaderboardEntry {
  id: string;
  username: string;
  score: number;
  event_name: string;
}

export default function LeaderboardsScreen() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Placeholder effect — replace with Supabase fetch when backend is ready
  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        // TODO: Replace with Supabase call
        // Example: const { data, error } = await supabase.from('leaderboard').select('*').order('score', { ascending: false });

        // Mock data for now
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

  const renderItem = ({ item, index }: { item: LeaderboardEntry; index: number }) => (
    <View style={styles.entryContainer}>
      <ThemedText type="defaultSemiBold" style={styles.rankText}>
        #{index + 1}
      </ThemedText>
      <ThemedView style={styles.entryContent}>
        <ThemedText type="subtitle">{item.username}</ThemedText>
        <ThemedText type="default">Steps: {item.score}</ThemedText>
      </ThemedView>
    </View>
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
      <ThemedView style={styles.headerContainer}>
        <ThemedText type="title">🥇 Leaderboards</ThemedText>
        <ThemedText type="subtitle">Top Performers Across TrekTrak Events</ThemedText>
      </ThemedView>

      {/* Content */}
      <ThemedView style={styles.contentContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#1D3D47" />
        ) : leaderboard.length > 0 ? (
          <FlatList
            data={leaderboard}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
          />
        ) : (
          <ThemedText type="defaultSemiBold" style={styles.placeholderText}>
            No leaderboard data yet. Check back soon!
          </ThemedText>
        )}
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 12,
  },
  listContainer: {
    gap: 12,
  },
  entryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  rankText: {
    fontSize: 18,
    width: 40,
    textAlign: 'center',
    color: '#1D3D47',
  },
  entryContent: {
    flex: 1,
  },
  placeholderText: {
    textAlign: 'center',
    marginTop: 20,
  },
});
