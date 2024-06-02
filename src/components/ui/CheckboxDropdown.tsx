import { useEffect, useMemo, useState } from "react";
import { Button } from "./shad-cn/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./shad-cn/dropdown-menu";

type CheckboxDropdownProps<T> = {
  title: string;
  checkboxData?: T[];
  // Property to be targetted as a value
  checkboxValueTarget: string;
  labelCreator: (option: T) => string;
  onChange: (selected: any[]) => void;
};

export const CheckboxDropdown = <T extends Record<any, any>>({
  title,
  checkboxData = [],
  checkboxValueTarget,
  labelCreator,
  onChange,
}: CheckboxDropdownProps<T>) => {
  const [selectedCheckboxes, setSelectedCheckboxes] = useState<
    Record<any, boolean>
  >({});

  const handleCheck = (value: any) => {
    setSelectedCheckboxes((prevState) => {
      return { ...prevState, [value]: true };
    });
  };

  const handleUncheck = (value: any) => {
    setSelectedCheckboxes((prevState) => {
      const { [value]: _, ...rest } = prevState;
      return rest;
    });
  };

  const selectedOptions = useMemo(
    () => Object.keys(selectedCheckboxes),
    [selectedCheckboxes],
  );

  useEffect(() => {
    onChange(selectedOptions);
  }, [selectedCheckboxes]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="outline" className="w-full">
          {selectedOptions.length > 0
            ? `${selectedOptions.length} selected`
            : title}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {checkboxData?.map((value) => {
          const valueToSelect = value[checkboxValueTarget];
          return (
            <DropdownMenuCheckboxItem
              checked={selectedCheckboxes[valueToSelect]}
              onSelect={(e: Event) => {
                e.preventDefault();
                if (!selectedCheckboxes[valueToSelect])
                  handleCheck(valueToSelect);
                else handleUncheck(valueToSelect);
              }}
              key={value?.[checkboxValueTarget]}
            >
              {labelCreator(value)}
            </DropdownMenuCheckboxItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
