import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

import { useEffect, useState } from "react";
import { cn } from "src/utils";
import { TABLE_DATE_FORMAT } from "~/constants";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { Input } from "./input";

export const DateTimePopover = ({
  onChange,
  value,
  minDate,
  maxDate,
}: {
  onChange: (date: Date) => void;
  value?: Date;
  minDate?: Date;
  maxDate?: Date;
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState("");
  const [isPopoverOpen, setisPopoverOpen] = useState(false);

  const handlePopoverToggle = (open: boolean) => {
    if (selectedDate && !open) {
      onChange(selectedDate);
    }
    setisPopoverOpen((prevState) => !prevState);
  };

  const handleDateSelect = (date?: Date) => {
    setSelectedDate((prevState) => {
      if (!date) return prevState;
      if (selectedTime)
        return new Date(`${date.toDateString()} ${selectedTime}`);
      return date;
    });
  };

  useEffect(() => {
    if (!selectedDate) return;
    setSelectedDate(new Date(`${selectedDate.toDateString()} ${selectedTime}`));
  }, [selectedTime]);

  return (
    <Popover open={isPopoverOpen} onOpenChange={handlePopoverToggle}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "justify-start text-nowrap px-2 text-left font-normal",
            !value && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, TABLE_DATE_FORMAT) : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="flex w-auto flex-col items-center p-0">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          fromDate={minDate}
          toDate={maxDate}
          initialFocus
        />
        <Input
          defaultValue={selectedTime}
          className="justify-center"
          type="time"
          onChange={(e) => {
            setSelectedTime(e.target.value);
          }}
        />
        <Button className="w-fit" onClick={() => handlePopoverToggle(false)}>
          Confirm
        </Button>
      </PopoverContent>
    </Popover>
  );
};
