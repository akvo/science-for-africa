import React from "react";
import Link from "next/link";
import { MoveRight } from "lucide-react";

const BenefitsGrid = ({ title, items }) => {
  return (
    <section className="py-24 bg-white relative z-20">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <h2 className="text-display-sm md:text-display-md text-brand-teal-950 font-bold tracking-tight">
            {title}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {items?.map((item, idx) => (
            <div
              key={idx}
              className="group flex flex-col h-full animate-in fade-in slide-in-from-bottom-12"
              style={{ transitionDelay: `${idx * 100}ms` }}
            >
              <h3 className="text-xl font-bold text-brand-teal-950 mb-4 tracking-tight min-h-[3.5rem]">
                {item.title}
              </h3>
              <p className="text-brand-gray-700 text-md mb-8 leading-relaxed grow">
                {item.description}
              </p>
              
              {item.linkText && item.linkUrl && (
                <Link
                  href={item.linkUrl}
                  className="group/link inline-flex items-center gap-2 text-brand-teal-800 font-bold text-lg hover:text-brand-teal-600 transition-colors"
                >
                  {item.linkText}
                  <MoveRight className="w-5 h-5 transition-transform group-hover/link:translate-x-2" />
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsGrid;
