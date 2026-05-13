import React from "react";
import Link from "next/link";
import { MoveRight } from "lucide-react";

const ExploreCommunities = ({ title, description, linkText, linkUrl }) => {
  return (
    <section className="py-24 bg-brand-gray-50/50">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="max-w-2xl">
            <h2 className="text-display-sm md:text-display-md text-brand-teal-950 mb-4">
              {title}
            </h2>
            <p className="text-lg text-brand-gray-700 leading-relaxed">
              {description}
            </p>
          </div>

          {linkText && linkUrl && (
            <Link
              href={linkUrl}
              className="group flex items-center gap-2 text-brand-teal-800 font-bold text-lg hover:text-brand-teal-600 transition-colors whitespace-nowrap"
            >
              {linkText}
              <MoveRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>

        {/* Placeholder for Dynamic Communities Grid - To be integrated with real data */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white p-8 rounded-3xl shadow-sm border border-brand-gray-100 h-64 animate-pulse group hover:shadow-xl transition-all duration-300"
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExploreCommunities;
