import { notFound } from "next/navigation";

/** Any path under (dashboard) that is not matched by a sibling route triggers the dashboard not-found UI. */
export default function DashboardCatchAllPage() {
  notFound();
}
