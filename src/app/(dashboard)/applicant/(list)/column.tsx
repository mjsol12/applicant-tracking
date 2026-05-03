"use client";

import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { API_URL_APPLICANT, APPLICANT_COLUMNS, TABLE_NAME_APPLICANT, type Applicant } from "@/config/applicant";
import { useDeleteResource } from "@/components/use-delete-resource";
import { formatCellDate } from "@/lib/utils";

function ApplicantRowActions({ rowId }: { rowId: string }) {
  const router = useRouter();
  const { pending, confirmDialog, deleteById } = useDeleteResource(
    API_URL_APPLICANT,
    {
    confirmMessage: "Delete this applicant?",
    confirmTitle: "Delete applicant",
    confirmDescription: "This action cannot be undone.",
    failedMessage: "Delete failed",
    networkMessage: "Network error",
    confirmActionLabel: "Delete",
    onSuccess: () => router.refresh(),
    },
  );

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            aria-label="Row actions"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-4 w-4" aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenuItem asChild>
            <Link href={`/${TABLE_NAME_APPLICANT}/${rowId}`}>View</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={`/${TABLE_NAME_APPLICANT}/${rowId}/edit`}>Edit</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:bg-destructive/10 focus:text-destructive"
            disabled={pending}
            onSelect={() => {
              void deleteById(rowId);
            }}
          >
            {pending ? "Deleting…" : "Delete"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {confirmDialog}
    </>
  );
}

export const columns: ColumnDef<Applicant>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <input
        type="checkbox"
        aria-label="Select all rows on page"
        checked={table.getIsAllPageRowsSelected()}
        ref={(element) => {
          if (element) {
            element.indeterminate = table.getIsSomePageRowsSelected();
          }
        }}
        onChange={(event) =>
          table.toggleAllPageRowsSelected(event.target.checked)
        }
        onClick={(event) => event.stopPropagation()}
        className="h-4 w-4 cursor-pointer accent-primary"
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        aria-label="Select row"
        checked={row.getIsSelected()}
        onChange={(event) => row.toggleSelected(event.target.checked)}
        onClick={(event) => event.stopPropagation()}
        className="h-4 w-4 cursor-pointer accent-primary"
      />
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <ApplicantRowActions rowId={row.original.$id} />,
  },
  ...APPLICANT_COLUMNS,
  {
    accessorKey: "availableStartDate",
    header: "Available Start",
    cell: ({ getValue }) => formatCellDate(getValue()),
  },
];
