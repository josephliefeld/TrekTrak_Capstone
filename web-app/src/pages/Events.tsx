import { Outlet, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button"
import { supabase } from "@/components/lib/supabase/client";
import { useEffect, useState } from "react";
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

import { Calendar } from "@/components/ui/calendar"

import React from 'react';


type Event = {
  event_id: number;
  organizer: string;
  event_name: string;
  event_type: string;
  is_private: boolean;
  start_date: string;
  end_date: string;
  event_description: string;
  is_publshed: boolean;
};

export default function Events() {
  const[openEditor, setOpenEditor] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [viewEventId, setViewEventId] = useState<number[]>([]);
  const [eventCol, setEventCol] = useState<string>("");

  const[events, setEvents] = useState<Event[]>([]);

  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = React.useState<Date | undefined>();


  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
        const { data, error } = await supabase.from<"events", Event>("events").select("*");
        if (error) {
          console.error("Error fetching events:", error);
        } else {
          setEvents(data ?? []);
        }
    };

  const updateEvent = async (id: number, edit_value: string|null, event_col: string) => {
    let new_value = edit_value;
    if (event_col === "start_date") {
      new_value = startDate ? startDate.toISOString().split("T")[0] : null;
    }
    else if (event_col === "end_date") {
      new_value = endDate ? endDate.toISOString().split("T")[0] : null;
    }

    const {error} = await supabase
    .from('events')
    .update({[event_col]: new_value})
    .eq('event_id', id)

    if (error) {
      console.error("Error updating event: ", error);
    }

    fetchEvents();
  };

  const addEventIdToView = (id: number) => {
    setViewEventId((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };


  return (
    <>
      <div className='p-6'>
        <h1 className="text-3xl font-bold">Events</h1>
      </div>
      <div className='flex flex-col items-start gap-2'>
        <p>View all past, present, and future events.</p>
        {/* <Button variant="link">
          <Link to="view-and-edit">View Event 1</Link>
        </Button> */}

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
                      <React.Fragment key={event.event_id}>
                        <TableRow>
                          <TableCell>
                            <Link to={`/events/${event.event_id}`}>{event.event_name}</Link>
                          </TableCell>
                          <TableCell>{event.organizer}</TableCell>
                          <TableCell>
                            <Button onClick={() => setOpenEditor(event.event_id)}>Edit</Button>
                          </TableCell>
                          <TableCell>
                            <Button onClick={() => addEventIdToView(event.event_id)}>View</Button>
                          </TableCell>
                        </TableRow>
        
                        {/* Shows rest of event details */}
                        {viewEventId.includes(event.event_id) && (
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
                (<div className='w-full'> Edit Event Name for {openEditor} 
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


                  {(eventCol === "start_date" || eventCol === "end_date") ? (
               
                          <Calendar
                            mode="single"
                            selected={eventCol === "start_date" ? startDate : endDate}
                            onSelect={eventCol === "start_date" ? setStartDate : setEndDate}
                            className="rounded-md border shadow-sm"
                            captionLayout="dropdown"
                          />
                    ) : 
                    (<Textarea
                      placeholder={eventCol}
                      className="mb-2 mt-2"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                    /> )}

                  <Button onClick={() => {updateEvent(openEditor, text, eventCol); setOpenEditor(null)}} className='mr-10'>Save Changes</Button>

                  <Button onClick={() => setOpenEditor(null)}>Cancel</Button>
                </div>
                )}
        <Outlet /> 
      </div>
    </>
  )
}