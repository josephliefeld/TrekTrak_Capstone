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

//import { Calendar } from "@/components/ui/calendar"

import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';


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
  //const[openEditor, setOpenEditor] = useState<number | null>(null);
  //const [text, setText] = useState("");
  const [viewEventId, setViewEventId] = useState<number[]>([]);
  const [searchCol, setSearchCol] = useState<string>("event_name");

  const[events, setEvents] = useState<Event[]>([]);

  //const [startDate, setStartDate] = useState<Date | undefined>();
  //const [endDate, setEndDate] = React.useState<Date | undefined>();

  const [search, setSearch] = useState<string>("");


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

  /*const updateEvent = async (id: number, edit_value: string|null, event_col: string) => {
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
  };*/

  const addEventIdToView = (id: number) => {
    setViewEventId((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  /*const checkDateInRange = (eventDateStr: string, startDate?: Date, endDate?: Date) => {
    const eventDate = new Date(eventDateStr);
    if (startDate && eventDate < startDate) return false;
    if (endDate && eventDate > endDate) return false;
    return true;
  }*/

  const filteredEvents = events.filter(event =>
    String(event[searchCol as keyof Event]).toLowerCase().includes(search.toLowerCase())
  );


  return (
    <>
      <div className='p-6'>
        <h1 className="text-3xl font-bold">Events</h1>
      </div>
      <div className='flex flex-col items-start gap-2'>
        <p>View all past, present, and future events.</p>

      {/* Search Bar*/}
      <div className='w-2/3 flex'>
        <Select onValueChange={(value) => setSearchCol(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Search by" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Event Columns</SelectLabel>
              <SelectItem value="event_name">Event Name</SelectItem>
              <SelectItem value="event_description">Description</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <Textarea
          placeholder="Search events by name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className='rounded-xl  min-h-0 h-auto resize-none'
        />

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">Filter</Button>
          </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="leading-none font-medium">Search Filter</h4>
                  <p className="text-muted-foreground text-sm">
                    Filter events by start and end date
                  </p>
                </div>
                  <div className="flex  gap-3">
                    <Checkbox id="ongoing" className='bg-red-100' />
                    <Label htmlFor="ongoing">Ongoing</Label>

                    <Checkbox id="terms" className='bg-red-100' />
                    <Label htmlFor="terms">Past</Label>
                  </div>
              </div>
            </PopoverContent>
          </Popover>
      </div>

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
            {filteredEvents.map((event) => (
              <React.Fragment key={event.event_id}>
                <TableRow>
                  <TableCell>
                    <Link to={`/events/${event.event_id}`}>{event.event_name}</Link>
                  </TableCell>
                  <TableCell>{event.organizer}</TableCell>
                  <TableCell>
                    {/* <Button onClick={() => setOpenEditor(event.event_id)}>Edit</Button> */}
                    <Link to={`/events/edit/${event.event_id}`}>
                      <Button>Edit</Button>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Button onClick={() => addEventIdToView(event.event_id)}>View</Button>
                  </TableCell>
                </TableRow>

                {/* Shows rest of event details */}
                {viewEventId.includes(event.event_id) && (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <p>{event.event_description}</p>
                      <p>{event.is_private ? "Private Event" : "Public Event"}</p>
                      <p>Event Type: {event.event_type} </p>
                      <p>Start Date: {event.start_date}</p>
                      <p>End Date: {event.end_date}</p>
                    </TableCell>
                  </TableRow>
                )}

              </React.Fragment>
            ))}

          </TableBody>

        </Table>

                
        <Outlet /> 
      </div>
    </>
  )
}