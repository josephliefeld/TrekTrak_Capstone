import { Link } from 'react-router-dom';
import { supabase } from "@/components/lib/supabase/client";
import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  // SelectGroup,
  // SelectLabel
} from "@/components/ui/select"
import React from 'react';
import { useParams } from "react-router-dom";
import {
  Field,
  // FieldContent,
  // FieldDescription,
  // FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  // FieldSeparator,
  FieldSet,
  // FieldTitle,
} from "@/components/ui/field"
import { ChevronDownIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useNavigate } from "react-router-dom";



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

  useEffect(() => {
    if (!event) return;

    setTitle(event.event_name);
    setDescription(event?.event_description);
    // Parse dates as UTC to avoid timezone issues
    setStartDate(new Date(event.start_date + 'T00:00:00Z'));
    setEndDate(new Date(event.end_date + 'T00:00:00Z'));
    setIsPrivate(event.is_private);
    setEventType(event.event_type);
    setIsPublished(event.is_published);
  }, [event]);



  const [startDate, setStartDate] = React.useState<Date | undefined>();
  const [endDate, setEndDate] = React.useState<Date | undefined>();
  const [startOpen, setStartOpen] = React.useState(false);
  const [endOpen, setEndOpen] = React.useState(false);

  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [eventType, setEventType] = React.useState("");
  const [isPrivate, setIsPrivate] = React.useState(false);
  const [isPublished, setIsPublished] = React.useState(false);

  const [fileName, setFileName] = React.useState("No file chosen");
  const [fileError, setFileError] = React.useState("");

  const [openEditor, setOpenEditor] = useState<boolean>(false);

  const navigate = useNavigate();

  const handleValidatedFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) {
      setFileName("No file chosen");
      setFileError("");
      return;
    }

    const allowedTypes = ["image/png", "image/jpeg"];
    if (!allowedTypes.includes(file.type)) {
      setFileError("Only PNG or JPG images are allowed.");
      setFileName("No file chosen");
      return;
    }

    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      setFileError("File is too large. Maximum size is 2MB.");
      setFileName("No file chosen");
      return;
    }

    setFileError("");
    setFileName(file.name);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // convert dates to strings of format YYYY-MM-DD (in local timezone)
    const start_date = startDate ? startDate.toLocaleDateString('en-CA') : null;
    const end_date = endDate ? endDate.toLocaleDateString('en-CA') : null;

    await updateEvent(event!.event_id, start_date, end_date);

    setOpenEditor(false);

    //Call fetchEvents to Refresh page data
    await fetchEvents();


    //   if(error) {
    //     console.log("Error creating event: ", error.message);
    //     alert("Failed to add event: " + error.message);
    //   } else {
    //     alert("Event added successfully!");
    //     console.log("Inserted:", data);
    //     // Optionally clear the form
    //     setTitle("");
    //     setDescription("");
    //     setEventType("");
    //     setIsPrivate(false);
    //     setIsPublished(false);
    //     setStartDate(undefined);
    //     setEndDate(undefined);
    //   }
  };





  // const[openEditor, setOpenEditor] = useState<number | null>(null);
  // const [text, setText] = useState("");
  // const [eventCol, setEventCol] = useState<string>("");
  //const [viewEventId, setViewEventId] = useState<number[]>([]);




  const updateEvent = async (id: number, start_date: string | null, end_date: string | null) => {
    const {error} = await supabase
    .from('events')
    .update({
      event_name: title,
      event_type: eventType,
      is_private: isPrivate,
      start_date: start_date,
      end_date: end_date,
      event_description: description,
      is_published: isPublished,

  })
    .eq('event_id', id)

    if (error) {
      console.error("Error updating event: ", error);
    }
  };


  // const addEventIdToView = (id: number) => {
  //   const newList = viewEventId
  //   if (newList.includes(id)) {
  //     const index = newList.indexOf(id);
  //     newList.splice(index, 1);
  //   }
  //   else {
  //     newList.push(id)
  //   }
  //   setViewEventId(newList)
  // };

  // const { eventId } = useParams<{ eventId: string }>();


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