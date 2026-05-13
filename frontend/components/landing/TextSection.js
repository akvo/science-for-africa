import React from "react";

const TextSection = ({ title, text, variant }) => {
  const isIntro = variant === "intro";

  return (
    <section
      className={`relative z-10 py-32 px-4 ${isIntro ? "bg-white" : "bg-teal-50"}`}
    >
      <div className="max-w-4xl mx-auto text-center animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
        <h2
          className={`font-bold mb-8 tracking-tight ${isIntro ? "text-5xl md:text-7xl text-teal-900" : "text-4xl text-teal-800"}`}
        >
          {title}
        </h2>
        {text && (
          <p className="text-xl md:text-2xl text-teal-700 leading-relaxed font-medium">
            {text}
          </p>
        )}
      </div>
    </section>
  );
};

export default TextSection;
