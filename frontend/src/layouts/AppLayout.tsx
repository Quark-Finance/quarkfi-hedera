import { Outlet } from "react-router";
import { Sidebar } from "@/components/Sidebar";

export function AppLayout() {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
