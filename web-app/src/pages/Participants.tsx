import { useParams, Link } from "react-router-dom";
import { supabase } from "@/components/lib/supabase/client";
import { useEffect, useState } from "react";

interface Profile { 
  profile_id: string; 
  username: string; 
}

type Event = {
  event_id: number;
  event_name: string;
};

export default function Participants() {
  const [event, setEvent] = useState<Event | null>(null);
  const [participants, setParticipants] = useState<Profile[]>([]); 
  const [loading, setLoading] = useState(true);

  const { eventId } = useParams();

  const fetchEvents = async () => {
    if (!eventId) return;

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("event_id", eventId)
      .single();

    if (!error) setEvent(data);
  };

  const fetchParticipants = async () => {
    if (!eventId) return; 
    
    const { data, error } = await supabase
      .from("daily_steps")
      .select("profile_id")
      .eq("event_id", eventId);

    if (error) return;

    const profileIds = Array.from(new Set(data.map(row => row.profile_id)));
    await fetchProfiles(profileIds);
  };

  const fetchProfiles = async (profileIds: string[]) => { 
    if (profileIds.length === 0) { 
      setParticipants([]); 
      return; 
    } 
    
    const { data, error } = await supabase
      .from("profiles")
      .select("profile_id, username")
      .in("profile_id", profileIds); 
    
    if (!error) setParticipants(data as Profile[]);
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchEvents(), fetchParticipants()]).finally(() =>
      setLoading(false)
    );
  }, [eventId]);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">
            {event?.event_name}
          </h1>
          <p className="text-gray-500 text-lg">
            View participants for this event
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex justify-center gap-6 text-sm font-medium text-gray-600">
          <Link
            to={`/events/${event?.event_id}`}
            className="hover:text-blue-600 transition"
          >
            Event
          </Link>
          <Link
            to="teams"
            className="hover:text-blue-600 transition"
          >
            Teams
          </Link>
          <Link
            to="statistics"
            className="hover:text-blue-600 transition"
          >
            Statistics
          </Link>
          <Link
            to={`/events/edit/${event?.event_id}`}
            className="hover:text-blue-600 transition"
          >
            Edit
          </Link>
        </nav>

        {/* Card Container */}
        <div className="bg-white rounded-2xl shadow-lg p-10 space-y-6">

          <h2 className="text-2xl font-semibold">
            Participants
          </h2>

          {loading && (
            <div className="text-gray-500">Loading participants…</div>
          )}

          {!loading && participants.length === 0 && (
            <div className="text-gray-500">
              No participants found for this event.
            </div>
          )}

          {!loading && participants.length > 0 && (
            <ul className="space-y-4">
              {participants.map((p) => (
                <li
                  key={p.profile_id}
                  className="flex items-center justify-between p-4 border rounded-xl hover:shadow-sm transition"
                >
                  <span className="font-medium text-gray-800">
                    {p.username}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
