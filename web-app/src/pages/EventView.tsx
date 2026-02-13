import { Link } from 'react-router-dom';
import { supabase } from "@/components/lib/supabase/client";
import { useEffect, useState } from "react";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
//   // SelectGroup,
//   // SelectLabel
// } from "@/components/ui/select"
import React from 'react';
import { useParams } from "react-router-dom";
// import {
//   Field,
  // FieldContent,
  // FieldDescription,
  // FieldError,
  // FieldGroup,
  // FieldLabel,
  // FieldLegend,
  // FieldSeparator,
  // FieldSet,
  // FieldTitle,
// } from "@/components/ui/field"
// import { ChevronDownIcon } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { Calendar } from "@/components/ui/calendar"
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover"
// import { Checkbox } from "@/components/ui/checkbox"
// import { Label } from "@/components/ui/label"
// import { useNavigate } from "react-router-dom";



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
};

export default function EventView() {
  const[event, setEvent] = useState<Event | null>(null);

  const { eventId } = useParams();
  console.log(eventId)
  

  const fetchEvents = async () => {
    if (!eventId) return;

    const { data, error } = await supabase.from("events")
    .select("*")
    .eq('event_id', eventId).single();
    if (error) {
      console.error("Error fetching events:", error);
    } else {
      setEvent(data);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [eventId]);

  return (
    <div className="p-6">
      <h1 className='font-bold text-3xl'>{event?.event_name}</h1>
      
      <div>
        <nav className="p-4 bg-gray-100 flex gap-4">
          <Link to={`/events/participants/${event?.event_id}`}>Participants</Link>
          <Link to="teams">Teams</Link>
          <Link to="statistics">Statistics</Link>
          <Link to={`/events/edit/${event?.event_id}`}> Edit</Link>
        </nav>

    
        <div className='bg-gray-100 p-4 rounded m-4'>
          <h2 className='font-bold'>Event Description</h2>
          <p>{event?.event_description}</p>

        </div>

        
        <div className='bg-gray-100 p-4 rounded m-4'>
          <p>{event?.is_private ? "Private Event" : "Public Event"}</p>
          <p>{event?.is_published ? "Published": "Not Published"}</p>
          <p>Event Type: {event?.event_type} </p>
          <p>Start Date: {event?.start_date}</p>
          <p>End Date: {event?.end_date}</p>
        </div>


      </div>
          
    </div>
  )
}