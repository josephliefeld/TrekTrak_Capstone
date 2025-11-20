// importing full react namespace to use React.useState
import * as React from "react"
// for using navigate() when rerouting after clicking cancel/sumbit
import { useNavigate } from "react-router-dom";
// calendar icon for date selectors
import { CalendarIcon } from "lucide-react"
// database import
import { supabase } from "@/components/lib/supabase/client";
 
// Imports for Shadcn Components
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

// defines create page component
export default function Create() {
// State variables to store event details that the user inputs into the form
  // basic event information
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [eventType, setEventType] = React.useState("");
  const [fileName, setFileName] = React.useState("No file chosen");

  // CALENDAR INFORMATION
  // dates
  const initialDate = new Date("2025-06-01")
  const [startDate, setStartDate] = React.useState<Date | undefined>(initialDate)
  const [endDate, setEndDate] = React.useState<Date | undefined>(initialDate)
  const [startOpen, setStartOpen] = React.useState(false);
  const [endOpen, setEndOpen] = React.useState(false);
  // month shown in calendar popover
  const [startMonth, setStartMonth] = React.useState<Date | undefined>(initialDate)
  const [endMonth, setEndMonth] = React.useState<Date | undefined>(initialDate)
  // textual inut values shown in the text inputs (keeps input boxes independent)
  const [startValue, setStartValue] = React.useState("");
  const [endValue, setEndValue] = React.useState("");

  // whether the event is private (private toggle)
  const [isPrivate, setIsPrivate] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // allows going to another page
  const navigate = useNavigate();

  // When the user selects a file to upload, this displays the file name
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileName(file ? file.name : "No file chosen");
  };

  // helper function that formats a JS date object
  function formatDate(date: Date | undefined) {
    if (!date) {
      return ""
    }
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  }

  // helper function that checks if a date object is valid
  function isValidDate(date: Date | undefined) {
    if (!date) {
      return false
    }
    return !isNaN(date.getTime())
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // convert dates to strings of format YYYY-MM-DD
      const start_date = startDate ? startDate.toISOString().split("T")[0] : null;
      const end_date = endDate ? endDate.toISOString().split("T")[0] : null;

      // inserts event information the user inputs into supabase as a new event
      const { data, error } = await supabase
        .from("events")
        .insert(
          {
            event_name: title,
            event_description: description,
            event_type: eventType,
            start_date,
            end_date,
            is_private: isPrivate,
          },
        );
        // .select() // optional: returns inserted rows
  
        // hands error/success
        if(error) {
          console.log("Supabase insert error: ", error);
          alert("Failed to add event: " + (error.message ?? JSON.stringify(error)));
          return;
        }

        // success
        console.log("Inserted event:", data);
        alert("Event added successfully!");

        // clear the form
        setTitle("");
        setDescription("");
        setEventType("");
        setFileName("No file chosen");
        setStartDate(undefined);
        setEndDate(undefined);
        setStartValue("");
        setEndValue("");
        setStartMonth(undefined);
        setEndMonth(undefined);
        setIsPrivate(false);

        // navigate back to events/home page
        navigate("/events");

    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* const handleSubmit runs when the user Submits the form */}
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          {/* FieldSet for general event information input */}
          <FieldSet>
            <FieldLegend>Add Event Details</FieldLegend>
            <FieldGroup>
              {/* Title Text Input */}
              <Field>
                <FieldLabel htmlFor="title">Event Title</FieldLabel>
                <input
                  id="title"
                  placeholder="Title"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </Field>
              {/* Banner Image Input */}
              <Field>
                <FieldLabel htmlFor="banner">Banner Image</FieldLabel>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    id="banner"
                    accept=".png, .jpeg, .jpg"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <label
                    htmlFor="banner"
                    className="px-1 py-1 w-[64] border border-gray-300 text-sm"
                  >
                    Choose File
                  </label>
                  <span className="text-sm text-gray-600">{fileName}</span>
                </div>
              </Field>
              {/* Event Description Input */}
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
              {/* Event Type Dropdown */}
              <div className="w-[200px]">
                <Field>
                  <FieldLabel htmlFor="type">Event Type</FieldLabel>
                  <Select onValueChange={(value) => setEventType(value)}>
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
              {/* Date Selection Section */}
              <div className="flex gap-6">
                {/* Start Date Input/Selection */}
                <Field>
                  <div className="flex flex-col gap-3">
                    <Label htmlFor="date" className="px-1">
                      Start Date
                    </Label>
                    <div className="relative flex gap-2">
                      <Input
                        id="date"
                        value={startValue}
                        placeholder="June 01, 2025"
                        className="bg-background pr-10"
                        onChange={(e) => {
                          const date = new Date(e.target.value)
                          setStartValue(e.target.value)
                          if (isValidDate(date)) {
                            setStartDate(date)
                            setStartMonth(date)
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "ArrowDown") {
                            e.preventDefault()
                            setStartOpen(true)
                          }
                        }}
                      />
                      <Popover open={startOpen} onOpenChange={setStartOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            id="date-picker"
                            variant="ghost"
                            className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
                          >
                            <CalendarIcon className="size-3.5" />
                            <span className="sr-only">Select date</span>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto overflow-hidden p-0"
                          align="end"
                          alignOffset={-8}
                          sideOffset={10}
                        >
                          <Calendar
                            mode="single"
                            selected={startDate}
                            captionLayout="dropdown"
                            month={startMonth}
                            onMonthChange={setStartMonth}
                            onSelect={(date) => {
                              setStartDate(date)
                              setStartValue(formatDate(date))
                              setStartOpen(false)
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </Field>
                {/* End Date Input/Selection */}
                <Field>
                  <div className="flex flex-col gap-3">
                    <Label htmlFor="date" className="px-1">
                      End Date
                    </Label>
                    <div className="relative flex gap-2">
                      <Input
                        id="date"
                        value={endValue}
                        placeholder="June 01, 2025"
                        className="bg-background pr-10"
                        onChange={(e) => {
                          const date = new Date(e.target.value)
                          setEndValue(e.target.value)
                          if (isValidDate(date)) {
                            setEndDate(date)
                            setEndMonth(date)
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "ArrowDown") {
                            e.preventDefault()
                            setEndOpen(true)
                          }
                        }}
                      />
                      <Popover open={endOpen} onOpenChange={setEndOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            id="date-picker"
                            variant="ghost"
                            className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
                          >
                            <CalendarIcon className="size-3.5" />
                            <span className="sr-only">Select date</span>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto overflow-hidden p-0"
                          align="end"
                          alignOffset={-8}
                          sideOffset={10}
                        >
                          <Calendar
                            mode="single"
                            selected={endDate}
                            captionLayout="dropdown"
                            month={endMonth}
                            onMonthChange={setEndMonth}
                            onSelect={(date) => {
                              setEndDate(date)
                              setEndValue(formatDate(date))
                              setEndOpen(false)
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </Field>
              </div>
              {/* Toggle to Make Events Private */}
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
            </FieldGroup>
          </FieldSet>
          <FieldSeparator />
          {/* FieldSet for Tier Configuration */}
          <FieldSet>
            <FieldLegend>Tier Configuration</FieldLegend>
            <FieldGroup>

            </FieldGroup>
          </FieldSet>
          {/* Sumbit Button and Cancel Button */}
          <Field orientation="horizontal">
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save"}</Button>
            <Button variant="outline" type="button" onClick={() => navigate("/events")}>Cancel</Button>
          </Field>
        </FieldGroup>
      </form>
    </>
  )
}