import DashboardSidebar from "@/components/layout/DashboardSidebar";
import Header from "@/components/layout/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <div className="flex min-h-[calc(100vh-64px)]">
        <DashboardSidebar />
        <main className="flex-1 p-4 lg:p-6">
            {children}
        </main>
      </div>
    </>
  );
}
