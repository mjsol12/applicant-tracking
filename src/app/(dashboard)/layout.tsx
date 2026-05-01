import { TopNav } from "@/components/nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <TopNav title="Applicant List" />
      <div className="px-6 pt-4">
        <form action="/api/auth/logout" method="post">
          <button className="rounded-md border px-3 py-1.5 text-sm" type="submit">
            Logout
          </button>
        </form>
      </div>
      <main>{children}</main>
    </>
  );
}
