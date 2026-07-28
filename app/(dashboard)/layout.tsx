import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">

      {/* Sidebar */}

      <aside className="h-full overflow-y-auto">
        <Sidebar />
      </aside>

      {/* Right Side */}

      <div className="flex flex-1 flex-col overflow-hidden">

        {/* Header */}

        <Header />

        {/* Scrollable Page */}

        <main className="flex-1 overflow-y-auto p-8">
          {children}

          <footer className="mt-10 border-t border-slate-200 py-4 text-center text-xs text-slate-500">
            © {new Date().getFullYear()} Liquor POS System. All Rights Reserved.
            <br />
            Developed by JavanTECH
          </footer>

        </main>

      </div>

    </div>
  );
}