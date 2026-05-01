import { SideNav, TopNav } from "@/components/nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="flex min-h-[100dvh]">
        <SideNav />
        <div className="flex-grow overflow-auto">
          <TopNav title="Applicant List" />
          <main className="p-4">{children}</main>
        </div>
      </div>
    </>
  );
}
