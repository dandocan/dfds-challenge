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
import { TABLE_DATE_FORMAT } from "src/constants";
import { useToast } from "src/hooks/use-toast";
import { fetchData } from "src/utils";
import { Skeleton } from "~/components/ui/skeleton";
import type { ReturnType } from "./api/voyage/getAll";

export default function Home() {
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
            {isLoading ? (
              <TableSkeleton rows={16} cells={6} />
            ) : (
              voyages?.map((voyage) => (
                <TableRow key={voyage.id}>
                  <TableCell>
                    {format(
                      new Date(voyage.scheduledDeparture),
                      TABLE_DATE_FORMAT,
                    )}
                  </TableCell>
                  <TableCell>
                    {format(
                      new Date(voyage.scheduledArrival),
                      TABLE_DATE_FORMAT,
                    )}
                  </TableCell>
                  <TableCell>{voyage.portOfLoading}</TableCell>
                  <TableCell>{voyage.portOfDischarge}</TableCell>
                  <TableCell>{voyage.vessel.name}</TableCell>
                  <TableCell>
                    <Popover>
                      <PopoverTrigger>
                        # {voyage.unitTypes.length}
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
              ))
            )}
          </TableBody>
        </Table>
      </Layout>
    </>
  );
}

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
