import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { ChevronDownIcon } from "lucide-react"
 
import { cn } from "@/components/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
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

export default function Create() {
  // const [open, setOpen] = React.useState(false)
  // const [date, setDate] = React.useState<Date | undefined>(undefined)

  const [startDate, setStartDate] = React.useState<Date | undefined>();
  const [endDate, setEndDate] = React.useState<Date | undefined>();
  const [startOpen, setStartOpen] = React.useState(false);
  const [endOpen, setEndOpen] = React.useState(false);

  return (
    <>
      {/* <div className="text-3xl">
        <h1>Add Event Details</h1>
      </div> */}
      <form>
        <FieldGroup>
          <FieldSet>
            <FieldLegend>Add Event Details</FieldLegend>
            <FieldDescription>
              Add event information
            </FieldDescription>
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
                <FieldLabel htmlFor="description">Event Description</FieldLabel>
                <input
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
              <div className="flex gap-6">
                <Field orientation="horizontal">
                  <Checkbox
                    id="make-private"
                    className="w-[16px]"
                    required
                  />
                  <Label htmlFor="make-private">Make Private</Label>
                </Field>
              </div>
            </FieldGroup>
          </FieldSet>
        </FieldGroup>
      </form>

    </>
  )
}