import { Image } from 'expo-image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, AppState, Pressable, StyleSheet, View } from 'react-native';
import { Pedometer } from 'expo-sensors';
import ParallaxScrollView from '@/src/components/parallax-scroll-view';
import { ThemedText } from '@/src/components/themed-text';
import { ThemedView } from '@/src/components/themed-view';
import { supabase } from '@/src/components/lib/supabase';
import { useAuthContext } from '@/hooks/use-auth-context';

export default function StatsScreen() {
  const { session, profile } = useAuthContext();

  const todayISO = useMemo(() => new Date().toISOString().split('T')[0], []);

  const [stepsToday, setStepsToday] = useState<number | null>(null);
  const [totalSteps, setTotalSteps] = useState<number | null>(null);
  const [activeEventsCount, setActiveEventsCount] = useState<number | null>(null);
  const [pedometerAvailable, setPedometerAvailable] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);

  const userId = session?.user?.id ?? profile?.profile_id ?? null;

  const liveWatchBaselineRef = useRef<number>(0);
  const liveWatchRef = useRef<ReturnType<typeof Pedometer.watchStepCount> | null>(null);
  const pendingSyncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const formatNumber = useCallback((n: number | null) => {
    if (n === null || Number.isNaN(n)) return '—';
    try {
      return n.toLocaleString();
    } catch {
      return String(n);
    }
  }, []);

  const pickOverallStepsForDay = useCallback((rows: any[] | null | undefined) => {
    if (!rows || rows.length === 0) return null;

    // Prefer explicit `totaldailysteps` if your schema is populating it.
    for (const r of rows) {
      const v = typeof r?.totaldailysteps === 'string' ? Number(r.totaldailysteps) : r?.totaldailysteps;
      if (typeof v === 'number' && Number.isFinite(v)) return v;
    }

    // Otherwise, fall back to summing `dailysteps` across rows (e.g., per-event rows).
    let sum = 0;
    let hasAny = false;
    for (const r of rows) {
      const v = typeof r?.dailysteps === 'string' ? Number(r.dailysteps) : r?.dailysteps;
      if (typeof v === 'number' && Number.isFinite(v)) {
        sum += v;
        hasAny = true;
      }
    }

    return hasAny ? sum : null;
  }, []);

  const writeTodayOverallStepsToSupabase = useCallback(
    async (steps: number) => {
      if (!userId) return;
      const clamped = Math.max(0, Math.min(steps, 100000));

      const { data: existing, error: existingErr } = await supabase
        .from('daily_steps')
        .select('id')
        .eq('profile_id', userId)
        .is('event_id', null)
        .eq('date', todayISO)
        .order('id', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingErr) throw existingErr;

      if (existing?.id) {
        const { error: updateErr } = await supabase
          .from('daily_steps')
          .update({ dailysteps: clamped, totaldailysteps: clamped, date: todayISO })
          .eq('id', existing.id);
        if (updateErr) throw updateErr;
      } else {
        const { error: insertErr } = await supabase.from('daily_steps').insert({
          profile_id: userId,
          event_id: null,
          dailysteps: clamped,
          totaldailysteps: clamped,
          date: todayISO,
        });
        if (insertErr) throw insertErr;
      }
    },
    [todayISO, userId],
  );

  const fetchStats = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      setErrorMessage('Not logged in.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      // Total steps from profiles
      const { data: profileRow, error: profileErr } = await supabase
        .from('profiles')
        .select('total_steps')
        .eq('profile_id', userId)
        .single();

      if (profileErr) throw profileErr;

      setTotalSteps(
        typeof profileRow?.total_steps === 'number' ? profileRow.total_steps : null,
      );

      // Steps today from daily_steps
      // Your real schema columns: id, profile_id, event_id, dailysteps, date, totaldailysteps
      const { data: dailyRows, error: dailyErr } = await supabase
        .from('daily_steps')
        .select('event_id, dailysteps, totaldailysteps, date')
        .eq('profile_id', userId)
        .eq('date', todayISO);

      if (dailyErr) throw dailyErr;
      setStepsToday(pickOverallStepsForDay(dailyRows ?? []));

      // Active events count (approx): number of enrolled events in daily_steps
      // (rows where event_id is not null) - this avoids joining events.
      const { count, error: countErr } = await supabase
        .from('daily_steps')
        .select('event_id', { count: 'exact', head: true })
        .eq('profile_id', userId)
        .not('event_id', 'is', null);

      if (countErr) throw countErr;
      setActiveEventsCount(typeof count === 'number' ? count : null);

      setLastUpdatedAt(new Date());
    } catch (e: any) {
      const msg =
        typeof e?.message === 'string'
          ? e.message
          : 'Failed to load stats from Supabase.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  }, [pickOverallStepsForDay, todayISO, userId]);

  const syncTodayStepsFromPhone = useCallback(async () => {
    if (!userId) {
      setErrorMessage('Not logged in.');
      return;
    }

    setSyncing(true);
    setErrorMessage(null);

    try {
      const available = await Pedometer.isAvailableAsync();
      setPedometerAvailable(available);

      if (!available) {
        setErrorMessage('Pedometer is not available on this device.');
        return;
      }

      const end = new Date();
      const start = new Date();
      start.setHours(0, 0, 0, 0);

      const result = await Pedometer.getStepCountAsync(start, end);
      const steps = result?.steps ?? 0;

      setStepsToday(steps);
      await writeTodayOverallStepsToSupabase(steps);

      await fetchStats();
    } catch (e: any) {
      const msg =
        typeof e?.message === 'string'
          ? e.message
          : 'Failed to sync steps to Supabase.';
      setErrorMessage(msg);
    } finally {
      setSyncing(false);
    }
  }, [fetchStats, todayISO, userId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const startLivePedometerWatch = useCallback(async () => {
    if (!userId) return;

    // cleanup existing watcher
    if (liveWatchRef.current) {
      try {
        liveWatchRef.current.remove();
      } catch {
        // ignore
      }
      liveWatchRef.current = null;
    }

    const available = await Pedometer.isAvailableAsync();
    setPedometerAvailable(available);
    if (!available) return;

    // baseline = steps since midnight right now
    const end = new Date();
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const baselineRes = await Pedometer.getStepCountAsync(start, end);
    const baseline = baselineRes?.steps ?? 0;
    liveWatchBaselineRef.current = baseline;
    setStepsToday(baseline);

    // kick an initial write (debounced below as well)
    try {
      await writeTodayOverallStepsToSupabase(baseline);
      setLastUpdatedAt(new Date());
    } catch (e: any) {
      setErrorMessage(typeof e?.message === 'string' ? e.message : 'Failed to sync steps to Supabase.');
    }

    liveWatchRef.current = Pedometer.watchStepCount((result) => {
      const liveTotal = liveWatchBaselineRef.current + (result?.steps ?? 0);
      setStepsToday(liveTotal);

      // debounce writes to Supabase (avoid writing every step)
      if (pendingSyncTimerRef.current) clearTimeout(pendingSyncTimerRef.current);
      pendingSyncTimerRef.current = setTimeout(async () => {
        try {
          await writeTodayOverallStepsToSupabase(liveTotal);
          setLastUpdatedAt(new Date());
        } catch (e: any) {
          setErrorMessage(
            typeof e?.message === 'string' ? e.message : 'Failed to sync steps to Supabase.',
          );
        }
      }, 15_000);
    });
  }, [userId, writeTodayOverallStepsToSupabase]);

  // Auto-sync + live watch: on app open / returning to foreground, and once on mount.
  useEffect(() => {
    let lastStartAt = 0;
    const maybeStart = () => {
      const now = Date.now();
      if (now - lastStartAt < 10_000) return; // quick throttle
      lastStartAt = now;
      startLivePedometerWatch();
      fetchStats();
    };

    maybeStart();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') maybeStart();
    });

    return () => {
      sub.remove();
      if (liveWatchRef.current) {
        try {
          liveWatchRef.current.remove();
        } catch {
          // ignore
        }
        liveWatchRef.current = null;
      }
      if (pendingSyncTimerRef.current) {
        clearTimeout(pendingSyncTimerRef.current);
        pendingSyncTimerRef.current = null;
      }
    };
  }, [fetchStats, startLivePedometerWatch]);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#3B3B3B', dark: '#000' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      
      {/* Header */}
      <ThemedView style={styles.headerContainer}>
        <ThemedText type="title" style={styles.titleText}>📊 Your Stats</ThemedText>
        <ThemedText type="subtitle" style={styles.subtitleText}>
          Track your daily activity and global progress
        </ThemedText>
      </ThemedView>

      {/* Stats Section */}
      <ThemedView style={styles.statsContainer}>
        <View style={styles.statBox}>
          <ThemedText type="subtitle" style={styles.label}>Steps Today</ThemedText>
          {loading ? (
            <ActivityIndicator />
          ) : (
            <ThemedText type="title" style={styles.value}>{formatNumber(stepsToday)}</ThemedText>
          )}
        </View>

        <View style={styles.statBox}>
          <ThemedText type="subtitle" style={styles.label}>🌍 Total Steps</ThemedText>
          {loading ? (
            <ActivityIndicator />
          ) : (
            <ThemedText type="title" style={styles.value}>{formatNumber(totalSteps)}</ThemedText>
          )}
        </View>

        <View style={styles.statBox}>
          <ThemedText type="subtitle" style={styles.label}>🏆 Tiers Earned Today</ThemedText>
          <ThemedText type="title" style={styles.value}>—</ThemedText>
        </View>

        <View style={styles.statBox}>
          <ThemedText type="subtitle" style={styles.label}>🎯 Active Events</ThemedText>
          {loading ? (
            <ActivityIndicator />
          ) : (
            <ThemedText type="title" style={styles.value}>{formatNumber(activeEventsCount)}</ThemedText>
          )}
        </View>
      </ThemedView>

      {/* Actions / Status */}
      <ThemedView style={styles.footer}>
        {errorMessage ? (
          <ThemedText type="default" style={[styles.footerText, styles.errorText]}>
            {errorMessage}
          </ThemedText>
        ) : (
          <ThemedText type="default" style={styles.footerText}>
            {lastUpdatedAt
              ? `Last updated: ${lastUpdatedAt.toLocaleTimeString()}`
              : 'Pulling live stats from Supabase…'}
          </ThemedText>
        )}

        <View style={styles.actionsRow}>
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.actionButtonPressed,
            ]}
            onPress={fetchStats}
            disabled={loading || syncing}
          >
            <ThemedText style={styles.actionButtonText}>
              {loading ? 'Refreshing…' : 'Refresh'}
            </ThemedText>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.actionButtonPressed,
            ]}
            onPress={syncTodayStepsFromPhone}
            disabled={loading || syncing}
          >
            <ThemedText style={styles.actionButtonText}>
              {syncing ? 'Syncing…' : 'Sync from Phone'}
            </ThemedText>
          </Pressable>
        </View>

        {pedometerAvailable === false ? (
          <ThemedText type="default" style={styles.footerText}>
            Pedometer not available on this device.
          </ThemedText>
        ) : null}
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  reactLogo: {
    height: 160,
    width: 280,
    bottom: 0,
    left: 0,
    position: 'absolute',
    opacity: 0.2,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  titleText: {
    color: '#FFFFFF',
  },
  subtitleText: {
    color: '#CCCCCC',
  },
  statsContainer: {
    backgroundColor: '#1A1A1A',
    padding: 20,
    borderRadius: 16,
    gap: 20,
  },
  statBox: {
    backgroundColor: '#2A2A2A',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  label: {
    color: '#AAAAAA',
    marginBottom: 6,
  },
  value: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
    gap: 10,
  },
  footerText: {
    color: '#777777',
    textAlign: 'center',
  },
  errorText: {
    color: '#ff6b6b',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  actionButtonPressed: {
    opacity: 0.85,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
