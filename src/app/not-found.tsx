import Link from "next/link";
import { Button } from "@/components/ui/button";

/** Global fallback (e.g. unknown paths outside the dashboard route group). */
export default function NotFound() {
  return (
    <div className="flex min-h-[50dvh] flex-col items-center justify-center gap-4 p-8 text-center">
      <p className="text-sm font-medium text-muted-foreground">Error 404</p>
      <h1 className="text-3xl font-semibold tracking-tight">Page not found</h1>
      <p className="max-w-md text-muted-foreground">
        The page you are looking for does not exist.
      </p>
      <Button asChild variant="outline">
        <Link href="/">Go home</Link>
      </Button>
    </div>
  );
}
