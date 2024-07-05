"use client";
import { createContext, ReactNode, useContext, useState } from "react";

interface DashboardContextProps {
  activeComponent: string;
  setActiveComponent: (component: string) => void;
}

const DashboardContext = createContext<DashboardContextProps | undefined>(
  undefined
);

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const [activeComponent, setActiveComponent] = useState("dashboard");

  return (
    <DashboardContext.Provider value={{ activeComponent, setActiveComponent }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
};
