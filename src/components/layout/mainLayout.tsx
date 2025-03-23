"use client";

import { useSidebar } from "@/context/sidebarContext";
import { Header } from "@/components/header/header";
import { Notif } from "@/components/notif/notif";
import { Sidebar } from "@/components/sidebar/sidebar";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const { isShowSidebar } = useSidebar();

  return (
    <div
      className={`antialiased bg-primary pt-20 transition-all duration-300 ${isShowSidebar ? "pl-[22vw]" : "pl-8"}`}
    >
      <Header />
      <Notif />
      <Sidebar />
      {children}
    </div>
  );
}

export default MainLayout;
