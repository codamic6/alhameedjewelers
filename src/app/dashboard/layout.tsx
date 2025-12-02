import DashboardSidebar from "@/components/layout/DashboardSidebar";
import Header from "@/components/layout/Header";
import PageTransition from "@/components/PageTransition";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
    <Header />
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <DashboardSidebar />
      <div className="flex flex-col">
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 pt-16 md:pt-4">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
    </>
  );
}
