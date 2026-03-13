import { useEffect, useState } from 'react'
import {
  FlatList,
  StyleSheet,
  View,
  ActivityIndicator,
  ScrollView
} from 'react-native'

import { ThemedText } from '@/src/components/themed-text'
import { ThemedView } from '@/src/components/themed-view'

interface LeaderboardEntry {
  id: string
  username: string
  score: number
  event_name: string
}

export default function LeaderboardsScreen() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true)

      try {
        const mockData: LeaderboardEntry[] = [
          { id: '1', username: 'KekoaY', score: 9820, event_name: 'Step Challenge' },
          { id: '2', username: 'MariaL', score: 9475, event_name: 'Step Challenge' },
          { id: '3', username: 'JohnS', score: 9050, event_name: 'Step Challenge' },
        ]

        setLeaderboard(mockData)
      } catch (error) {
        console.error('Error loading leaderboard:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [])

  const getRankColor = (rank: number) => {
    if (rank === 0) return '#fbbf24' // gold
    if (rank === 1) return '#9ca3af' // silver
    if (rank === 2) return '#d97706' // bronze
    return '#e5e7eb'
  }

  const renderItem = ({
    item,
    index,
  }: {
    item: LeaderboardEntry
    index: number
  }) => (
    <View style={styles.card}>

      <View
        style={[
          styles.rankBadge,
          { backgroundColor: getRankColor(index) },
        ]}
      >
        <ThemedText style={styles.rankText}>
          {index + 1}
        </ThemedText>
      </View>

      <View style={styles.cardContent}>
        <ThemedText style={styles.username}>
          {item.username}
        </ThemedText>

        <ThemedText style={styles.metaText}>
          {item.event_name}
        </ThemedText>
      </View>

      <ThemedText style={styles.scoreText}>
        {item.score.toLocaleString()}
      </ThemedText>

    </View>
  )

  return (

    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <ThemedView>

        <View style={styles.header}>
          <ThemedText type="title">Leaderboards</ThemedText>

          <ThemedText style={styles.subtitle}>
            Top performers across events
          </ThemedText>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" />
          </View>
        ) : leaderboard.length > 0 ? (
          <FlatList
            data={leaderboard}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.center}>
            <ThemedText style={styles.emptyText}>
              No leaderboard data yet.
            </ThemedText>
          </View>
        )}

      </ThemedView>
    </ScrollView>

  )
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff'
  },

  header: {
    marginBottom: 20
  },

  subtitle: {
    marginTop: 4,
    opacity: 0.6
  },

  list: {
    gap: 12
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12
  },

  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },

  rankText: {
    fontWeight: '700',
    color: '#111827'
  },

  cardContent: {
    flex: 1
  },

  username: {
    fontWeight: '600',
    fontSize: 16
  },

  metaText: {
    fontSize: 12,
    opacity: 0.6
  },

  scoreText: {
    fontWeight: '700',
    fontSize: 16,
    color: '#2563eb'
  },

  emptyText: {
    opacity: 0.7
  },

  center: {
    marginTop: 40,
    alignItems: 'center'
  }

})