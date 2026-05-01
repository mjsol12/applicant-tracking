"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { Applicant, ApplicantResult } from "./column";

interface DataTableProps {
  columns: ColumnDef<Applicant>[];
  data: ApplicantResult;
}

export function DataTable({ columns, data }: DataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const table = useReactTable({
    data: data.rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      rowSelection,
    },
  });

  const handlePagination = (direction: "next" | "previous") => {
    const cursor = direction === "next" ? data.nextCursor : data.previousCursor;
    if (!cursor) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("direct", direction);
    params.set("cursor", cursor);

    const nextUrl = params.toString()
      ? `${pathname}?${params.toString()}`
      : pathname;
    router.replace(nextUrl);
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1 overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <button
                        type="button"
                        className={cn(
                          "-ml-2 inline-flex h-8 items-center gap-1 rounded-md px-2 text-left font-medium text-muted-foreground hover:bg-muted/80 hover:text-foreground",
                          header.column.getIsSorted() && "text-foreground",
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {header.column.getIsSorted() === "asc" ? (
                          <ArrowUp
                            className="size-4 shrink-0 opacity-70"
                            aria-hidden
                          />
                        ) : header.column.getIsSorted() === "desc" ? (
                          <ArrowDown
                            className="size-4 shrink-0 opacity-70"
                            aria-hidden
                          />
                        ) : (
                          <ArrowUpDown
                            className="size-4 shrink-0 opacity-40"
                            aria-hidden
                          />
                        )}
                      </button>
                    ) : (
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="whitespace-nowrap">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between">
        <p>Results: {data.total}</p>
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePagination("previous")}
            disabled={!data.previousCursor}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePagination("next")}
            disabled={!data.nextCursor}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
