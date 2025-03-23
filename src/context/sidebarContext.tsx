"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface SidebarContextProps {
  isShowSidebar: boolean;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(undefined);

export const SidebarProvider = ({ children }: { children: ReactNode }) => {
  const [isShowSidebar, setIsShowSidebar] = useState(true);

  const toggleSidebar = () => setIsShowSidebar((prev) => !prev);

  return (
    <SidebarContext.Provider value={{ isShowSidebar, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};
