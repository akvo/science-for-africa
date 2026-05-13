import React from "react";

const NewsletterSection = ({ title, text, buttonText, inputPlaceholder }) => {
  return (
    <section className="py-24 bg-brand-teal-950 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-teal-900 rounded-full blur-3xl -mr-48 -mt-48 opacity-30" />
      
      <div className="container mx-auto px-4 max-w-4xl relative z-10 text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <h2 className="text-display-sm md:text-display-md font-bold text-white mb-6">
          {title}
        </h2>
        <p className="text-xl text-brand-teal-100 mb-10 max-w-2xl mx-auto leading-relaxed">
          {text}
        </p>

        <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
          <input
            type="email"
            placeholder={inputPlaceholder}
            className="flex-1 px-8 py-4 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-brand-teal-300 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
            required
          />
          <button
            type="submit"
            className="px-10 py-4 bg-white text-brand-teal-950 font-bold rounded-full hover:bg-brand-teal-50 transition-all duration-300 shadow-xl"
          >
            {buttonText}
          </button>
        </form>
      </div>
    </section>
  );
};

export default NewsletterSection;
