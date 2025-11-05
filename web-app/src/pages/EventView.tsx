import { Outlet, Link } from 'react-router-dom';
import { supabase } from "@/components/lib/supabase/client";
import { useEffect, useState } from "react";

type Event = {
  id: number;
  organizer: string;
  event_name: string;
};

export default function EventView() {
  const[events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase.from<Event>("event").select("*");
      if (error) {
        console.error("Error fetching events:", error);
      } else {
        setEvents(data ?? []);
      }
  };
    fetchEvents();
  }, []);



  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">View and Edit Events</h1>
      <p>This will be the page that allows organizations to view and update a specific event.</p>
      {/* <a href=></a> */}

      <nav className="p-4 bg-gray-100 flex gap-4">
        <Link to="participants">Participants</Link>
        <Link to="teams">Teams</Link>
        <Link to="statistics">Statistics</Link>
        </nav>
        <Outlet /> 


        
        <ul className="border">
          {events.map((event) => (
            <li key={event.id}>
              Event Name: {event.event_name} Organizer: {event.organizer}
            </li>
          ))}
        </ul>

    </div>
  )
}