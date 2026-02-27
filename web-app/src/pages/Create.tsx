import * as React from "react";
import { useNavigate } from "react-router-dom";
import { CalendarIcon } from "lucide-react";
import { supabase } from "@/components/lib/supabase/client";
import {
  Button,
} from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function Create() {
  // === State Variables ===
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [eventType, setEventType] = React.useState("");
  const [fileName, setFileName] = React.useState("No file chosen");
  const [fileError, setFileError] = React.useState("");
  const [bannerFile, setBannerFile] = React.useState<File | null>(null);

  const initialDate = new Date("2025-06-01");
  const [startDate, setStartDate] = React.useState<Date | undefined>(initialDate);
  const [endDate, setEndDate] = React.useState<Date | undefined>(initialDate);
  const [startOpen, setStartOpen] = React.useState(false);
  const [endOpen, setEndOpen] = React.useState(false);
  const [startMonth, setStartMonth] = React.useState<Date | undefined>(initialDate);
  const [endMonth, setEndMonth] = React.useState<Date | undefined>(initialDate);
  const [startValue, setStartValue] = React.useState("");
  const [endValue, setEndValue] = React.useState("");

  const [isPrivate, setIsPrivate] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [csvFile, setCsvFile] = React.useState<File | null>(null);
  const [csvFileName, setCsvFileName] = React.useState("No file chosen");
  const [csvError, setCsvError] = React.useState("");

  const [numTiers, setNumTiers] = React.useState<string>("0");
  const [tierLevels, setTierLevels] = React.useState<number[]>([]);
  const [tierIcons, setTierIcons] = React.useState<(File | null)[]>([]);
  const [tierIconNames, setTierIconNames] = React.useState<string[]>([]);

  const navigate = useNavigate();

  // === Tier Handlers ===
  const handleTiersSelect = (value: string) => {
    const n = parseInt(value, 10);
    setNumTiers(value);
    setTierLevels(Array(n).fill(0));
    setTierIcons(Array(n).fill(null));
    setTierIconNames(Array(n).fill(""));
  };

  const handleInputChange = (index: number, value: number) => {
    setTierLevels(prev => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  };

  // === File Validation ===
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

    setTierIconNames(prev => {
      const copy = [...prev];
      copy[index] = file.name;
      return copy;
    });
  };

  // ===== CSV file Validation =====
  const handleValidatedCsvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
  
    if (!file) {
      setCsvFile(null);
      setCsvFileName("No file chosen");
      setCsvError("");
      return;
    }
  
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setCsvError("Only CSV files are allowed.");
      setCsvFile(null);
      setCsvFileName("No file chosen");
      return;
    }
  
    setCsvError("");
    setCsvFile(file);
    setCsvFileName(file.name);
  };

  // === Date Helpers ===
  const formatDate = (date: Date | undefined) =>
    date?.toLocaleDateString("en-US", { day: "2-digit", month: "long", year: "numeric" }) ?? "";

  const isValidDate = (date: Date | undefined) => date instanceof Date && !isNaN(date.getTime());

  // === Submit Handler ===
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let banner_url = null;
      if (bannerFile) {
        const filePath = `banner/${Date.now()}_${bannerFile.name}`;
        await supabase.storage.from("banner-images").upload(filePath, bannerFile);
        banner_url = supabase.storage.from("banner-images").getPublicUrl(filePath).data.publicUrl;
      }

      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .insert({
          event_name: title,
          event_description: description,
          event_type: eventType,
          start_date: startDate?.toISOString().split("T")[0],
          end_date: endDate?.toISOString().split("T")[0],
          is_private: isPrivate,
          banner_url,
          is_published: false
        })
        .select("event_id")
        .single();

      if (eventError) {
        alert("Failed to add event: " + (eventError.message ?? JSON.stringify(eventError)));
        return;
      }

      const eventId = eventData.event_id;
      const icon_urls: string[] = [];

      for (let i = 0; i < tierIcons.length; i++) {
        const file = tierIcons[i];
        if (!file) {
          icon_urls.push("");
          continue;
        }

        const path = `tiers/${eventId}_${i}_${file.name}`;
        await supabase.storage.from("event-tier-icons").upload(path, file);
        const url = supabase.storage.from("event-tier-icons").getPublicUrl(path).data.publicUrl;
        icon_urls.push(url);
      }

      if (tierLevels.length > 0) {
        const { error: tierError } = await supabase
          .from("tiers")
          .insert({
            event_id: eventId,
            num_tiers: parseInt(numTiers, 10),
            benchmarks: tierLevels,
            icon_urls
          });

        if (tierError) throw tierError;
      }

      if (isPrivate && csvFile) {
        // 1️⃣ Still upload file (optional but fine)
        const csvPath = `event_${eventId}_${Date.now()}_${csvFile.name}`;
      
        const { error: csvUploadError } = await supabase
          .storage
          .from("private_event_lists")
          .upload(csvPath, csvFile);
      
        if (csvUploadError) {
          throw csvUploadError;
        }
      
        // 2️⃣ Read CSV contents
        const text = await csvFile.text();
      
        const emails = text
          .split("\n")
          .map(e => e.trim().toLowerCase())
          .filter(e => e.length > 0);
      
        // 3️⃣ Convert to rows for DB
        const rows = emails.map(email => ({
          event_id: eventId,
          email
        }));
      
        // 4️⃣ Insert into approval table
        const { error: insertError } = await supabase
          .from("private_event_members")
          .insert(rows);
      
        if (insertError) {
          throw insertError;
        }
      }

      alert("Event created!");
      navigate("/events");
    } catch (err: unknown) {
      if (err instanceof Error) alert(err.message);
      else alert("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      {/* Page Header */}
      <header className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
          Create New Event
        </h1>
      </header>

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-10 space-y-8">
        {/* Event Details */}
        <FieldSet>
          <div className="mb-6">
            <FieldLegend className="text-3xl font-bold text-gray-800 tracking-tight">
              Add Event Details
            </FieldLegend>
          </div>
          <FieldGroup className="space-y-6">
            {/* Event Title */}
            <Field>
              <div className="space-y-2">
                <Label htmlFor="title" className="text-lg font-semibold text-gray-800 tracking-tight">
                  Event Title
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter event title*"
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500/60 transition"
                />
              </div>
            </Field>

            {/* Banner Image */}
            <Field>
              <Label htmlFor="banner" className="text-base font-medium text-gray-700">
                Banner Image
              </Label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  id="banner"
                  accept=".png, .jpeg, .jpg"
                  className="hidden"
                  onChange={handleValidatedBannerFileChange}
                />
                <label htmlFor="banner" className="px-4 py-3 border border-gray-300 rounded-xl text-sm cursor-pointer hover:bg-gray-50 transition">
                  Choose File
                </label>
                <span className="text-sm text-gray-600">{fileName}</span>
              </div>
              {fileError && <p className="text-sm text-red-500 mt-1">{fileError}</p>}
            </Field>

            {/* Event Description */}
            <Field>
              <Label htmlFor="description" className="text-base font-medium text-gray-700">
                Event Description
              </Label>
              <Textarea
                id="description"
                placeholder="Description"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/60 transition"
              />
            </Field>

            {/* Event Type */}
            <Field>
              <Label htmlFor="type" className="text-base font-medium text-gray-700">
                Event Type
              </Label>
              <Select onValueChange={(value) => setEventType(value)} value={eventType}>
                <SelectTrigger id="type" className="rounded-xl border border-gray-300 px-4 py-3 text-base focus:ring-2 focus:ring-blue-500/60">
                  <SelectValue placeholder="--" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">--</SelectItem>
                  <SelectItem value="steps">Steps</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            {/* Start & End Dates */}
            <div className="flex gap-6">
              {/* Start Date */}
              <Field>
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-base font-medium text-gray-700">
                    Start Date
                  </Label>
                  <div className="relative flex items-center">
                    <Input
                      id="startDate"
                      value={startValue}
                      placeholder="June 01, 2025"
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-12 text-base focus:outline-none focus:ring-2 focus:ring-blue-500/60 transition"
                      onChange={(e) => {
                        setStartValue(e.target.value);
                        const date = new Date(e.target.value);
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
                      <PopoverContent className="w-auto p-0" align="end" sideOffset={10}>
                        <Calendar
                          mode="single"
                          selected={startDate}
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

              {/* End Date */}
              <Field>
                <div className="space-y-2">
                  <Label htmlFor="endDate" className="text-base font-medium text-gray-700">
                    End Date
                  </Label>
                  <div className="relative flex items-center">
                    <Input
                      id="endDate"
                      value={endValue}
                      placeholder="June 01, 2025"
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-12 text-base focus:outline-none focus:ring-2 focus:ring-blue-500/60 transition"
                      onChange={(e) => {
                        setEndValue(e.target.value);
                        const date = new Date(e.target.value);
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
                      <PopoverContent className="w-auto p-0" align="end" sideOffset={10}>
                        <Calendar
                          mode="single"
                          selected={endDate}
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

            {/* Private Toggle */}
            <Field>
              <div className="flex items-start gap-3">
                <Checkbox
                  id="make-private"
                  checked={isPrivate}
                  onCheckedChange={(checked) => setIsPrivate(!!checked)}
                />
                <div className="grid gap-1">
                  <Label htmlFor="make-private" className="text-base font-medium text-gray-700">
                    Make Private
                  </Label>
                  <p className="text-sm text-gray-500">
                    Make event private so only approved users can join.
                  </p>
                </div>
              </div>
              {/* CSV Upload (only shown when private is enabled) */}
              {isPrivate && (
                <div className="mt-6 ml-7 space-y-2">
                  <Label htmlFor="csvUpload" className="text-base font-medium text-gray-700">
                    Upload CSV of Approved User Emails
                  </Label>

                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      id="csvUpload"
                      accept=".csv"
                      className="hidden"
                      onChange={handleValidatedCsvChange}
                    />
                    <label
                      htmlFor="csvUpload"
                      className="px-4 py-3 border border-gray-300 rounded-xl text-sm cursor-pointer hover:bg-gray-50 transition"
                    >
                      Choose CSV
                    </label>

                    <span className="text-sm text-gray-600">
                      {csvFileName}
                    </span>
                  </div>

                  {csvError && (
                    <p className="text-sm text-red-500">{csvError}</p>
                  )}
                </div>
              )}
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
              <Select onValueChange={handleTiersSelect} value={numTiers}>
                <SelectTrigger id="numTiers" className="rounded-xl border border-gray-300 px-4 py-3 text-base focus:ring-2 focus:ring-blue-500/60">
                  <SelectValue placeholder="0" />
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
                      value={tierLevels[index] || ""}
                      placeholder={(1000*(index+1)).toString()}
                      onChange={(e) => handleInputChange(index, parseInt(e.target.value, 10))}
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500/60 transition"
                    />

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

        <Button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 rounded-lg font-semibold text-white transition ${isSubmitting ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
        >
          {isSubmitting ? "Creating Event…" : "Create Event"}
        </Button>
      </form>
    </div>
  );
}
