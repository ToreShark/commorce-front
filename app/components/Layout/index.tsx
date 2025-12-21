"use client";

import { useState, ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import Drawer from "./Mobile/Drawer";

interface LayoutProps {
  children: ReactNode;
  childrenClasses?: string;
}

export default function Layout({ children, childrenClasses }: LayoutProps) {
  const [drawer, setDrawer] = useState(false);

  return (
    <>
      <Drawer open={drawer} action={() => setDrawer(!drawer)} />
      <div className="w-full overflow-x-hidden">
        <Header drawerAction={() => setDrawer(!drawer)} />
        <div className={`w-full ${childrenClasses || "pt-[30px] pb-[60px]"}`}>
          {children}
        </div>
        <Footer />
      </div>
    </>
  );
}
