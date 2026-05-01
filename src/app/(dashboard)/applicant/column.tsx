"use client";

import { format, isValid, parse, parseISO } from "date-fns";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ApplicantStatus } from "@/types/enum";

export type Applicant = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  status: ApplicantStatus | string;
  appliedRole: string;
  skills: string[];
  availableStartDate: string;
  expectedSalary: number;
  yearsOfExperience: number;
  $id: string;
  $sequence: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  $databaseId: string;
  $tableId: string;
};

export type ApplicantResult = {
  rows: Applicant[];
  total: number;
  nextCursor: string | null;
  previousCursor: string | null;
};

function formatCellDate(value: unknown): string {
  if (value == null || value === "") return "—";
  const s = String(value).trim();
  if (!s) return "—";

  const d = /^\d{4}-\d{2}-\d{2}$/.test(s)
    ? parse(s, "yyyy-MM-dd", new Date())
    : parseISO(s);

  if (!isValid(d)) return s;
  return format(d, "MMM d, yyyy");
}

function ApplicantRowActions({ rowId }: { rowId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    if (!window.confirm("Delete this applicant?")) return;
    setPending(true);
    try {
      const res = await fetch(
        `/api/data/applicant?rowId=${encodeURIComponent(rowId)}`,
        { method: "DELETE", credentials: "include" },
      );
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        window.alert(json.error ?? "Delete failed");
        return;
      }
      router.refresh();
    } catch {
      window.alert("Network error");
    } finally {
      setPending(false);
    }
  }

  return (
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
          <Link href={`/applicant/${rowId}`}>View</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`/applicant/${rowId}/edit`}>Edit</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:bg-destructive/10 focus:text-destructive"
          disabled={pending}
          onSelect={(e) => {
            e.preventDefault();
            void handleDelete();
          }}
        >
          {pending ? "Deleting…" : "Delete"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
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
  {
    accessorKey: "fullName",
    header: "Full Name",
  },
  {
    accessorKey: "appliedRole",
    header: "Applied Role",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "yearsOfExperience",
    header: "Years Exp",
  },
  {
    accessorKey: "expectedSalary",
    header: "Expected Salary",
  },
  {
    accessorKey: "availableStartDate",
    header: "Available Start",
    cell: ({ getValue }) => formatCellDate(getValue()),
  },
];
