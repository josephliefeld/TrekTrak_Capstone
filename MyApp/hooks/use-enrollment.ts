import { useEffect, useState } from 'react'
import { supabase } from '@/src/components/lib/supabase'

export type Event = {
  event_id: number
  organizer: string
  event_name: string
  event_type: string
  is_private: boolean
  start_date: string
  end_date: string
  event_description: string
  is_publshed: boolean
}

export function useEnrollment(profileId?: number | null) {
  const [loading, setLoading] = useState(true)
  const [enrolledEvent, setEnrolledEvent] = useState<Event | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    const run = async () => {
      try {
        if (!profileId) {
          if (isMounted) {
            setEnrolledEvent(null)
            setLoading(false)
          }
          return
        }

        const { data: steps, error: stepsErr } = await supabase
          .from('daily_steps')
          .select('event_id')
          .eq('profile_id', profileId)
          .limit(1)

        if (stepsErr) throw stepsErr

        if (steps && steps.length > 0) {
          const eventId = steps[0].event_id
          const { data: event, error: eventErr } = await supabase
            .from('events')
            .select('*')
            .eq('event_id', eventId)
            .single()

          if (eventErr) throw eventErr
          if (isMounted) setEnrolledEvent(event ?? null)
        } else {
          if (isMounted) setEnrolledEvent(null)
        }
      } catch (e: any) {
        if (isMounted) setError(e?.message ?? 'Unknown error')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    run()
    return () => { isMounted = false }
  }, [profileId])

  return { loading, enrolledEvent, error }
}