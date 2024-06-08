import { Cross1Icon, PlusIcon } from "@radix-ui/react-icons";
import {
  InvalidateQueryFilters,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { format } from "date-fns";
import Head from "next/head";
import { useState } from "react";
import Layout from "src/components/layout";
import { CreateVoyageSheet } from "src/components/ui/CreateVoyageSheet";
import { Button } from "src/components/ui/shad-cn/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "src/components/ui/shad-cn/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "src/components/ui/shad-cn/table";
import { TABLE_DATE_FORMAT, breakpoints } from "src/constants";
import { useToast } from "src/hooks/use-toast";
import { fetchData } from "src/utils";
import { Skeleton } from "~/components/ui/shad-cn/skeleton";
import type { ReturnType } from "./api/voyage/getAll";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "src/components/ui/shad-cn/card";
import useMedia from "use-media";

export default function Home() {
  const isMobile = useMedia({ maxWidth: breakpoints.mobile }, undefined);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { data: voyages, isLoading } = useQuery<ReturnType>({
    queryKey: ["voyages"],
    queryFn: () => fetchData("voyage/getAll"),
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (voyageId: string) => {
      const response = await fetch(`/api/voyage/delete?id=${voyageId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const { message } = await response.json();
        throw new Error(message);
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries([
        "voyages",
      ] as InvalidateQueryFilters);
    },
    onError(error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDelete = (voyageId: string) => {
    mutation.mutate(voyageId);
  };

  return (
    <>
      <Head>
        <title>Voyages | DFDS</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        <CreateVoyageSheet
          isCreateDialogOpen={isCreateDialogOpen}
          setIsCreateDialogOpen={setIsCreateDialogOpen}
        />
        {isMobile ? (
          <MobileTable
            openDialog={setIsCreateDialogOpen}
            deleteVoyage={handleDelete}
            voyages={voyages}
            isLoading={isLoading}
          />
        ) : (
          <DesktopTable
            openDialog={setIsCreateDialogOpen}
            deleteVoyage={handleDelete}
            voyages={voyages}
            isLoading={isLoading}
          />
        )}
      </Layout>
    </>
  );
}

type TableProps = {
  openDialog: (open: boolean) => void;
  deleteVoyage: (voyageId: string) => void;
  voyages?: ReturnType;
  isLoading: boolean;
};

const DesktopTable = ({
  openDialog,
  deleteVoyage,
  voyages = [],
  isLoading = false,
}: TableProps) => {
  return (
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
              onClick={() => openDialog(true)}
            >
              <PlusIcon />
            </Button>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableSkeleton rows={16} cells={6} />
        ) : (
          voyages?.map((voyage) => (
            <TableRow key={voyage.id}>
              <TableCell>
                {format(new Date(voyage.scheduledDeparture), TABLE_DATE_FORMAT)}
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
                  onClick={() => deleteVoyage(voyage.id)}
                  variant="outline"
                >
                  <Cross1Icon />
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

const MobileTable = ({
  openDialog,
  deleteVoyage,
  voyages = [],
  isLoading = false,
}: TableProps) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-xl">Voyages</h1>
        <Button
          className="my-2"
          variant={"default"}
          title="Create new voyage"
          onClick={() => openDialog(true)}
        >
          <PlusIcon />
        </Button>
      </div>
      <div className="flex flex-col gap-4">
        {isLoading ? (
          <MobileTableSkeleton count={16} />
        ) : (
          voyages.map((voyage) => (
            <Card key={voyage.id}>
              <CardHeader>{voyage.vessel.name}</CardHeader>
              <CardContent className="flex flex-col">
                <div className="self-stretch">
                  {format(
                    new Date(voyage.scheduledDeparture),
                    TABLE_DATE_FORMAT,
                  )}{" "}
                  -{" "}
                  {format(new Date(voyage.scheduledArrival), TABLE_DATE_FORMAT)}
                </div>
                <div>
                  {voyage.portOfLoading} - {voyage.portOfDischarge}
                </div>
              </CardContent>
              <CardFooter className="justify-between">
                <Popover>
                  <PopoverTrigger>
                    <Button variant={"outline"}>
                      Unit types: {voyage.unitTypes.length}
                    </Button>
                  </PopoverTrigger>
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
                <Button
                  onClick={() => deleteVoyage(voyage.id)}
                  variant="outline"
                >
                  <Cross1Icon />
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

const TableSkeleton = ({
  rows,
  cells,
  rowHeight = 6,
}: {
  rows: number;
  cells: number;
  // rowHeight follows the format of Tailwind height
  rowHeight?: number;
}) => {
  return Array.from({ length: rows }, (_, index) => (
    <TableRow key={index}>
      {Array.from({ length: cells }, (_, cellIndex) => (
        <TableCell key={cellIndex}>
          <Skeleton
            className="w-full"
            style={{ height: `${rowHeight / 4}rem` }}
          />
        </TableCell>
      ))}
    </TableRow>
  ));
};

const MobileTableSkeleton = ({ count }: { count: number }) => {
  return Array.from({ length: count }, (_, index) => (
    <Skeleton key={index} className="h-52 w-full" />
  ));
};
