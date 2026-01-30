import * as React from "react"
import { useNavigate } from "react-router-dom"
import { CalendarIcon } from "lucide-react"
import { supabase } from "@/components/lib/supabase/client"

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
  FieldSet,
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

export default function Create() {
  /* ================= STATE ================= */
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [eventType, setEventType] = React.useState("")
  const [isPrivate, setIsPrivate] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const [fileName, setFileName] = React.useState("No file chosen")
  const [fileError, setFileError] = React.useState("")
  const [bannerFile, setBannerFile] = React.useState<File | null>(null)

  const initialDate = new Date("2025-06-01")
  const [startDate, setStartDate] = React.useState<Date | undefined>(initialDate)
  const [endDate, setEndDate] = React.useState<Date | undefined>(initialDate)
  const [startOpen, setStartOpen] = React.useState(false)
  const [endOpen, setEndOpen] = React.useState(false)
  const [startMonth, setStartMonth] = React.useState(initialDate)
  const [endMonth, setEndMonth] = React.useState(initialDate)
  const [startValue, setStartValue] = React.useState("")
  const [endValue, setEndValue] = React.useState("")

  const [numTiers, setNumTiers] = React.useState("0")
  const [tierLevels, setTierLevels] = React.useState<number[]>([])
  const [tierIcons, setTierIcons] = React.useState<(File | null)[]>([])
  const [tierIconNames, setTierIconNames] = React.useState<string[]>([])

  const navigate = useNavigate()

  /* ================= HELPERS ================= */
  const formatDate = (date?: Date) =>
    date
      ? date.toLocaleDateString("en-US", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      : ""

  const isValidDate = (date?: Date) => !!date && !isNaN(date.getTime())

  /* ================= HANDLERS ================= */
  const handleTiersSelect = (value: string) => {
    const n = parseInt(value, 10)
    setNumTiers(value)
    setTierLevels(Array(n).fill(0))
    setTierIcons(Array(n).fill(null))
    setTierIconNames(Array(n).fill(""))
  }

  const handleValidatedBannerFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!["image/png", "image/jpeg"].includes(file.type)) {
      setFileError("Only PNG or JPG images allowed.")
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      setFileError("Max file size is 2MB.")
      return
    }

    setFileError("")
    setFileName(file.name)
    setBannerFile(file)
  }

  const handleTierIconChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    setTierIcons(prev => {
      const copy = [...prev]
      copy[index] = file
      return copy
    })

    setTierIconNames(prev => {
      const copy = [...prev]
      copy[index] = file.name
      return copy
    })
  }

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      let banner_url = null

      if (bannerFile) {
        const path = `banner/${Date.now()}_${bannerFile.name}`
        await supabase.storage.from("banner-images").upload(path, bannerFile)
        banner_url =
          supabase.storage.from("banner-images").getPublicUrl(path).data.publicUrl
      }

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
      const icon_urls: string[] = []

      for (let i = 0; i < tierIcons.length; i++) {
        const file = tierIcons[i]
        if (!file) {
          icon_urls.push("")
          continue
        }

        const path = `tiers/${eventId}_${i}_${file.name}`
        await supabase.storage.from("event-tier-icons").upload(path, file)
        icon_urls.push(
          supabase.storage.from("event-tier-icons").getPublicUrl(path).data.publicUrl
        )
      }

      if (tierLevels.length) {
        await supabase.from("tiers").insert({
          event_id: eventId,
          num_tiers: parseInt(numTiers, 10),
          benchmarks: tierLevels,
          icon_urls,
        })
      }

      navigate("/events")
    } finally {
      setIsSubmitting(false)
    }
  }

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-10">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-gray-800">Create Event</h1>
          <p className="text-gray-500 mt-1">
            Configure your fitness event, timeline, and tiers.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-12">
          {/* EVENT DETAILS */}
          <FieldSet>
            <FieldLegend>Event Details</FieldLegend>
            <FieldGroup className="mt-6 space-y-6">
              <Field>
                <FieldLabel>Event Title</FieldLabel>
                <Input value={title} onChange={e => setTitle(e.target.value)} />
              </Field>

              <Field>
                <FieldLabel>Banner Image</FieldLabel>
                <div className="flex items-center gap-4">
                  <input id="banner" type="file" hidden onChange={handleValidatedBannerFileChange} />
                  <label htmlFor="banner">
                    <Button type="button" variant="outline">Choose File</Button>
                  </label>
                  <span className="text-sm text-gray-500">{fileName}</span>
                </div>
                {fileError && <p className="text-sm text-red-500">{fileError}</p>}
              </Field>

              <Field>
                <FieldLabel>Description</FieldLabel>
                <Textarea value={description} onChange={e => setDescription(e.target.value)} />
              </Field>

              <Field>
                <FieldLabel>Event Type</FieldLabel>
                <Select onValueChange={setEventType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="steps">Steps</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>
          </FieldSet>

          <FieldSeparator />

          {/* DATES + PRIVACY */}
          <FieldSet>
            <FieldLegend>Schedule & Access</FieldLegend>
            <FieldGroup className="mt-6 grid grid-cols-2 gap-8">
              {[["Start Date", startDate, setStartDate, startValue, setStartValue, startOpen, setStartOpen, startMonth, setStartMonth],
                ["End Date", endDate, setEndDate, endValue, setEndValue, endOpen, setEndOpen, endMonth, setEndMonth]
              ].map(([label, date, setDate, value, setValue, open, setOpen, month, setMonth]: any, i) => (
                <Field key={i}>
                  <Label>{label}</Label>
                  <div className="relative">
                    <Input
                      value={value}
                      placeholder="Select date"
                      onChange={e => {
                        const d = new Date(e.target.value)
                        setValue(e.target.value)
                        if (isValidDate(d)) {
                          setDate(d)
                          setMonth(d)
                        }
                      }}
                    />
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" className="absolute right-2 top-2">
                          <CalendarIcon className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent>
                        <Calendar
                          mode="single"
                          selected={date}
                          month={month}
                          onMonthChange={setMonth}
                          onSelect={d => {
                            setDate(d)
                            setValue(formatDate(d))
                            setOpen(false)
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </Field>
              ))}

              <Field>
                <div className="flex items-start gap-3 pt-6">
                  <Checkbox checked={isPrivate} onCheckedChange={v => setIsPrivate(!!v)} />
                  <div>
                    <Label>Private Event</Label>
                    <p className="text-sm text-muted-foreground">
                      Only approved users can join
                    </p>
                  </div>
                </div>
              </Field>
            </FieldGroup>
          </FieldSet>

          <FieldSeparator />

          {/* TIERS */}
          <FieldSet>
            <FieldLegend>Tier Configuration</FieldLegend>
            <FieldDescription>
              Define step thresholds and optional icons for each tier.
            </FieldDescription>

            <FieldGroup className="mt-6 space-y-6">
              <Select value={numTiers} onValueChange={handleTiersSelect}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="0" />
                </SelectTrigger>
                <SelectContent>
                  {[0,1,2,3,4,5].map(n => (
                    <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {tierLevels.map((_, i) => (
                <div key={i} className="rounded-lg border p-4 space-y-3">
                  <Label>Tier {i + 1}</Label>
                  <Input
                    type="number"
                    value={tierLevels[i]}
                    onChange={e =>
                      setTierLevels(prev => {
                        const copy = [...prev]
                        copy[i] = parseInt(e.target.value, 10)
                        return copy
                      })
                    }
                  />
                  <div className="flex items-center gap-4">
                    <input id={`tier-${i}`} type="file" hidden onChange={e => handleTierIconChange(i, e)} />
                    <label htmlFor={`tier-${i}`}>
                      <Button type="button" variant="outline">Upload Icon</Button>
                    </label>
                    <span className="text-sm text-gray-500">
                      {tierIconNames[i] || "No file chosen"}
                    </span>
                  </div>
                </div>
              ))}
            </FieldGroup>
          </FieldSet>

          {/* ACTIONS */}
          <div className="flex justify-end gap-4">
            <Button variant="outline" type="button" onClick={() => navigate("/events")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Create Event"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
