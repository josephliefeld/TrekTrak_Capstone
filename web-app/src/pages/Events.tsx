import { Outlet, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button"
import { supabase } from "@/components/lib/supabase/client";
import { useEffect, useState } from "react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useAuth } from '../context/useAuth';

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
  banner_url?: string;
  owner_id: string;
};

export default function Events() {

  const {userId} = useAuth()

  console.log("User ID in Events:", userId);


  const [events, setEvents] = useState<Event[]>([]);
  const [viewEventId, setViewEventId] = useState<number[]>([]);
  const [search, setSearch] = useState<string>("");

  const [searchCols, setSearchCols] = useState<(keyof Event)[]>([
    "event_name",
    "event_description",
  ]);

  const [ongoingChecked, setOngoingChecked] = useState(false);
  const [pastChecked, setPastChecked] = useState(false);

  const [startDateFrom, setStartDateFrom] = useState<Date | undefined>();
  const [startDateTo, setStartDateTo] = useState<Date | undefined>();
  const [endDateFrom, setEndDateFrom] = useState<Date | undefined>();
  const [endDateTo, setEndDateTo] = useState<Date | undefined>();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from<"events", Event>("events")
      .select("*");

    if (error) {
      console.error("Error fetching events:", error);
    } else {
      setEvents(data ?? []);
    }
  };


  const deleteEvent = async (event_id: number) => {
    const { error } = await supabase
      .from("events")
      .delete()
      .eq("event_id", event_id);
      
      if (error) {
        console.error("Error deleting event:", error);
      } else {
          fetchEvents(); // Refresh the list after deletion
      }
  }

  const addEventIdToView = (id: number) => {
    setViewEventId(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );
  };

  // Filter Functions
  const checkOngoing = (event: Event) => {
    const today = new Date();
    const start = new Date(event.start_date);
    if (event.end_date) {
      const end = new Date(event.end_date);
      return today >= start && today <= end;
    }
    return today >= start;
  };

  const checkPast = (event: Event) => {
    const today = new Date();
    if (event.end_date) {
      const end = new Date(event.end_date);
      return today > end;
    }
    return false;
  };

  const parseLocalDate = (dateString: string) => {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  const checkStartDate = (event: Event) => {
    const start = parseLocalDate(event.start_date);
    if (startDateFrom && startDateTo) return start >= startDateFrom && start <= startDateTo;
    if (startDateFrom) return start >= startDateFrom;
    if (startDateTo) return start <= startDateTo;
    return true;
  };

  const checkEndDate = (event: Event) => {
    if (!event.end_date) return true;
    const end = parseLocalDate(event.end_date);
    if (endDateFrom && endDateTo) return end >= endDateFrom && end <= endDateTo;
    if (endDateFrom) return end >= endDateFrom;
    if (endDateTo) return end <= endDateTo;
    return true;
  };

  const resetFilters = () => {
    setOngoingChecked(false);
    setPastChecked(false);
    setStartDateFrom(undefined);
    setStartDateTo(undefined);
    setEndDateFrom(undefined);
    setEndDateTo(undefined);
  };

  // Apply search and filters
  let filteredEvents = events.filter(event =>
    searchCols.some(col =>
      String(event[col] ?? "").toLowerCase().includes(search.toLowerCase())
    )
  );

  if (ongoingChecked) {
    filteredEvents = filteredEvents.filter(checkOngoing);
  } else if (pastChecked) {
    filteredEvents = filteredEvents.filter(checkPast);
  }

  filteredEvents = filteredEvents.filter(checkStartDate);
  filteredEvents = filteredEvents.filter(checkEndDate);

  return (
    <>
      {/* Header */}
      <div className="p-6">
        <h1 className="text-3xl font-extrabold text-blue-600 tracking-tight">
          Events
        </h1>
        <p className="mt-1 text-gray-600">
          View all past, present, and future events.
        </p>
      </div>

      <div className="p-6 border border-gray-300 rounded-2xl space-y-6 bg-white">

        {/* Search + Filters */}
        <div className="flex gap-4 items-start w-full">

          <Select onValueChange={(value) => {
            if (value === "all") {
              setSearchCols(["event_name", "event_description"]);
            } else {
              setSearchCols([value as keyof Event]);
            }
          }}>
            <SelectTrigger className="min-w-[160px]">
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

          <Textarea
            placeholder="Search events..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="rounded-xl min-h-0 h-auto resize-none flex-1"
          />

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">Filter</Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 space-y-4">

              <div className="flex gap-4">
                <Checkbox
                  checked={ongoingChecked}
                  onCheckedChange={(c) => setOngoingChecked(Boolean(c))}
                />
                <Label>Ongoing</Label>

                <Checkbox
                  checked={pastChecked}
                  onCheckedChange={(c) => setPastChecked(Boolean(c))}
                />
                <Label>Past</Label>
              </div>

              <Label>Start Date</Label>
              <Calendar
                mode="range"
                selected={{ from: startDateFrom, to: startDateTo }}
                onSelect={(range) => {
                  setStartDateFrom(range?.from);
                  setStartDateTo(range?.to);
                }}
              />

              <Label>End Date</Label>
              <Calendar
                mode="range"
                selected={{ from: endDateFrom, to: endDateTo }}
                onSelect={(range) => {
                  setEndDateFrom(range?.from);
                  setEndDateTo(range?.to);
                }}
              />

              <Button onClick={resetFilters}>Reset</Button>

            </PopoverContent>
          </Popover>
        </div>

        {/* Event Cards */}
        <div className="space-y-6 mt-6">

          {filteredEvents.map((event) => (
            <React.Fragment key={event.event_id}>

              <div className="flex items-center justify-between bg-gray-100 hover:bg-gray-200 transition rounded-2xl p-6 shadow-sm">

                {/* Left Side */}
                <div className="flex items-center gap-6">

                  <div className="w-28 h-28 overflow-hidden rounded-xl bg-gray-300 flex-shrink-0">
                    <img
                      src={event.banner_url || "https://picsum.photos/200/300"}
                      alt={event.event_name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div>
                    <Link
                      to={`/events/${event.event_id}`}
                      className="text-3xl font-extrabold text-gray-800 hover:text-blue-600 transition"
                    >
                      {event.event_name}
                    </Link>

                    <p className="text-gray-500 mt-1 text-left text-lg">
                      by {event.organizer}
                    </p>
                  </div>
                </div>

                {/* Right Side Buttons */}
                <div className="flex items-center gap-10">
                  
                  {/* Display Edit and Delete Button only if event owner */}
                  {event.owner_id === userId && (
                    <div className='flex gap-4'>
                      <Link to={`/events/edit/${event.event_id}`}>
                        <Button size="lg" variant="default">Edit</Button>
                      </Link>
                    

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive">Delete</Button>
                        </AlertDialogTrigger>

                          <AlertDialogContent>
                              <AlertDialogHeader>
                            <AlertDialogTitle>Delete Event?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete your
                              event and all associated data.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteEvent(event.event_id)}
                              variant="destructive"
                            >
                              Continue
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      
                    </div>
                  )}



                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => addEventIdToView(event.event_id)}
                  >
                    View
                  </Button>
                </div>

              </div>

              {/* Expandable Details */}
              {viewEventId.includes(event.event_id) && (
                <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
                  <p>{event.event_description}</p>
                  <p className="mt-2">
                    {event.is_private ? "Private Event" : "Public Event"}
                  </p>
                  <p>Type: {event.event_type}</p>
                  <p>Start: {event.start_date}</p>
                  <p>End: {event.end_date}</p>
                </div>
              )}

            </React.Fragment>
          ))}

        </div>

        <Outlet />
      </div>
    </>
  );
}
