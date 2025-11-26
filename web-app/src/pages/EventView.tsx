// import { Outlet, Link } from 'react-router-dom';
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

useEffect(() => {
  if (!event) return;

  setTitle(event.event_name);
  setDescription(event?.event_description);
  // setStartDate(event.start_date);
  // setEndDate(event.end_date);
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

    // convert dates to strings of format YYYY-MM-DD
    const start_date = startDate ? startDate.toISOString().split("T")[0] : null;
    const end_date = endDate ? endDate.toISOString().split("T")[0] : null;

    const { data, error } = await supabase
      .from("events")
      .insert([
        {
          organizer: "Default Organizer",
          event_name: title,
          event_type: eventType,
          is_private: isPrivate,
          start_date,
          end_date,
          event_description: description,
          is_published: isPublished,
        },
      ]);

      if(error) {
        console.log("Error creating event: ", error.message);
        alert("Failed to add event: " + error.message);
      } else {
        alert("Event added successfully!");
        console.log("Inserted:", data);
        // Optionally clear the form
        setTitle("");
        setDescription("");
        setEventType("");
        setIsPrivate(false);
        setIsPublished(false);
        setStartDate(undefined);
        setEndDate(undefined);
      }
  };





  // const[openEditor, setOpenEditor] = useState<number | null>(null);
  // const [text, setText] = useState("");
  // const [eventCol, setEventCol] = useState<string>("");
  const [viewEventId, setViewEventId] = useState<number[]>([]);




  // const updateEvent = async (id: number, edit_value: string, event_col: string) => {
  //   const {error} = await supabase
  //   .from('events')
  //   .update({[event_col]: edit_value})
  //   .eq('id', id)

  //   if (error) {
  //     console.error("Error updating event: ", error);
  //   }
  // };


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

        <h2>Event Description</h2>
        <p>{event?.is_private ? "Private Event" : "Public Event"}</p>
        <p>Event Type: {event?.event_type} </p>
        <p>{event?.event_description}</p>
        <p>Start Date: {event?.start_date}</p>
        <p>End Date: {event?.end_date}</p>



        <Button onClick={() => {setOpenEditor(!openEditor)}}>Edit Event</Button>


      </div>

      {openEditor &&
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <FieldSet>
            <FieldLegend>Add Event Details</FieldLegend>
            {/* <FieldDescription>
              Add event information
            </FieldDescription> */}
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="title">Event Title</FieldLabel>
                <input
                  id="title"
                  placeholder="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="banner">Banner Image</FieldLabel>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    id="banner"
                    accept=".png, .jpeg, .jpg"
                    className="hidden"
                    onChange={handleValidatedFileChange}
                  />
                  <label
                    htmlFor="banner"
                    className="px-1 py-1 w-[64] border border-gray-300 text-sm"
                  >
                    Choose File
                  </label>
                  <span className="text-sm text-gray-600">{fileName}</span>
                </div>
                {fileError && (
                  <p className="text-sm text-red-500 mt-1">{fileError}</p>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="description">Event Description</FieldLabel>
                <Textarea 
                  id="description"
                  placeholder="Description"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </Field>
              <div className="w-[200px]">
                <Field>
                  <FieldLabel htmlFor="type">Event Type</FieldLabel>
                  <Select value={eventType} onValueChange={(value) => setEventType(value)}>
                    <SelectTrigger id="type">
                      <SelectValue placeholder="--" />
                    </SelectTrigger>
                    <SelectContent >
                      <SelectItem value="default">--</SelectItem>
                      <SelectItem value="steps">Steps</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <div className="flex gap-6">
                <Field>
                  <FieldLabel>Start Date</FieldLabel>
                    <Popover open={startOpen} onOpenChange={setStartOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          id="date"
                          className="w-48 justify-between font-normal"
                        >
                          {startDate ? startDate.toLocaleDateString() : "Select start date"}
                          <ChevronDownIcon />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          captionLayout="dropdown"
                          onSelect={(date) => {
                            setStartDate(date)
                            setStartOpen(false)
                          }}
                          // NEED TO FIX DATE RANGE
                          // disabled={{
                          //   before: new Date(2000, 0, 1),
                          //   after: new Date(2035, 11, 31),
                          // }}
                        />
                      </PopoverContent>
                    </Popover>
                </Field>
                <Field>
                  <FieldLabel>End Date</FieldLabel>
                  <Popover open={endOpen} onOpenChange={setEndOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        id="date"
                        className="w-48 justify-between font-normal"
                      >
                        {endDate ? endDate.toLocaleDateString() : "Select end date"}
                        <ChevronDownIcon />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        captionLayout="dropdown"
                        onSelect={(date) => {
                          setEndDate(date)
                          setEndOpen(false)
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </Field>
              </div>
              <Field>
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="make-private"
                    className="w-[16px]"
                    // onClick={() => {console.log("Selected Make Private")}}
                    checked={isPrivate}
                    onCheckedChange={(checked) => setIsPrivate(!!checked)}
                  />
                  <div className="grid gap-2">
                    <Label htmlFor="make-private">
                      Make Private
                    </Label>
                    <p className="text-muted-foreground text-sm">
                      Make event private so only approved users can join.
                    </p>
                  </div>
                </div>
              </Field>
              <Field>
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="publish"
                    className="w-[16px]"
                    // onClick={() => {console.log("Selected Publish")}}
                    checked={isPublished}
                    onCheckedChange={(checked) => setIsPublished(!!checked)}
                  />
                  <div className="grid gap-2">
                    <Label htmlFor="publish">
                      Publish Event
                    </Label>
                    <p className="text-muted-foreground text-sm">
                      Allow users to view and register for this event.
                    </p>
                  </div>
                </div>
              </Field>
              <Field orientation="horizontal">
                <Button type="submit" onClick={() => {console.log("Event Saved")}}>Save</Button>
                <Button variant="outline" type="button" onClick={() => navigate("/events")}>Cancel</Button>
              </Field>
            </FieldGroup>
          </FieldSet>
        </FieldGroup>
      </form>
}


      

      



          
    </div>
  )
}