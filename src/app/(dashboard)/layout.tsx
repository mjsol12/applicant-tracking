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
          <main>{children}</main>
        </div>
      </div>
    </>
  );
}
