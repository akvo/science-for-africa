import React from "react";
import Link from "next/link";
import { MoveRight } from "lucide-react";

const BenefitsGrid = ({ title, tagline, items }) => {
  return (
    <section className="bg-white relative z-20 overflow-hidden">
      <div className="container mx-auto px-4 max-w-7xl pt-24 pb-0">
        <div className="mb-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          {tagline && (
            <p className="text-brand-teal-600 font-bold mb-4 text-base md:text-lg">
              {tagline}
            </p>
          )}
          <h2 className="text-display-sm md:text-display-md text-brand-teal-950 font-bold tracking-tight">
            {title}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 border-t border-l border-brand-gray-100">
          {items?.map((item, idx) => (
            <div
              key={idx}
              className="group p-10 border-r border-b border-brand-gray-100 animate-in fade-in slide-in-from-bottom-12 transition-colors hover:bg-brand-gray-50/50"
              style={{ transitionDelay: `${idx * 100}ms` }}
            >
              <h3 className="text-xl font-bold text-brand-teal-950 mb-3 tracking-tight">
                {item.title}
              </h3>
              <p className="text-brand-gray-600 text-base mb-4 leading-relaxed">
                {item.description}
              </p>

              {item.linkText && item.linkUrl && (
                <Link
                  href={item.linkUrl}
                  className="group/link inline-flex items-center gap-2 text-brand-gray-400 font-medium hover:text-brand-teal-600 transition-colors"
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
