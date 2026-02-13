import { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Pedometer } from 'expo-sensors';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 🔹 Your Supabase credentials
const supabaseUrl = 'https://rwrxwbobqirrdmpnirch.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3cnh3Ym9icWlycmRtcG5pcmNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3NDYwMjksImV4cCI6MjA3NjMyMjAyOX0.dBPfgVJXmR0L15kGmgbOEYS5jvrMmiJ8MRhLMaAWHrg';

// ✅ Proper React Native Supabase setup
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export default function App() {
  const [isPedometerAvailable, setIsPedometerAvailable] = useState('checking');
  const [pastStepCount, setPastStepCount] = useState(0);
  const [currentStepCount, setCurrentStepCount] = useState(0);

  const today = new Date().toISOString().split('T')[0];

  // ✅ Database Update Function (with full error debugging)
  const updateStepsInDatabase = async (steps) => {
    try {
      const { data, error } = await supabase
        .from('daily_steps')
        .upsert(
          {
            date: today,
            dailysteps: steps
          },
          { onConflict: 'date' }
        );

      if (error) {
        console.log('Supabase error:', error);
      } else {
        console.log('Supabase success:', data);
      }
    } catch (err) {
      console.log('FULL NETWORK ERROR:', err);
    }
  };

  const subscribe = async () => {
    const isAvailable = await Pedometer.isAvailableAsync();
    setIsPedometerAvailable(String(isAvailable));

    if (!isAvailable) return;

    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 1);

    const pastStepCountResult = await Pedometer.getStepCountAsync(start, end);

    if (pastStepCountResult) {
      setPastStepCount(pastStepCountResult.steps);
      await updateStepsInDatabase(pastStepCountResult.steps);
    }

    return Pedometer.watchStepCount(async result => {
      setCurrentStepCount(result.steps);
      await updateStepsInDatabase(result.steps);
    });
  };

  useEffect(() => {
    let subscription;

    subscribe().then(sub => {
      subscription = sub;
    });

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text>Pedometer Available: {isPedometerAvailable}</Text>
      <Text>Steps in last 24 hours: {pastStepCount}</Text>
      <Text>Live Steps: {currentStepCount}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
