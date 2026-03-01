import { useParams, Link } from "react-router-dom";
import { supabase } from "@/components/lib/supabase/client";
import { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";

interface Profile { 
  profile_id: string; 
  username: string; 
}

type Event = {
  event_id: number;
  organizer: string;
  event_name: string;
  event_type: string;
  is_private: boolean;
  start_date: string;
  end_date: string;
  event_description: string;
  is_published: boolean;
  owner_id: string;
};

export default function Participants() {
  const [event, setEvent] = useState<Event | null>(null);
  const [participants, setParticipants] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const { eventId } = useParams();

  const {userId} = useAuth()

  const fetchEvents = async () => {
    if (!eventId) return;

    const { data } = await supabase
      .from("events")
      .select("*")
      .eq("event_id", eventId)
      .single();

    setEvent(data);
  };

  const fetchParticipants = async () => {
    if (!eventId) return;

    const { data } = await supabase
      .from("daily_steps")
      .select("profile_id")
      .eq("event_id", eventId);

    if (!data) return;

    const profileIds = Array.from(new Set(data.map(row => row.profile_id)));
    await fetchProfiles(profileIds);
  };

  const fetchProfiles = async (profileIds: string[]) => {
    if (profileIds.length === 0) {
      setParticipants([]);
      return;
    }

    const { data } = await supabase
      .from("profiles")
      .select("profile_id, username")
      .in("profile_id", profileIds);

    setParticipants(data as Profile[]);
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchEvents(), fetchParticipants()]).finally(() =>
      setLoading(false)
    );
  }, [eventId]);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      
      {/* Page Header */}
      <header className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
          {event?.event_name}
        </h1>
      </header>

      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-10 space-y-8">

        {/* Navigation */}
        <nav className="flex flex-wrap gap-4 border-b pb-6">
          <Link
            to={`/events/${event?.event_id}`}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 transition"
          >
            Event
          </Link>

          <Link
            to="teams"
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 transition"
          >
            Teams
          </Link>

          <Link
            to="statistics"
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 transition"
          >
            Statistics
          </Link>

          {/* Only show edit button if owner of event */}
          {userId === event?.owner_id && <Link
            to={`/events/edit/${event?.event_id}`}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Edit
          </Link>}
        </nav>

        {/* Participants Section */}
        <div className="bg-gray-50 rounded-2xl p-6 space-y-6">
          <h2 className="text-xl font-semibold text-gray-800 tracking-tight">
            Participants
          </h2>

          {loading && (
            <p className="text-gray-600">Loading participants…</p>
          )}

          {!loading && participants.length === 0 && (
            <p className="text-gray-600">
              No participants found for this event.
            </p>
          )}

          {!loading && participants.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {participants.map((p) => (
                <div
                  key={p.profile_id}
                  className="
                    px-5 py-2
                    bg-white
                    border
                    rounded-full
                    text-sm
                    font-medium
                    text-gray-800
                    shadow-sm
                    hover:shadow-md
                    hover:scale-105
                    transition-all
                    duration-200
                  "
                >
                  {p.username}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
