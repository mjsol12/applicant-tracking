"use client"

import type { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"


// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Applicant = {
  fullName: string
  email: string
  phone: string
  address: string
  status: "submitted" | "pending" | "processing" | "success" | "failed"
  appliedRole: string
  skills: string[]
  availableStartDate: string
  expectedSalary: number
  yearsOfExperience: number
  $id: string
  $sequence: string
  $createdAt: string
  $updatedAt: string
  $permissions: string[]
  $databaseId: string
  $tableId: string
}

export type ApplicantResult = {
    rows: Applicant[];
    total: number;  
}

export const columns: ColumnDef<Applicant>[] = [
  {
    accessorKey: "$id",
    header: "ID",
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
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <Link
        href={`/applicant/${row.original.$id}/edit`}
        className="text-sm font-medium text-primary underline-offset-4 hover:underline"
      >
        Edit
      </Link>
    ),
  },
]