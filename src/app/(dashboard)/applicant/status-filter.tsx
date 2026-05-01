"use client";

import { ChevronDown } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { APPLICANT_STATUS, type ApplicantStatus } from "@/types/enum";

import { cn } from "@/lib/utils";

const fieldClass = cn(
  "h-10 min-w-[150px] rounded-md border border-input bg-background pl-3 pr-10 text-sm",
  "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  "appearance-none bg-transparent",
);

function buildNextParams(searchParams: URLSearchParams, nextStatus: string) {
  const params = new URLSearchParams(searchParams.toString());

  for (const key of ["cursor", "direction", "direct", "diretion"]) {
    params.delete(key);
  }

  if (!nextStatus) {
    params.delete("status");
  } else {
    params.set("status", nextStatus);
  }

  return params;
}

export function ApplicantStatusFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const current = (searchParams.get("status") ?? "") as ApplicantStatus | "";

  return (
    <label className="flex items-center gap-3 text-sm">
      <span className="shrink-0 text-muted-foreground">Status</span>
      <span className="relative inline-flex">
        <select
          className={fieldClass}
          value={current}
          onChange={(e) => {
            const nextStatus = e.target.value;
            const params = buildNextParams(searchParams, nextStatus);
            const qs = params.toString();
            router.replace(qs ? `${pathname}?${qs}` : pathname);
          }}
        >
          <option value="">All</option>
          {APPLICANT_STATUS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
      </span>
    </label>
  );
}
