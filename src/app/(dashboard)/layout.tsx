import { SideNav, TopNav } from "@/components/nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-dvh overflow-hidden">
      <SideNav />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopNav title="Applicant List" />
        <main className="min-h-0 flex-1 p-5 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
