import React from "react";

const SecondaryHeading = ({ tagline, title }) => {
  return (
    <section className="py-24 bg-white border-b border-brand-gray-100">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          {tagline && (
            <p className="text-brand-teal-800 font-bold tracking-tight text-lg uppercase">
              {tagline}
            </p>
          )}
          <h2 className="text-display-md md:text-display-lg text-brand-teal-950 leading-tight">
            {title}
          </h2>
        </div>
      </div>
    </section>
  );
};

export default SecondaryHeading;
