"use client";

import Container from "../container";

export default function TopNav({ title }: { title: string }) {
  return (
    <Container className="flex h-16 items-center justify-between border-b border-border">
      <h1 className="text-2xl font-medium">{title}</h1>
      <div className="px-6 pt-4">
        <form action="/api/auth/logout" method="post">
          <button
            className="rounded-md border px-3 py-1.5 text-sm"
            type="submit"
          >
            Logout
          </button>
        </form>
      </div>
    </Container>
  );
}
