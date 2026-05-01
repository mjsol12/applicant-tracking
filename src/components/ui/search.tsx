'use client';
 
import { SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";
 
export default function Search({ placeholder }: { placeholder: string }) {
  const [value, setValue] = useState("");

  function handleSearch(term: string) {
    console.log("search", term);
  }

  useEffect(() => {
    const trimmed = value.trim();
    const shouldTrigger = trimmed.length >= 3 || trimmed.length === 0;
    if (!shouldTrigger) return;

    const timer = window.setTimeout(() => {
      handleSearch(value);
    }, 400);

    return () => window.clearTimeout(timer);
  }, [value]);
 
  return (
    <div className="relative flex flex-1 shrink-0 mb-3">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <input
        id="search"
        className="peer block w-full max-w-sm rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
        }}
      />
      <SearchIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
    </div>
  );
}