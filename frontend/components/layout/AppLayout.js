import React from "react";
import Navbar from "./Navbar";

const AppLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      {/*
        Spacing to account for fixed navbar:
        HeaderTop (34px) + MainNav (80px) = 114px
      */}
      <main className="flex-grow pt-[114px]">
        <div className="container mx-auto px-4 md:px-8 py-8">{children}</div>
      </main>
    </div>
  );
};

export default AppLayout;
