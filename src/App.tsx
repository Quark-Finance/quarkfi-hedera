import { Routes, Route } from "react-router";
import { MainLayout } from "@/layouts/MainLayout";
import { AppLayout } from "@/layouts/AppLayout";
import { Landing } from "@/pages/Landing";
import { VaultDiscovery } from "@/pages/VaultDiscovery";
import { VaultDetail } from "@/pages/VaultDetail";
import { UserAssets } from "@/pages/UserAssets";
import { QuarkAI } from "@/pages/QuarkAI";

export default function App() {
  return (
    <Routes>
      {/* Landing page with header + footer */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Landing />} />
      </Route>

      {/* App pages with sidebar */}
      <Route element={<AppLayout />}>
        <Route path="/vaults" element={<VaultDiscovery />} />
        <Route path="/vaults/:id" element={<VaultDetail />} />
        <Route path="/portfolio" element={<UserAssets />} />
        <Route path="/ai" element={<QuarkAI />} />
      </Route>
    </Routes>
  );
}
