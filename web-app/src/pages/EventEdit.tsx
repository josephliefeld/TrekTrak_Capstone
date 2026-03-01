import { supabase } from "@/components/lib/supabase/client";
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
// import { ChevronDownIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
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
import { Input } from "@/components/ui/input"
import { CalendarIcon } from "lucide-react"
import React, { useCallback, useEffect } from "react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";


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

export default function EventEdit() {
    const[event, setEvent] = useState<Event | null>(null);
    const { eventId } = useParams();

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

    const initialDate = new Date("2025-06-01")

    const [startMonth, setStartMonth] = React.useState<Date | undefined>(initialDate)
    const [endMonth, setEndMonth] = React.useState<Date | undefined>(initialDate)
    
    const [startValue, setStartValue] = React.useState("");
    const [endValue, setEndValue] = React.useState("");


    function isValidDate(date: Date | undefined) {
      if (!date) {
        return false
      }
      return !isNaN(date.getTime())
    }
    
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
    
    const navigate = useNavigate();





    useEffect(() => {
        if (!event) return;

        setTitle(event.event_name);
        setDescription(event?.event_description);
        setStartDate(parseLocalDate(event.start_date));
        setEndDate(parseLocalDate(event.end_date));
        setIsPrivate(event.is_private);
        setEventType(event.event_type);
        setIsPublished(event.is_published);

        setStartValue(formatDate(parseLocalDate(event.start_date)));
        setEndValue(formatDate(parseLocalDate(event.end_date)));
    }, [event]);

    const fetchEvents = useCallback( async () => { //useCallback prevents infinite loop in useEffect
      if (!eventId) return;

      const { data, error } = await supabase.from("events")
      .select("*")
      .eq('event_id', eventId).single();
      if (error) {
          console.error("Error fetching events:", error);
      } else {
          setEvent(data);
      }
    }, [eventId]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const updateEvent = async (id: number) => {
        const {error} = await supabase
        .from('events')
        .update({
        event_name: title,
        event_type: eventType,
        is_private: isPrivate,
        start_date: startDate,
        end_date: endDate,
        event_description: description,
        is_published: isPublished,

        })
        .eq('event_id', id)

        if (error) {
        console.error("Error updating event: ", error);
        }
    };

    //Convert date string to date object in local timezone
    function parseLocalDate(dateString: string) {
        const [year, month, day] = dateString.split("-").map(Number);
        return new Date(year, month - 1, day);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        await updateEvent(event!.event_id);
        

    };

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



 return (
  <div className="min-h-screen bg-gray-50 px-4 py-12">
    {/* Page Header */}
    <header className="text-center mb-12">
      <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
        Edit Event
      </h1>
    </header>

    <form
      onSubmit={handleSubmit}
      className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-10 space-y-8"
    >
      <FieldSet>
        <div className="mb-6">
          <FieldLegend className="text-3xl font-bold text-gray-800 tracking-tight">
            Edit Event Details
          </FieldLegend>
          {/* <FieldDescription>
              Add event information
            </FieldDescription> */}
        </div>

        <FieldGroup className="space-y-6">
          <Field>
            <div className="space-y-2">
              <FieldLabel
                htmlFor="title"
                className="text-lg font-semibold text-gray-800 tracking-tight"
              >
                Event Title
              </FieldLabel>
              <Input
                id="title"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500/60 transition"
              />
            </div>
          </Field>

          <Field>
            <FieldLabel className="text-base font-medium text-gray-700">
              Banner Image
            </FieldLabel>
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
                className="px-4 py-3 border border-gray-300 rounded-xl text-sm cursor-pointer hover:bg-gray-50 transition"
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
            <FieldLabel className="text-base font-medium text-gray-700">
              Event Description
            </FieldLabel>
            <Textarea
              id="description"
              placeholder="Description"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/60 transition"
            />
          </Field>

          <Field>
            <FieldLabel className="text-base font-medium text-gray-700">
              Event Type
            </FieldLabel>
            <Select
              value={eventType}
              onValueChange={(value) => setEventType(value)}
            >
              <SelectTrigger className="rounded-xl border border-gray-300 px-4 py-3 text-base focus:ring-2 focus:ring-blue-500/60">
                <SelectValue placeholder="--" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">--</SelectItem>
                <SelectItem value="steps">Steps</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <div className="flex gap-6">
            {/* Start Date Field */}
            <Field className="flex-1">
              <div className="space-y-2">
                <Label className="text-base font-medium text-gray-700">
                  Start Date
                </Label>
                <div className="relative flex items-center">
                  <Input
                    value={startValue}
                    placeholder="November 11, 2025"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-12 text-base focus:outline-none focus:ring-2 focus:ring-blue-500/60 transition"
                    onChange={(e) => {
                      const date = new Date(e.target.value);
                      setStartValue(e.target.value);
                      if (isValidDate(date)) {
                        setStartDate(date);
                        setStartMonth(date);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowDown") {
                        e.preventDefault();
                        setStartOpen(true);
                      }
                    }}
                  />
                  <Popover open={startOpen} onOpenChange={setStartOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2"
                      >
                        <CalendarIcon className="h-5 w-5" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0"
                      align="end"
                      sideOffset={10}
                    >
                      <Calendar
                        mode="single"
                        selected={startDate}
                        captionLayout="dropdown"
                        month={startMonth}
                        onMonthChange={setStartMonth}
                        onSelect={(date) => {
                          setStartDate(date);
                          setStartValue(formatDate(date));
                          setStartOpen(false);
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </Field>

            {/* End Date Field */}
            <Field className="flex-1">
              <div className="space-y-2">
                <Label className="text-base font-medium text-gray-700">
                  End Date
                </Label>
                <div className="relative flex items-center">
                  <Input
                    value={endValue}
                    placeholder="November 11, 2025"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-12 text-base focus:outline-none focus:ring-2 focus:ring-blue-500/60 transition"
                    onChange={(e) => {
                      const date = new Date(e.target.value);
                      setEndValue(e.target.value);
                      if (isValidDate(date)) {
                        setEndDate(date);
                        setEndMonth(date);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowDown") {
                        e.preventDefault();
                        setEndOpen(true);
                      }
                    }}
                  />
                  <Popover open={endOpen} onOpenChange={setEndOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2"
                      >
                        <CalendarIcon className="h-5 w-5" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0"
                      align="end"
                      sideOffset={10}
                    >
                      <Calendar
                        mode="single"
                        selected={endDate}
                        captionLayout="dropdown"
                        month={endMonth}
                        onMonthChange={setEndMonth}
                        onSelect={(date) => {
                          setEndDate(date);
                          setEndValue(formatDate(date));
                          setEndOpen(false);
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </Field>
          </div>

          <Field>
            <div className="flex items-start gap-3">
              <Checkbox
                id="make-private"
                checked={isPrivate}
                onCheckedChange={(checked) => setIsPrivate(!!checked)}
              />
              <div className="grid gap-1">
                <Label className="text-base font-medium text-gray-700">
                  Make Private
                </Label>
                <p className="text-sm text-gray-500">
                  Make event private so only approved users can join.
                </p>
              </div>
            </div>
          </Field>

          <Field>
            <div className="flex items-start gap-3">
              <Checkbox
                id="publish"
                checked={isPublished}
                onCheckedChange={(checked) => setIsPublished(!!checked)}
              />
              <div className="grid gap-1">
                <Label className="text-base font-medium text-gray-700">
                  Publish Event
                </Label>
                <p className="text-sm text-gray-500">
                  Allow users to view and register for this event.
                </p>
              </div>
            </div>
          </Field>
        </FieldGroup>
      </FieldSet>

      <div className="flex justify-end gap-4">
        <Button
          type="submit"
          className="px-6 py-3 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition"
          onClick={() => {
            navigate("/events/" + eventId);
          }}
        >
          Save
        </Button>
        <Button
          variant="outline"
          type="button"
          className="px-6 py-3 rounded-lg"
          onClick={() => navigate("/events/" + eventId)}
        >
          Cancel
        </Button>
      </div>
    </form>
  </div>
);
}