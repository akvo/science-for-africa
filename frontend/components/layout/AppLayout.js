import React from "react";
import Navbar from "./Navbar";

const AppLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-white overflow-x-hidden">
      <Navbar />
      {/*
        Spacing to account for fixed navbar:
        HeaderTop (34px) + MainNav (80px) = 114px
      */}
      <main className="grow pt-28.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
