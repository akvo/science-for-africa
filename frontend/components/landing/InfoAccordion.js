import React from "react";
import { Check } from "lucide-react";

const InfoItem = ({ title, content }) => {
  return (
    <div className="py-32 md:py-40 border-b border-brand-gray-100 flex flex-col md:flex-row items-center gap-12 group last:border-b-0">
      <div className="flex items-center gap-8 w-full md:w-[40%] pr-8">
        <div className="w-6 h-6 rounded-full bg-brand-teal-900 flex items-center justify-center shrink-0">
          <Check className="w-4 h-4 text-white" strokeWidth={3} />
        </div>
        <h3 className="text-xl md:text-2xl font-bold text-brand-teal-900 tracking-tight leading-tight">
          {title}
        </h3>
      </div>
      <div className="w-full md:w-[60%]">
        <p className="text-base text-brand-gray-700 leading-relaxed max-w-3xl">
          {content}
        </p>
      </div>
    </div>
  );
};

const InfoAccordion = ({ items }) => {
  if (!items || !items.length) return null;

  return (
    <section className="bg-white border-b border-brand-gray-100 relative z-20">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col border-t border-brand-gray-100">
          {items.map((item, index) => (
            <InfoItem key={index} title={item.title} content={item.content} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default InfoAccordion;
