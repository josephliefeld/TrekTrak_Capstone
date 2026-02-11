import { useParams, Link } from "react-router-dom";
import { supabase } from "@/components/lib/supabase/client";
import { useEffect, useState } from "react";

interface Profile { 
  profile_id: string; 
  username: string; 
}

// interface DailyStepsRow { 
//   profile_id: string; 
//   profiles: Profile; 
// }

type Event = {
  event_id: number;
  event_name: string;
};

export default function Participants() {
  const[event, setEvent] = useState<Event | null>(null);
  const [participants, setParticipants] = useState<Profile[]>([]); 
  const [loading, setLoading] = useState(true);

  const { eventId } = useParams(); // NOT GETTING THE EVENT ID "undefined"
  console.log(eventId);

  const fetchEvents = async () => {
    if (!eventId) return;

    const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq('event_id', eventId)
    .single();

    if (error) {
      console.error("Error fetching events:", error);
    } else {
      setEvent(data);
    }
  };

  const fetchParticipants = async () => {
    if (!eventId) return; 
    
    const { data, error } = await supabase
    .from("daily_steps")
    .select("profile_id, profiles(*)")
    .eq("event_id", eventId) as {
      data: { profile_id: string, username: string }[] | null;
      error: any;
    };
    
    if (error) { 
      console.error("Error fetching participants:", error); 
      return; 
    } 
    
    // Extract unique profiles 
    const uniqueProfiles: Profile[] = Array.from( 
      new Map(
        data!.map((row) => [ row.profile_id, { profile_id: row.profile_id, username: row.username } ])
      ).values() 
    ); 
      
    setParticipants(uniqueProfiles); 
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchEvents(), fetchParticipants()]).finally(() =>
      setLoading(false) 
      ); 
    }, [eventId]);

  // GO THRU DAILY_STEPS TO GET EVENT_ID AND PROFILE_ID

  return (
    <div className="p-6">
      <h1 className='font-bold text-3xl'>{`${event?.event_name}`}</h1>
      <h2 className="text-3xl font-bold">Participants</h2>
      <p>View the participants for this event</p>
      <nav className="p-4 bg-gray-100 flex gap-4">
          <Link to={`/events/${event?.event_id}`}>Event</Link>
          <Link to="teams"> Teams</Link>
          <Link to="statistics"> Statistics</Link>
          <Link to={`/events/edit/${event?.event_id}`}> Edit</Link>
      </nav>

      {loading && <p>Loading participants…</p>}

      {!loading && participants.length === 0 && (
        <p>No participants found for this event.</p>
      )}

      {!loading && participants.length > 0 && (
        <ul className="space-y-3 mt-4">
          {participants.map((p) => (
            <li key={p.profile_id} className="p-3 border rounded flex items-center gap-3" >
              <span>{p.username}</span>
            </li>
          ))}
        </ul>
      )}

    </div>
  );
}