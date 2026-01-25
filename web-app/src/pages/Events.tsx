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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
// import { se } from 'date-fns/locale';
import { Field } from '@/components/ui/field';
// import { Input } from '@/components/ui/input';
import { ChevronDownIcon } from 'lucide-react';
// import { parse } from 'date-fns';

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
  // const [searchCol, setSearchCol] = useState<string>("event_name");

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

  const [searchCols, setSearchCols] = useState<(keyof Event)[]>([
    "event_name",
    "event_description",
  ]);

  // const toggleSearchCol = (col: keyof Event) => {
  //   setSearchCols(prevCols =>
  //     prevCols.includes(col)
  //       ? prevCols.filter(c => c !== col) // remove
  //       : [...prevCols, col]              // add
  //   );
  // };

  // Checks if event is ongoing - today is between start and end date
  const checkOngoing = (event: Event) => {
    const today = new Date();
    const start = new Date(event.start_date)
    if (event.end_date != null) {
      const end = new Date(event.end_date)
      return today >= start && today <= end;
    } else {
      return today >= start;
    }
  }
  
  //Checks if event is over = today is after end date
  const checkPast = (event: Event) => {
    const today = new Date();
    if (event.end_date != null) {
      const end = new Date(event.end_date)
      return today > end;
    } else {
      return false;
    }   
  }

  function parseLocalDate(dateString: string) {
      const [year, month, day] = dateString.split("-").map(Number);
      return new Date(year, month - 1, day);
  }

  const checkStartDate = (event: Event) => {
    const start = parseLocalDate(event.start_date);
    if (startDateFrom && startDateTo) {
      return start >= startDateFrom && start <= startDateTo;
    }
    else if (startDateFrom !== undefined )  {
      return start >= startDateFrom;
    }
    else if (startDateTo !== undefined )  {
      return start <= startDateTo;
    }
    else {
      return true;
    }

  }

  const checkEndDate = (event: Event) => {
    const end = parseLocalDate(event.end_date);
    if (endDateFrom && endDateTo) {
      return end >= endDateFrom && end <= endDateTo;
    }
    else if (endDateFrom !== undefined) {
      return end >= endDateFrom;
    }
    else if (endDateTo !== undefined) {
      return end <= endDateTo;
    }
    else {
      return true;
    }

  }

  const resetFilters = () => {
    setOngoingChecked(false);
    setPastChecked(false);
    setStartDateFrom(undefined);
    setStartDateTo(undefined);
    setEndDateFrom(undefined);
    setEndDateTo(undefined);
  }
  


  const [ongoingChecked, setOngoingChecked] = useState<boolean>(false);
  const [pastChecked, setPastChecked] = useState<boolean>(false);

  const [startFromOpen, setStartFromOpen] = useState(false);
  const [startToOpen, setStartToOpen] = useState(false);

  const [endFromOpen, setEndFromOpen] = useState(false);
  const [endToOpen, setEndToOpen] = useState(false);

  const [startDateFrom, setStartDateFrom] = useState<Date | undefined>();
  const [startDateTo, setStartDateTo] = useState<Date | undefined>();

  const [endDateFrom, setEndDateFrom] = useState<Date | undefined>();
  const [endDateTo, setEndDateTo] = useState<Date | undefined>();



  let filteredEvents = (events.filter(event =>
    searchCols.some(col =>
      String(event[col]).toLowerCase().includes(search.toLowerCase())
    )) 
  );  

  if (ongoingChecked) {
    filteredEvents = filteredEvents.filter(event => checkOngoing(event));
  } else if (pastChecked) {
    filteredEvents = filteredEvents.filter(event => checkPast(event));
  }

  filteredEvents = filteredEvents.filter(event => checkStartDate(event));
  filteredEvents = filteredEvents.filter(event => checkEndDate(event));

  

  // const filteredEvents = events.filter(event =>
  //   String(event[searchCol as keyof Event]).toLowerCase().includes(search.toLowerCase())
  // );


  return (
    <>
      <div className='p-6'>
        <h1 className="text-3xl font-bold">Events</h1>
      </div>
      <div className='flex flex-col items-start gap-2'>
        <p>View all past, present, and future events.</p>

      <div className='w-2/3 flex'>
        {/*Search By Filter*/}
        <Select onValueChange={(value) => {
          if (value == "all"){
            setSearchCols(["event_name", "event_description"]);
          } else {
            setSearchCols([value as keyof Event]);
          }
        }}>
          <SelectTrigger>
            <SelectValue placeholder="Search by" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Event Columns</SelectLabel>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="event_name">Event Name</SelectItem>
              <SelectItem value="event_description">Description</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* Search Bar*/}
        <Textarea
          placeholder="Search events by name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className='rounded-xl  min-h-0 h-auto resize-none'
        />

        {/*Ongoing or Past Events and Start End Date*/}
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
                    <Checkbox id="ongoing" className='bg-red-100' checked={ongoingChecked} onCheckedChange={(checked) => setOngoingChecked(Boolean(checked))}
/>
                    <Label htmlFor="ongoing">Ongoing</Label>

                    <Checkbox id="past" className='bg-red-100' checked={pastChecked} onCheckedChange={(checked) => setPastChecked(Boolean(checked))} />
                    <Label htmlFor="past">Past</Label>
                  </div>
                  {/* Start Date Filter */}
                  <Label>Start Date</Label>
                  <div className='flex flex-row gap-2'>
                    <Field >
                        <Popover open={startFromOpen} onOpenChange={setStartFromOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              id="date"
                              className="w-48 justify-between font-normal"
                            >
                              {startDateFrom ? startDateFrom.toLocaleDateString() : "Start From"}
                              <ChevronDownIcon />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={startDateFrom}
                              captionLayout="dropdown"
                              onSelect={(date) => {
                                setStartDateFrom(date)
                                setStartFromOpen(false)
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                      </Field>
                      <Field >
                        <Popover open={startToOpen} onOpenChange={setStartToOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              id="date"
                              className="w-48 justify-between font-normal"
                            >
                              {startDateTo ? startDateTo.toLocaleDateString() : "Start To"}
                              <ChevronDownIcon />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={startDateTo}
                              captionLayout="dropdown"
                              onSelect={(date) => {
                                setStartDateTo(date)
                                setStartToOpen(false)
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                      </Field>                 
                  </div>
                  {/* End Date Filter */}
                  <Label>End Date</Label>
                  <div className='flex flex-row gap-2'>
                    <Field >
                        <Popover open={endFromOpen} onOpenChange={setEndFromOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              id="date"
                              className="w-48 justify-between font-normal"
                            >
                              {endDateFrom ? endDateFrom.toLocaleDateString() : "End From"}
                              <ChevronDownIcon />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={endDateFrom}
                              captionLayout="dropdown"
                              onSelect={(date) => {
                                setEndDateFrom(date)
                                setEndFromOpen(false)
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                      </Field>

                      <Field >
                        <Popover open={endToOpen} onOpenChange={setEndToOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              id="date"
                              className="w-48 justify-between font-normal"
                            >
                              {endDateTo ? endDateTo.toLocaleDateString() : "End To"}
                              <ChevronDownIcon />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={endDateTo}
                              captionLayout="dropdown"
                              onSelect={(date) => {
                                setEndDateTo(date)
                                setEndToOpen(false)
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                      </Field>
                    
                    
                  </div>

                  <Button onClick={resetFilters}>Reset</Button>
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