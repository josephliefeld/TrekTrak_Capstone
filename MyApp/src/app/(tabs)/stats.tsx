import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ActivityIndicator, AppState, Pressable, StyleSheet, View, ScrollView } from 'react-native'
import { Pedometer } from 'expo-sensors'

import { ThemedText } from '@/src/components/themed-text'
import { ThemedView } from '@/src/components/themed-view'
import { supabase } from '@/src/components/lib/supabase'
import { useAuthContext } from '@/hooks/use-auth-context'

export default function StatsScreen() {
  const { session, profile } = useAuthContext()

  const todayISO = useMemo(() => new Date().toISOString().split('T')[0], [])

  const [stepsToday, setStepsToday] = useState<number | null>(null)
  const [totalSteps, setTotalSteps] = useState<number | null>(null)
  const [activeEventsCount, setActiveEventsCount] = useState<number | null>(null)
  const [pedometerAvailable, setPedometerAvailable] = useState<boolean | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [syncing, setSyncing] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null)

  const userId = session?.user?.id ?? profile?.profile_id ?? null

  const liveWatchBaselineRef = useRef<number>(0)
  const liveWatchRef = useRef<any>(null)
  const pendingSyncTimerRef = useRef<any>(null)

  const formatNumber = useCallback((n: number | null) => {
    if (n === null || Number.isNaN(n)) return '—'
    return n.toLocaleString()
  }, [])

  const writeTodayOverallStepsToSupabase = useCallback(
    async (steps: number) => {
      if (!userId) return

      const { data: existing } = await supabase
        .from('daily_steps')
        .select('id')
        .eq('profile_id', userId)
        .is('event_id', null)
        .eq('date', todayISO)
        .limit(1)
        .maybeSingle()

      if (existing?.id) {
        await supabase
          .from('daily_steps')
          .update({ dailysteps: steps, totaldailysteps: steps })
          .eq('id', existing.id)
      } else {
        await supabase.from('daily_steps').insert({
          profile_id: userId,
          event_id: null,
          dailysteps: steps,
          totaldailysteps: steps,
          date: todayISO,
        })
      }
    },
    [todayISO, userId]
  )

  const fetchStats = useCallback(async () => {
    if (!userId) return

    setLoading(true)

    try {
      const { data: allTimeRows } = await supabase
        .from('daily_steps')
        .select('dailysteps')
        .eq('profile_id', userId)
        .is('event_id', null)

      let total = 0
      for (const r of allTimeRows ?? []) total += r?.dailysteps ?? 0
      setTotalSteps(total)

      const { data: dailyRows } = await supabase
        .from('daily_steps')
        .select('dailysteps')
        .eq('profile_id', userId)
        .eq('date', todayISO)

      setStepsToday(dailyRows?.[0]?.dailysteps ?? 0)

      const { count } = await supabase
        .from('daily_steps')
        .select('event_id', { count: 'exact', head: true })
        .eq('profile_id', userId)
        .not('event_id', 'is', null)

      setActiveEventsCount(count ?? 0)

      setLastUpdatedAt(new Date())
    } catch (e: any) {
      setErrorMessage(e?.message ?? 'Failed to load stats')
    } finally {
      setLoading(false)
    }
  }, [todayISO, userId])

  const syncTodayStepsFromPhone = useCallback(async () => {
    setSyncing(true)

    try {
      const available = await Pedometer.isAvailableAsync()
      setPedometerAvailable(available)

      if (!available) return

      const end = new Date()
      const start = new Date()
      start.setHours(0, 0, 0, 0)

      const result = await Pedometer.getStepCountAsync(start, end)

      const steps = result?.steps ?? 0
      setStepsToday(steps)

      await writeTodayOverallStepsToSupabase(steps)

      await fetchStats()
    } finally {
      setSyncing(false)
    }
  }, [fetchStats])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') fetchStats()
    })

    return () => sub.remove()
  }, [fetchStats])

  return (

    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <ThemedView>

        <View style={styles.header}>
          <ThemedText type="title">Your Stats</ThemedText>
          <ThemedText style={styles.subtitle}>
            Track your activity and progress
          </ThemedText>
        </View>

        <View style={styles.statsGrid}>

          <View style={styles.card}>
            <ThemedText style={styles.label}>Steps Today</ThemedText>
            {loading ? (
              <ActivityIndicator />
            ) : (
              <ThemedText style={styles.value}>{formatNumber(stepsToday)}</ThemedText>
            )}
          </View>

          <View style={styles.card}>
            <ThemedText style={styles.label}>Total Steps</ThemedText>
            {loading ? (
              <ActivityIndicator />
            ) : (
              <ThemedText style={styles.value}>{formatNumber(totalSteps)}</ThemedText>
            )}
          </View>

          <View style={styles.card}>
            <ThemedText style={styles.label}>Tiers Earned</ThemedText>
            <ThemedText style={styles.value}>—</ThemedText>
          </View>

          <View style={styles.card}>
            <ThemedText style={styles.label}>Active Events</ThemedText>
            {loading ? (
              <ActivityIndicator />
            ) : (
              <ThemedText style={styles.value}>{formatNumber(activeEventsCount)}</ThemedText>
            )}
          </View>

        </View>

        <View style={styles.footer}>

          <ThemedText style={styles.footerText}>
            {lastUpdatedAt
              ? `Last updated ${lastUpdatedAt.toLocaleTimeString()}`
              : 'Loading stats...'}
          </ThemedText>

          <View style={styles.buttonRow}>

            <Pressable
              style={styles.button}
              onPress={fetchStats}
            >
              <ThemedText style={styles.buttonText}>
                Refresh
              </ThemedText>
            </Pressable>

            <Pressable
              style={styles.button}
              onPress={syncTodayStepsFromPhone}
            >
              <ThemedText style={styles.buttonText}>
                {syncing ? 'Syncing...' : 'Sync from Phone'}
              </ThemedText>
            </Pressable>

          </View>

          {pedometerAvailable === false && (
            <ThemedText style={styles.footerText}>
              Pedometer unavailable on this device
            </ThemedText>
          )}

        </View>

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
    marginBottom: 24
  },

  subtitle: {
    opacity: 0.6,
    marginTop: 4
  },

  statsGrid: {
    gap: 14
  },

  card: {
    backgroundColor: '#f9fafb',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center'
  },

  label: {
    opacity: 0.6,
    marginBottom: 6
  },

  value: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2563eb'
  },

  footer: {
    marginTop: 30,
    alignItems: 'center',
    gap: 12
  },

  footerText: {
    opacity: 0.6
  },

  buttonRow: {
    flexDirection: 'row',
    gap: 12
  },

  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10
  },

  buttonText: {
    color: '#fff',
    fontWeight: '600'
  }

})