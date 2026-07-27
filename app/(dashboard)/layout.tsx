import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-100">

      <Sidebar />

      <div className="flex-1 flex flex-col">

        <Header />

        <main className="flex-1 p-8 overflow-auto">
          {children}
        </main>

        <footer className="border-t bg-white px-6 py-3 text-center text-xs text-gray-400">
  © {new Date().getFullYear()} Liquor POS System. All Rights Reserved.
  <br />
  Developed by JavanTECH
</footer>

      </div>

    </div>
  );
}