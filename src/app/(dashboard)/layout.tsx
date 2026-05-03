import { SideNav, TopNav } from "@/components/nav";
import { Container } from "@/components/ui/container";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-dvh overflow-hidden">
      <SideNav />
      <Container size="full" query={true} className="flex min-w-0 flex-1 flex-col">
        <TopNav title="HR Rollout" />
        <main className="min-h-0 flex-1 overflow-auto p-5">{children}</main>
      </Container>
    </div>
  );
}
