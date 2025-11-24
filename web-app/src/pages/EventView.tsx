// import { Outlet, Link } from 'react-router-dom';
import { supabase } from "@/components/lib/supabase/client";
import { useEffect, useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Table, TableBody, TableCell } from "@/components/ui/table";
// import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
//   SelectGroup,
//   SelectLabel
// } from "@/components/ui/select"
// import React from 'react';
import { useParams } from "react-router-dom";


type Event = {
  event_id: number;
  organizer: string;
  event_name: string;
  event_type: string;
  is_private: boolean;
  start_date: string;
  end_date: string;
  event_description: string;
};

export default function EventView() {
  // const[openEditor, setOpenEditor] = useState<number | null>(null);
  // const [text, setText] = useState("");
  // const [eventCol, setEventCol] = useState<string>("");
  const [viewEventId, setViewEventId] = useState<number[]>([]);

  const[event, setEvent] = useState<Event | null>(null);

  const { eventId } = useParams();


  useEffect(() => {
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
    fetchEvents();
  }, [eventId]);


  const updateEvent = async (id: number, edit_value: string, event_col: string) => {
    const {error} = await supabase
    .from('events')
    .update({[event_col]: edit_value})
    .eq('id', id)

    if (error) {
      console.error("Error updating event: ", error);
    }
  };


  const addEventIdToView = (id: number) => {
    const newList = viewEventId
    if (newList.includes(id)) {
      const index = newList.indexOf(id);
      newList.splice(index, 1);
    }
    else {
      newList.push(id)
    }
    setViewEventId(newList)
  };

  // const { eventId } = useParams<{ eventId: string }>();


  return (
    <div className="p-6">
      <h1> {eventId} </h1>
      <h1 className='font-bold text-3xl'>{event?.event_name}</h1>
      
      <div>

        <h2>Event Description</h2>
        <Textarea
          id="description"
          placeholder="Description"
          defaultValue={event?.event_description}
        />
        <p>{event?.is_private ? "Private Event" : "Public Event"}</p>
        <p>Event Type: {event?.event_type} </p>
        <p>{event?.event_description}</p>
        <p>Start Date: {event?.start_date}</p>
        <p>End Date: {event?.end_date}</p>

        

      </div>

      

      



          
    </div>
  )
}