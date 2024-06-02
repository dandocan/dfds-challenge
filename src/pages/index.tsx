import { zodResolver } from "@hookform/resolvers/zod";
import { UnitType } from "@prisma/client";
import { Cross1Icon, PlusIcon } from "@radix-ui/react-icons";
import {
  InvalidateQueryFilters,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { compareAsc, format } from "date-fns";
import Head from "next/head";
import { useState } from "react";
import { Controller, FieldValues, useForm } from "react-hook-form";
import { ZodType, z } from "zod";
import Layout from "~/components/layout";
import { CheckboxDropdown } from "~/components/ui/CheckboxDropdown";
import { DateTimePopover } from "~/components/ui/DateTimePopover";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Sheet, SheetContent, SheetHeader } from "~/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { useToast } from "~/components/ui/use-toast";
import { TABLE_DATE_FORMAT } from "~/constants";
import { createVoyage } from "~/lib/voyage";
import { fetchData } from "~/utils";
import { VesselsType } from "./api/vessel/getAll";
import type { ReturnType } from "./api/voyage/getAll";

export type CreateVoyageBody = {
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

export default function Home() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
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

  const { data: voyages } = useQuery<ReturnType>({
    queryKey: ["voyages"],
    queryFn: () => fetchData("voyage/getAll"),
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
      });
    },
  });
  const mutation = useMutation({
    mutationFn: async (voyageId: string) => {
      const response = await fetch(`/api/voyage/delete?id=${voyageId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete the voyage");
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries([
        "voyages",
      ] as InvalidateQueryFilters);
    },
  });

  const handleSheetClose = (open: boolean) => {
    if (!open) reset();
    setIsCreateDialogOpen(open);
  };

  const handleDelete = (voyageId: string) => {
    mutation.mutate(voyageId);
  };

  const onSubmit = (data: FieldValues) => {
    createMutation.mutate({
      ...(data as CreateVoyageBody),
    });
  };

  return (
    <>
      <Head>
        <title>Voyages | DFDS</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
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
                        {errors.arrival?.message &&
                          `*${errors.arrival.message}`}
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
                    {errors.unitTypes?.message &&
                      `*${errors.unitTypes.message}`}
                  </p>
                }
              </div>
              <Button type="submit" variant={"default"}>
                Save
              </Button>
            </form>
          </SheetContent>
        </Sheet>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Departure</TableHead>
              <TableHead>Arrival</TableHead>
              <TableHead>Port of loading</TableHead>
              <TableHead>Port of discharge</TableHead>
              <TableHead>Vessel</TableHead>
              <TableHead>Unit types</TableHead>
              <TableHead>
                <Button
                  className="my-2"
                  variant={"default"}
                  title="Create new voyage"
                  onClick={() => setIsCreateDialogOpen(true)}
                >
                  <PlusIcon />
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {voyages?.map((voyage) => (
              <TableRow key={voyage.id}>
                <TableCell>
                  {format(
                    new Date(voyage.scheduledDeparture),
                    TABLE_DATE_FORMAT,
                  )}
                </TableCell>
                <TableCell>
                  {format(new Date(voyage.scheduledArrival), TABLE_DATE_FORMAT)}
                </TableCell>
                <TableCell>{voyage.portOfLoading}</TableCell>
                <TableCell>{voyage.portOfDischarge}</TableCell>
                <TableCell>{voyage.vessel.name}</TableCell>
                <TableCell>
                  <Popover>
                    <PopoverTrigger># {voyage.unitTypes.length}</PopoverTrigger>
                    {voyage.unitTypes.length > 0 && (
                      <PopoverContent className="flex w-auto flex-col gap-1 rounded-sm border-2 border-white bg-popover p-3">
                        {voyage.unitTypes.map((unitType) => (
                          <div
                            className="flex justify-between gap-2"
                            key={unitType.id}
                          >
                            <span>{`${unitType.name}:`}</span>
                            <span>{unitType.defaultLength}</span>
                          </div>
                        ))}
                      </PopoverContent>
                    )}
                  </Popover>
                </TableCell>
                <TableCell>
                  <Button
                    onClick={() => handleDelete(voyage.id)}
                    variant="outline"
                  >
                    <Cross1Icon />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Layout>
    </>
  );
}
