"use client";

import { SearchIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function Search({ placeholder }: { placeholder: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <form
      className="relative flex w-full max-w-sm shrink-0"
      method="get"
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const search = String(formData.get("search") ?? "").trim();
        if (search.length > 0 && search.length < 3) return;

        const params = new URLSearchParams(searchParams.toString());

        for (const key of ["cursor", "direction", "direct", "diretion"]) {
          params.delete(key);
        }

        if (!search) {
          params.delete("search");
        } else {
          params.set("search", search);
        }

        const qs = params.toString();
        const nextUrl = qs ? `${pathname}?${qs}` : pathname;
        router.replace(nextUrl);
      }}
    >
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <input
        id="search"
        className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
        placeholder={placeholder}
        name="search"
        defaultValue={searchParams.get("search") ?? ""}
        minLength={3}
        title="Enter at least 3 characters (or clear to reset)"
      />
      <button
        type="submit"
        aria-label="Submit search"
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 peer-focus:text-gray-900"
      >
        <SearchIcon className="h-[18px] w-[18px]" />
      </button>
    </form>
  );
}
