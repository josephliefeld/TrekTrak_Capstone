import * as React from "react"
// import { format } from "date-fns"
// import { Calendar as CalendarIcon } from "lucide-react"
import { ChevronDownIcon } from "lucide-react"
 
// import { cn } from "@/components/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import {
  Field,
  // FieldContent,
  FieldDescription,
  // FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  // FieldSeparator,
  FieldSet,
  // FieldTitle,
} from "@/components/ui/field"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function Create() {
  const [startDate, setStartDate] = React.useState<Date | undefined>();
  const [endDate, setEndDate] = React.useState<Date | undefined>();
  const [startOpen, setStartOpen] = React.useState(false);
  const [endOpen, setEndOpen] = React.useState(false);

  const [fileName, setFileName] = React.useState("No file chosen");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileName(file ? file.name : "No file chosen");
  };

  return (
    <>
      <form>
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
                  required
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

              <Field>
                <FieldLabel htmlFor="description">Event Description</FieldLabel>
                <Textarea 
                  id="description"
                  placeholder="Description"
                  required
                />
              </Field>
              <div className="w-[200px]">
                <Field>
                  <FieldLabel htmlFor="type">Event Type</FieldLabel>
                  <Select defaultValue="">
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
                    onClick={() => {console.log("Selected Make Private")}}
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
                    onClick={() => {console.log("Selected Publish")}}
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
                <Button variant="outline" type="button" onClick={() => {console.log("Create Event Canceled")}}>Cancel</Button>
              </Field>
            </FieldGroup>
          </FieldSet>
        </FieldGroup>
      </form>

    </>
  )
}