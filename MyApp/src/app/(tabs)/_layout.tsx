import { Tabs, useRouter } from 'expo-router'
import React, { useEffect, useRef, useState } from 'react'
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import SignOutButton from '@/src/components/social-auth-buttons/sign-out-button'

import { supabase } from '@/src/components/lib/supabase'
import { useAuthContext } from '@/hooks/use-auth-context'


export default function RootLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()


  // 👇 NEW: access profile from your AuthContext
  const { profile } = useAuthContext() as {
    profile?: { profile_id?: number | null; username?: string; email?: string } | null
  }

  // 👇 NEW: enrollment check state + one-time gate ref
  const [checkingEnrollment, setCheckingEnrollment] = useState(false)
  const [hasEnrollment, setHasEnrollment] = useState<boolean | null>(null)
  const didGateRef = useRef(false)

  // 👇 NEW: check if this user is enrolled in any event
  useEffect(() => {
    let cancelled = false
    const checkEnrollment = async () => {
      if (!profile?.profile_id) {
        setHasEnrollment(null)
        return
      }
      setCheckingEnrollment(true)
      const { data, error } = await supabase
        .from('daily_steps')
        .select('event_id')
        .eq('profile_id', profile.profile_id)
        .limit(1)

      if (!cancelled) {
        if (error) {
          console.warn('Enrollment check failed:', error.message)
          setHasEnrollment(false)
        } else {
          setHasEnrollment((data?.length ?? 0) > 0)
        }
        setCheckingEnrollment(false)
      }
    }

    checkEnrollment()
    return () => {
      cancelled = true
    }
  }, [profile?.profile_id])

  // 👇 NEW: run the redirect ONCE post-login
  useEffect(() => {
    // Only act when a logged-in profile exists and the check is done
    if (didGateRef.current) return
    if (!profile) return
    if (checkingEnrollment || hasEnrollment === null) return

    didGateRef.current = true
    if (hasEnrollment) {
      router.replace('/')        // enrolled → Home (index.tsx)
    } else {
      router.replace('/events')  // not enrolled → Events
    }
  }, [profile, checkingEnrollment, hasEnrollment, router])


  function navigate(path: '/profile') {
    setMenuOpen(false)
    router.push(path)
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={{ width: 24 }} />
        <Text style={styles.title}>Trek Trak</Text>

        {/* Account Icon */}
        <TouchableOpacity onPress={() => setMenuOpen(!menuOpen)}>
          <Ionicons name="person-circle-outline" size={28} color="#111827" />
        </TouchableOpacity>
      </View>

      {/* ACCOUNT DROPDOWN */}
      {menuOpen && (
        <Pressable style={styles.backdrop} onPress={() => setMenuOpen(false)}>
          <View style={styles.menu}>
            <MenuItem label="Profile" onPress={() => navigate('/profile')} />

            <View style={styles.separator} />

            <SignOutButton />
          </View>
        </Pressable>
      )}

      {/* BOTTOM TABS */}
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#111827',
          tabBarInactiveTintColor: '#9ca3af',
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home-outline" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="events"
          options={{
            title: 'Events',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="calendar-outline" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="leaderboards"
          options={{
            title: 'Leaderboards',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="trophy-outline" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="stats"
          options={{
            title: 'Stats',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="stats-chart-outline" size={size} color={color} />
            ),
          }}
        />

        {/* HIDDEN FROM TAB BAR */}
        <Tabs.Screen
          name="profile"
          options={{
            href: null, // 👈 hides Profile from bottom tabs
          }}
        />
      </Tabs>
    </SafeAreaView>
  )
}

function MenuItem({
  label,
  onPress,
}: {
  label: string
  onPress: () => void
}) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Text style={styles.menuText}>{label}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  header: {
    height: 64,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 0.5,
    borderColor: '#e5e7eb',
    zIndex: 20,
  },

  title: {
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: '#111827',
  },

  backdrop: {
    position: 'absolute',
    top: 64,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 30,
  },

  menu: {
    position: 'absolute',
    right: 16,
    top: 8,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    width: 200,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 10,
  },

  menuItem: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },

  menuText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },

  separator: {
    borderTopWidth: 0.5,
    borderColor: '#e5e7eb',
    marginVertical: 8,
  },
})