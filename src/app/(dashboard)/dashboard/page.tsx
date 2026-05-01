import { getLoggedInUser } from "@/lib/appwrite-server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getLoggedInUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="px-4 py-4">
      <h1 className="text-lg font-medium">Dashboard</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Placeholder dashboard page.
      </p>
    </div>
  );
}
