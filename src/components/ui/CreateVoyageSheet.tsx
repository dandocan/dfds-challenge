import { zodResolver } from "@hookform/resolvers/zod";
import { UnitType } from "@prisma/client";
import {
  InvalidateQueryFilters,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { compareAsc } from "date-fns";
import { Controller, FieldValues, useForm } from "react-hook-form";
import { CheckboxDropdown } from "src/components/ui/CheckboxDropdown";
import { DateTimePopover } from "src/components/ui/DateTimePopover";
import { Button } from "src/components/ui/shad-cn/button";
import { Input } from "src/components/ui/shad-cn/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "src/components/ui/shad-cn/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
} from "src/components/ui/shad-cn/sheet";
import { VesselsType } from "src/pages/api/vessel/getAll";
import { fetchData } from "src/utils";
import { ZodType, z } from "zod";
import { useToast } from "~/hooks/use-toast";
import { createVoyage } from "~/lib/voyage";

type CreateVoyageSheetProps = {
  isCreateDialogOpen: boolean;
  setIsCreateDialogOpen: (open: boolean) => void;
};

type CreateVoyageBody = {
  portOfLoading: string;
  portOfDischarge: string;
  vessel: string;
  departure: Date;
  arrival: Date;
  unitTypes?: string[];
};

const schema: ZodType<CreateVoyageBody> = z
  .object({
    portOfLoading: z.string().min(1, { message: "Required" }),
    portOfDischarge: z.string().min(1, { message: "Required" }),
    vessel: z.string().min(1, { message: "Required" }),
    departure: z.date(),
    arrival: z.date(),
    date: z.string().optional(),
    unitTypes: z
      .array(z.string())
      .min(5, { message: "At least 5 unit types are required" }),
  })
  .refine((data) => compareAsc(data.arrival, data.departure) !== -1, {
    message: "Arrival date cannot be earlier than departure date.",
    path: ["date"],
  })
  .refine((data) => data.portOfLoading === data.portOfLoading, {
    message: "Port of loading and port of discharge cannot be the same.",
    path: ["arrival"],
  });

export const CreateVoyageSheet = ({
  isCreateDialogOpen,
  setIsCreateDialogOpen,
}: CreateVoyageSheetProps) => {
  const {
    register,
    handleSubmit,
    watch,
    control,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    reValidateMode: "onChange",
    defaultValues: {
      portOfDischarge: "",
      portOfLoading: "",
      departure: null,
      arrival: null,
      vessel: "",
      date: "",
      unitTypes: [],
    },
  });

  const { data: vessels } = useQuery<VesselsType>({
    queryKey: ["vessels"],
    queryFn: () => fetchData("vessel/getAll"),
  });

  const { data: unitTypes } = useQuery<UnitType[]>({
    queryKey: ["unitType"],
    queryFn: () => fetchData("unitType/getAll"),
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createMutation = useMutation({
    mutationFn: createVoyage,
    onSuccess: async () => {
      await queryClient.invalidateQueries([
        "voyages",
      ] as InvalidateQueryFilters);
      handleSheetClose(false);
      toast({
        title: "Success!",
        description: "Voyage was successfully created",
      });
    },
    onError(error) {
      handleSheetClose(false);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSheetClose = (open: boolean) => {
    if (!open) reset();
    setIsCreateDialogOpen(open);
  };

  const onSubmit = (data: FieldValues) => {
    createMutation.mutate({
      ...(data as CreateVoyageBody),
    });
  };

  return (
    <Sheet open={isCreateDialogOpen} onOpenChange={handleSheetClose}>
      <SheetContent className="flex flex-col" side={"right"}>
        <SheetHeader className="mb-2">Create new voyage</SheetHeader>
        <form
          className="flex h-full flex-col justify-between"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex flex-col gap-2">
            <div>
              <label htmlFor="portOfLoading">Port of loading</label>
              <Input type="text" {...register("portOfLoading")} />
              {
                <p className="h-4 text-red-400">
                  {errors.portOfLoading?.message &&
                    `*${errors.portOfLoading.message}`}
                </p>
              }
            </div>
            <div>
              <label htmlFor="portOfDischarge">Port of discharge</label>
              <Input type="text" {...register("portOfDischarge")} />
              {
                <p className="h-4 text-red-400">
                  {errors.portOfDischarge?.message &&
                    `*${errors.portOfDischarge.message}`}
                </p>
              }
            </div>
            <div>
              <label htmlFor="vessel">Vessel</label>
              <Controller
                name="vessel"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Select
                    onValueChange={(value) => {
                      setError("vessel", {});
                      onChange(value);
                    }}
                    value={value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a vessel" />
                    </SelectTrigger>
                    <SelectContent>
                      {vessels?.map((vesselOption) => (
                        <SelectItem
                          key={vesselOption.value}
                          value={vesselOption.value}
                        >
                          {vesselOption.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {
                <p className="h-4 text-red-400">
                  {errors.vessel?.message && `*${errors.vessel.message}`}
                </p>
              }
            </div>
            <div className="flex gap-2">
              <div className="flex w-1/2 flex-col">
                <label htmlFor="departure">Departure</label>
                <Controller
                  name="departure"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <DateTimePopover
                      onChange={onChange}
                      value={value}
                      maxDate={watch("arrival")}
                    />
                  )}
                />
                {
                  <p className="h-4 text-red-400">
                    {errors.departure?.message &&
                      `*${errors.departure.message}`}
                  </p>
                }
              </div>
              <div className="flex w-1/2 flex-col">
                <label htmlFor="arrival">Arrival</label>
                <Controller
                  name="arrival"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <DateTimePopover
                      onChange={onChange}
                      value={value}
                      minDate={watch("departure")}
                    />
                  )}
                />
                {
                  <p className="h-4 text-red-400">
                    {errors.arrival?.message && `*${errors.arrival.message}`}
                  </p>
                }
              </div>
            </div>
            {
              <p className="h-4 text-red-400">
                {errors.date?.message && `*${errors.date.message}`}
              </p>
            }
            <Controller
              name="unitTypes"
              control={control}
              render={({ field: { onChange } }) => (
                <CheckboxDropdown
                  checkboxData={unitTypes}
                  checkboxValueTarget="id"
                  labelCreator={(option) =>
                    `${option.name} - ${option.defaultLength}`
                  }
                  title="Unit types"
                  onChange={onChange}
                />
              )}
            />
            {
              <p className="h-4 text-red-400">
                {errors.unitTypes?.message && `*${errors.unitTypes.message}`}
              </p>
            }
          </div>
          <Button type="submit" variant={"default"}>
            Save
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
};
