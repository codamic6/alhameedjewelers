import DashboardSidebar from "@/components/layout/DashboardSidebar";
import Header from "@/components/layout/Header";
import PageTransition from "@/components/PageTransition";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-background">
      <Header />
      <div className="grid md:grid-cols-[260px_1fr]">
        <DashboardSidebar />
        <main className="flex flex-col">
          <div className="flex-1 p-4 lg:p-6">
            <PageTransition>{children}</PageTransition>
          </div>
        </main>
      </div>
    </div>
  );
}
