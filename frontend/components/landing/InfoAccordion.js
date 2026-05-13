import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

const AccordionItem = ({ title, content, isOpen, onClick }) => {
  return (
    <div className="border-b border-brand-gray-100 last:border-0">
      <button
        onClick={onClick}
        className="w-full py-6 flex items-center justify-between text-left hover:text-brand-teal-700 transition-colors"
      >
        <span className="text-xl md:text-display-xs font-bold text-brand-teal-950">
          {title}
        </span>
        <ChevronDown
          className={`w-6 h-6 text-brand-teal-800 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? "grid-rows-[1fr] pb-6 opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <p className="text-lg text-brand-gray-700 leading-relaxed">
            {content}
          </p>
        </div>
      </div>
    </div>
  );
};

const InfoAccordion = ({ title, items }) => {
  const [openIndex, setOpenIndex] = useState(0);

  if (!items || !items.length) return null;

  return (
    <section className="py-24 bg-brand-gray-50/30">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-12">
          {title && (
            <div className="lg:w-1/3">
              <h2 className="text-display-sm text-brand-teal-950 sticky top-32">
                {title}
              </h2>
            </div>
          )}
          <div className={title ? "lg:w-2/3" : "w-full"}>
            <div className="flex flex-col border-t border-brand-gray-100">
              {items.map((item, index) => (
                <AccordionItem
                  key={index}
                  title={item.title}
                  content={item.content}
                  isOpen={openIndex === index}
                  onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InfoAccordion;
