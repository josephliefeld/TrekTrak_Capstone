import { Outlet, Link } from 'react-router-dom';
import { supabase } from "@/components/lib/supabase/client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell } from "@/components/ui/table";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel
} from "@/components/ui/select"
import React from 'react';


type Event = {
  id: number;
  organizer: string;
  event_name: string;
  event_type: string;
  is_private: boolean;
  start_date: string;
  end_date: string;
  event_description: string;
};

export default function EventView() {
  const[openEditor, setOpenEditor] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [viewEventId, setViewEventId] = useState<number[]>([]);
  const [eventCol, setEventCol] = useState<string>("");

  const[events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase.from<"events", Event>("events").select("*");
      if (error) {
        console.error("Error fetching events:", error);
      } else {
        setEvents(data ?? []);
      }
  };
    fetchEvents();
  }, [events]);


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

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">View and Edit Events</h1>
      <p>This will be the page that allows organizations to view and update a specific event.</p>

      <nav className="p-4 bg-gray-100 flex gap-4">
        <Link to="participants">Participants</Link>
        <Link to="teams">Teams</Link>
        <Link to="statistics">Statistics</Link>
      </nav>
        <Outlet /> 


        <Table className='table-fixed'>
          <TableHeader>
            <TableRow>
              <TableHead className='text-center'>Event Name</TableHead>
              <TableHead className='text-center'>Organizer</TableHead>
              <TableHead></TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {events.map((event) => (
              <React.Fragment key={event.id}>
                <TableRow>
                  <TableCell>
                    <Link to="../create">{event.event_name}</Link>
                  </TableCell>
                  <TableCell>{event.organizer}</TableCell>
                  <TableCell>
                    <Button onClick={() => setOpenEditor(event.id)}>Edit</Button>
                  </TableCell>
                  <TableCell>
                    <Button onClick={() => addEventIdToView(event.id)}>View</Button>
                  </TableCell>
                </TableRow>

                {/* Shows rest of event details */}
                {viewEventId.includes(event.id) && (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <p>{event.is_private ? "Private Event" : "Public Event"}</p>
                      <p>Event Type: {event.event_type} </p>
                      <p>{event.event_description}</p>
                      <p>Start Date: {event.start_date}</p>
                      <p>End Date: {event.end_date}</p>
                    </TableCell>
                  </TableRow>
                )}

              </React.Fragment>
            ))}

          </TableBody>

        </Table>

        
        {openEditor && 
        (<div> Edit Event Name for {openEditor} 
          <Select value={eventCol} onValueChange={(value) => setEventCol(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Edit" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Event</SelectLabel>
                <SelectItem value="event_name">Name</SelectItem>
                <SelectItem value="event_description">Description</SelectItem>
                <SelectItem value="event_type">Event Type</SelectItem>
                <SelectItem value="start_date">Start Date</SelectItem>
                <SelectItem value="end_date">End Date</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Textarea placeholder={eventCol} className="mb-2 mt-2" value={text} onChange={(e) => setText(e.target.value)}/>
          <Button onClick={() => {updateEvent(openEditor, text, eventCol); setOpenEditor(null)}}>Save Changes</Button>
        </div>
        )}
          
    </div>
  )
}