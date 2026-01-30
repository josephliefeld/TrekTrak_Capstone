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
  FieldDescription,
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
  const [fileError, setFileError] = React.useState("");
  const [bannerFile, setBannerFile] = React.useState<File | null>(null);

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

  // tiers
  const [numTiers, setNumTiers] = React.useState<string>("0");
  const [tierLevels, setTierLevels] = React.useState<number[]>([]);
  const [tierIcons, setTierIcons] = React.useState<(File | null)[]>([]);
  const [tierIconNames, setTierIconNames] = React.useState<string[]>([]);

  // allows going to another page
  const navigate = useNavigate();

  const handleTiersSelect = (value: string) => {
    setNumTiers(value);
    const n = parseInt(value, 10);
    // setTierLevels(prev => {
    //   const newValues = prev.slice(0, n);
    //   while(newValues.length < n) newValues.push(0);
    //   return newValues;
    // });
    setNumTiers(value);
    setTierLevels(Array(n).fill(0));
    setTierIcons(Array(n).fill(null));
  };

  // Handle individual input change
  const handleInputChange = (index: number, value: number) => {
    setTierLevels(prev => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  };

  // ===============
  // FILE VALIDATION
  // ===============

  // BANNERS IMAGES
  const handleValidatedBannerFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) {
      setFileName("No file chosen");
      setFileError("");
      setBannerFile(null);
      return;
    }

    const allowedTypes = ["image/png", "image/jpeg"];
    if (!allowedTypes.includes(file.type)) {
      setFileError("Only PNG or JPG images are allowed.");
      setFileName("No file chosen");
      setBannerFile(null);
      return;
    }

    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      setFileError("File is too large. Maximum size is 2MB.");
      setFileName("No file chosen");
      setBannerFile(null);
      return;
    }

    setFileError("");
    setFileName(file.name);
    setBannerFile(file);
  };

  // TIER ICONS
  const handleValidatedTierFileChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/png", "image/jpeg"];
    if (!allowedTypes.includes(file.type)) {
      alert("Only PNG or JPG images allowed.");
      return;
    }

    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("Max size is 2MB.");
      return;
    }

    setTierIcons(prev => {
      const copy = [...prev];
      copy[index] = file;
      return copy;
    });

    setTierIconNames (prev => {
      const copy = [...prev];
      copy[index] = file.name;
      return copy;
    });
  };

  

  // =====================
  // DATE HELPER FUNCTIONS
  // =====================

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


  // this sends the form details/files to supabase to be stored under a new 
  // event/tier configuration
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Upload the banner to supabase banner-images bucket if it exists
      let banner_url = null;
      if(bannerFile) {
        const filePath = `banner/${Date.now()}_${bannerFile.name}`;
        await supabase.storage.from("banner-images").upload(filePath, bannerFile);
        banner_url = supabase.storage.from("banner-images").getPublicUrl(filePath).data.publicUrl;
       
      }  
        // Insert the event information into the supabase events table
        const { data: eventData, error: eventError } = await supabase
          .from("events")
          .insert(
            {
              event_name: title,
              event_description: description,
              event_type: eventType,
              start_date: startDate?.toISOString().split("T")[0],
              end_date: endDate?.toISOString().split("T")[0],
              is_private: isPrivate,
              banner_url: banner_url,
              is_published: false
            },
          )
          .select("event_id")
          .single();
    
        // hands error/success
        if(eventError) {
          console.log("Supabase insert error: ", eventError);
          alert("Failed to add event: " + (eventError.message ?? JSON.stringify(eventError)));
          return;
        }
        // success
        console.log("Inserted event:", eventData);
        alert("Event added successfully!");

        const eventId = eventData.event_id;

        // Upload tier icons to the supabase event-tier-icons bucker
        const icon_urls: string[] = []

        for(let i = 0; i < tierIcons.length; i++){
          const file = tierIcons[i];
          if(!file){
            icon_urls.push("");
            continue;
          }

          const path = `tiers/${eventId}_${i}_${file.name}`;
          await supabase.storage.from("event-tier-icons").upload(path, file);
          const url = supabase.storage.from("event-tier-icons").getPublicUrl(path).data.publicUrl;
          icon_urls.push(url);
        }

        console.log("Tier Levels:", tierLevels);
        console.log("Tier Files:", tierIcons);
        console.log("Num Tiers:", numTiers);

        // insert tier configuration details into the tiers table in supabase
        if (tierLevels.length > 0) {
          const { error: tierError } = await supabase
            .from("tiers")
            .insert({
              event_id: eventId,
              num_tiers: parseInt(numTiers, 10),
              benchmarks: tierLevels,
              icon_urls: icon_urls
            });

          if (tierError) throw tierError;
        }

        alert("Event created!");
        navigate("/events");
    
    
     } catch (err: any) {
      console.error(err);
      alert(err.message);
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
                    onChange={handleValidatedBannerFileChange}
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
                        placeholder="November 11, 2025"
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
                        placeholder="November 11, 2025"
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
            <FieldDescription>
              <p>
                Use the dropdown menu to select how many tiers your event will have (between 0 and 5). For each tier, enter the number of steps required to reach that tier.
              </p>  
            </FieldDescription>
            <FieldGroup>
              {/* Dropdown selector for the number of tiers */}
              <div className="w-[200px]">
                <Field>
                  <FieldLabel htmlFor="numTiers">Number of Tiers</FieldLabel>
                  <Select onValueChange={handleTiersSelect} value={numTiers}>
                    <SelectTrigger id="numTiers">
                      <SelectValue placeholder="0" />
                    </SelectTrigger>
                    <SelectContent >
                      <SelectItem value="0">0</SelectItem>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                      <SelectItem value="5">5</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="space-y-2">
                    {Array.from({length: parseInt(numTiers, 10)}).map((_, index) => (
                      <div key={index}>
                        {/* Displays a number input box for each tier */}
                        <Label htmlFor={`input-${index}`}>Level {index + 1}</Label>
                        <Input
                          id={`level-${index}`}
                          type="number"
                          value={tierLevels[index] || ''}
                          placeholder={(1000*(index+1)).toString()}
                          onChange={(e) => handleInputChange(index, parseInt(e.target.value, 10))}
                        />

                        {/* Displays a file (image) upload input for each tier */}
                        <div className="flex items-center gap-3">
                          <input
                            type="file"
                            id={`icon-${index}`}
                            accept=".png, .jpeg, .jpg"
                            className="hidden"
                            onChange={(e) => handleValidatedTierFileChange(index, e)}
                          />
                          <label
                            htmlFor={`icon-${index}`}
                            className="px-1 py-1 w-[64] border border-gray-300 text-sm"
                          >
                            Upload Icon
                          </label>
                          <span className="text-sm text-gray-600">
                            {tierIconNames[index] || "No file chosen"}
                          </span>
                        </div>
                        {fileError && (
                           <p className="text-sm text-red-500 mt-1">{fileError}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </Field>
              </div>
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