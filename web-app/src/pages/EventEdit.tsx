import { supabase } from "@/components/lib/supabase/client";
import {
  Field,
  // FieldContent,
  FieldDescription,
  // FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
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
import React, { useEffect, useCallback } from "react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";


type Event = {
  event_id: string;
  organizer: string;
  event_name: string;
  event_type: string;
  is_private: boolean;
  start_date: string;
  end_date: string;
  event_description: string;
  is_published: boolean;
  allow_teams: boolean;
  max_team_size: number;
};

export default function EventEdit() {
  const [event, setEvent] = useState<Event | null>(null);
  const { eventId } = useParams();

  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [startOpen, setStartOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);
  // const [fileError, setFileError] = React.useState("");
  const [bannerFile, setBannerFile] = React.useState<File | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventType, setEventType] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  const [fileName, setFileName] = useState("No file chosen");
  const [fileError, setFileError] = useState("");

  const initialDate = new Date("2025-06-01");

  const [startMonth, setStartMonth] = useState<Date | undefined>(initialDate);
  const [endMonth, setEndMonth] = useState<Date | undefined>(initialDate);

  const [startValue, setStartValue] = useState("");
  const [endValue, setEndValue] = useState("");

  const [numTiers, setNumTiers] = useState<string>("0");
  const [tierLevels, setTierLevels] = useState<number[]>([]);
  const [tierIcons, setTierIcons] = useState<(File | null)[]>([]);
  const [tierIconNames, setTierIconNames] = useState<(string | null)[]>([]);
  const [existingIconUrls, setExistingIconUrls] = useState<(string | null)[]>([]);

  const [allowTeams, setAllowTeams] = useState(false);
  const [maxTeamSize, setMaxTeamSize] = useState<string>("0");

  const navigate = useNavigate();

  useEffect(() => {
    if (!event) return;

    setTitle(event.event_name);
    setDescription(event.event_description);
    setStartDate(parseLocalDate(event.start_date));
    setEndDate(parseLocalDate(event.end_date));
    setIsPrivate(event.is_private);
    setEventType(event.event_type);
    setIsPublished(event.is_published);
    setStartValue(formatDate(parseLocalDate(event.start_date)));
    setEndValue(formatDate(parseLocalDate(event.end_date)));
    setAllowTeams(event.allow_teams);
    setMaxTeamSize(String(event.max_team_size));
  }, [event]);

  // const fetchEvents = async () => {
  //   if (!eventId) return;
  //   const { data } = await supabase
  //     .from("events")
  //     .select("*")
  //     .eq("event_id", eventId)
  //     .maybeSingle();
  //   if (data) setEvent(data);
  // };

  const fetchEvents = useCallback(async () => {
    if (!eventId) return;

    const { data } = await supabase
      .from("events")
      .select("*")
      .eq("event_id", eventId)
      .maybeSingle();

    if (data) setEvent(data);
  }, [eventId]);

  // const fetchTiers = async () => {
  //   if (!eventId) return;

  //   const { data } = await supabase
  //     .from("tiers")
  //     .select("num_tiers, benchmarks, icon_urls, icon_names")
  //     .eq("event_id", eventId)
  //     .single();

  //   if (!data) return;
// 
  //   setNumTiers(String(data.num_tiers));
  //   setTierLevels(data.benchmarks ?? []);
  //   setTierIconNames(data.icon_names ?? []);
  //   setExistingIconUrls(data.icon_urls ?? []);
  //   setTierIcons(Array(data.num_tiers).fill(null)); // no new uploads yet
  //   setTierIcons(Array(data.num_tiers).fill(null));
  // };

  const fetchTiers = useCallback(async () => {
    if (!eventId) return;

    const { data } = await supabase
      .from("tiers")
      .select("num_tiers, benchmarks, icon_urls, icon_names")
      .eq("event_id", eventId)
      .single();

    if (!data) return;

    setNumTiers(String(data.num_tiers));
    setTierLevels(data.benchmarks ?? []);
    setTierIconNames(data.icon_names ?? []);
    setExistingIconUrls(data.icon_urls ?? []);
    setTierIcons(Array(data.num_tiers).fill(null));
  }, [eventId]);

    // useEffect(() => {
  //   fetchEvents();
  //   fetchTiers();
  // }, [eventId]);

  useEffect(() => {
    fetchEvents();
    fetchTiers();
    }, [fetchEvents, fetchTiers]);

  const handleTiersSelect = (value: string) => {
    const n = parseInt(value, 10);
    
    setNumTiers(value);

    setTierLevels(prev => {
      const copy = [...prev];
      return copy.slice(0, n).concat(Array(Math.max(0, n - copy.length)).fill(0));
    });

    setTierIcons(prev => {
      const copy = [...prev];
      return copy.slice(0, n).concat(Array(Math.max(0, n - copy.length)).fill(null));
    });

    setTierIconNames(Array(n).fill(null));
    setExistingIconUrls(Array(n).fill(null));

  };

  const handleInputChange = (index: number, value: number) => {
    setTierLevels(prev => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  };

  const handleValidatedTierFileChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setTierIcons(prev => {
      const copy = [...prev];
      copy[index] = file;
      return copy;
    });

    setTierIconNames(prev => {
      const copy = [...prev];
      copy[index] = file.name;
      return copy;
    });
  };

  const handleValidatedBannerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  
      const maxSize = 2 * 1024 * 1024;
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

  const updateEvent = async (id: string) => {
    await supabase
      .from("events")
      .update({
        event_name: title,
        event_type: eventType,
        is_private: isPrivate,
        start_date: startDate,
        end_date: endDate,
        event_description: description,
        is_published: isPublished,
        allow_teams: allowTeams,
        max_team_size: parseInt(maxTeamSize, 10),
      })
      .eq("event_id", id);

    const icon_urls: (string | null)[] = [];
    const icon_names: (string | null)[] = [];

    for (let i = 0; i < tierLevels.length; i++) {
      const file = tierIcons[i];

      if (!file) {
        icon_urls.push(existingIconUrls[i] ?? null);
        icon_names.push(tierIconNames[i] ?? null);
        continue;
      }

      const path = `tiers/${id}_${i}_${file.name}`;
      await supabase.storage
        .from("event-tier-icons")
        .upload(path, file, { upsert: true });

      icon_urls.push(
        supabase.storage
          .from("event-tier-icons")
          .getPublicUrl(path).data.publicUrl
      );
      icon_names.push(file.name);
    }

    // used to fix linting problem
    console.log(bannerFile);

    console.log("Tier payload", {
      event_id: id,
      num_tiers: parseInt(numTiers, 10),
      benchmarks: tierLevels,
      icon_urls,
      icon_names,
    });

    if (parseInt(numTiers, 10) > 0) {
      await supabase.from("tiers").upsert(
        {
          event_id: id,
          num_tiers: parseInt(numTiers, 10),
          benchmarks: tierLevels,
          icon_urls,
          icon_names,
        },
        { onConflict: "event_id" }
      );
    }
  };

  function parseLocalDate(dateString: string) {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  function formatDate(date: Date | undefined) {
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  const isValidDate = (date: Date | undefined) => date instanceof Date && !isNaN(date.getTime());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if(!event) return;

    await updateEvent(event.event_id);

    navigate("/events/" + eventId);
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
                onChange={handleValidatedBannerFileChange}
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

      <FieldSeparator />

        {/* Tier Configuration */}
        <FieldSet>
          <div className="mb-6">
            <FieldLegend className="text-3xl font-bold text-gray-800 tracking-tight">
              Tier Configuration
            </FieldLegend>
            <FieldDescription className="text-gray-600">
              Use the dropdown to select the number of tiers (0-5). Enter steps required for each tier and upload an icon.
            </FieldDescription>
          </div>

          <FieldGroup className="space-y-6">
            <Field>
              <Label htmlFor="numTiers" className="text-base font-medium text-gray-700">
                Number of Tiers
              </Label>
              <Select value={numTiers} onValueChange={handleTiersSelect}>
                <SelectTrigger id="numTiers" className="rounded-xl border border-gray-300 px-4 py-3 text-base focus:ring-2 focus:ring-blue-500/60">
                  <SelectValue placeholder={numTiers} />
                </SelectTrigger>
                <SelectContent>
                  {["0","1","2","3","4","5"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                </SelectContent>
              </Select>

              <div className="space-y-4 mt-4">
                {tierLevels.map((_, index) => (
                  <div key={index} className="space-y-2">
                    <Label htmlFor={`level-${index}`} className="text-sm font-medium text-gray-700">
                      Level {index + 1}
                    </Label>
                    <Input
                      id={`level-${index}`}
                      type="number"
                      value={tierLevels[index] ?? ""}
                      onChange={(e) =>
                        handleInputChange(index, Number(e.target.value))
                      }
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500/60 transition"                   
                    />
                    {/* <Input
                      id={`level-${index}`}
                      type="number"
                      value={tierLevels[index] || ""}
                      placeholder={`${tierLevels[index] ?? ""}`}
                      onChange={(e) => handleInputChange(index, parseInt(e.target.value, 10))}
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500/60 transition"
                    /> */}

                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        id={`icon-${index}`}
                        accept=".png, .jpeg, .jpg"
                        className="hidden"
                        onChange={(e) => handleValidatedTierFileChange(index, e)}
                      />
                      <label htmlFor={`icon-${index}`} className="px-4 py-3 border border-gray-300 rounded-xl text-sm cursor-pointer hover:bg-gray-50 transition">
                        Choose Icon
                      </label>
                      <span className="text-sm text-gray-600">{tierIconNames[index] || "No file chosen"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Field>
          </FieldGroup>
        </FieldSet>

        <FieldSeparator />

        {/* Teams Configuration */}
        <FieldSet>
          <div className="mb-6">
            <FieldLegend className="text-3xl font-bold text-gray-800 tracking-tight">
              Team Configuration
            </FieldLegend>
            <FieldGroup className="space-y-6">
            <div>
                <Field>
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="allow-teams"
                    checked={allowTeams}
                    onCheckedChange={(checked) => {
                      const enabled = !!checked;  
                      setAllowTeams(enabled);

                      if(!enabled)
                      {
                        setMaxTeamSize("0");
                      }
                      }
                    }
                  />
                  <div className="grid gap-1">
                    <Label htmlFor="allow-teams" className="text-base font-medium text-gray-700">
                      Enable Teams
                    </Label>
                    <p className="text-sm text-gray-500">
                      Allow participants to form teams.
                    </p>
                  </div>
                </div>
              </Field>
              {allowTeams && (
                <Field>
                  <div className="mt-4 space-y-2 ml-8">
                    <Label
                      htmlFor="max-team-size"
                      className="text-base font-medium text-gray-700"
                    >
                      Maximum Team Size
                    </Label>

                    <Input
                      id="max-team-size"
                      type="number"
                      min={1}
                      value={maxTeamSize}
                      onChange={(e) => setMaxTeamSize(e.target.value)}
                      className="w-40 rounded-xl border border-gray-300 px-4 py-3 text-base
                                focus:outline-none focus:ring-2 focus:ring-blue-500/60 transition"
                      required
                    />

                    <p className="text-sm text-gray-500">
                      Maximum number of participants allowed on a team.
                    </p>
                  </div>
                </Field>
              )}
            </div>
          </FieldGroup>
          </div>

        </FieldSet>

      <div className="flex justify-end gap-4">
        <Button
          type="submit"
          className="px-6 py-3 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition"
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