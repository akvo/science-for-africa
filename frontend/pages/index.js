import Head from "next/head";

export default function StyleGuide() {
  // Force utilities: bg-brand-gray-50 bg-brand-brand-teal-50 bg-brand-orange-50 bg-brand-gray-100 bg-brand-gray-200 bg-brand-gray-300 bg-brand-gray-400 bg-brand-gray-500 bg-brand-gray-600 bg-brand-gray-700 bg-brand-gray-800 bg-brand-gray-900

  const colorPalettes = {
    Primary: ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"],
    Teal: ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"],
    Orange: ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"],
    Gray: ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"],
  };

  const typographyScale = [
    { name: "Display 2xl", class: "text-display-2xl" },
    { name: "Display xl", class: "text-display-xl" },
    { name: "Display lg", class: "text-display-lg" },
    { name: "Display md", class: "text-display-md" },
    { name: "Display sm", class: "text-display-sm" },
    { name: "Display xs", class: "text-display-xs" },
    { name: "Text xl", class: "text-xl" },
    { name: "Text lg", class: "text-lg" },
    { name: "Text md", class: "text-md" },
    { name: "Text sm", class: "text-sm" },
    { name: "Text xs", class: "text-xs" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8 space-y-16">
      <Head>
        <title>SFA Design System | Style Guide</title>
      </Head>

      <header className="max-w-4xl">
        <h1 className="text-display-md text-primary-500 mb-4 uppercase">Science for Africa</h1>
        <h2 className="text-display-xs text-gray-900 mb-6">Design System Foundation v1.0</h2>
        <p className="text-lg text-gray-600">
          This foundation is built using Tailwind 4 CSS-native tokens, extracted directly from the SFA Figma Specification (Node 6:87 & 25:692).
        </p>
      </header>

      {/* Typography Section */}
      <section className="space-y-8">
        <h3 className="text-xl border-b border-gray-200 pb-2 text-primary-700">Typography Scale</h3>
        <div className="space-y-10">
          {typographyScale.map((item) => (
            <div key={item.name} className="flex flex-col md:flex-row md:items-baseline gap-4 md:gap-12">
              <span className="text-xs font-mono text-gray-400 w-32 shrink-0">.{item.class}</span>
              <div className={item.class}>
                {item.name} - The future of science in Africa
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Color Palettes Section */}
      <section className="space-y-8">
        <h3 className="text-xl border-b border-gray-200 pb-2 text-primary-700">Color Palettes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {Object.entries(colorPalettes).map(([name, shades]) => (
            <div key={name} className="space-y-4">
              <h4 className="text-lg font-bold">{name} Palette</h4>
              <div className="grid grid-cols-5 gap-3">
                {shades.map((shade) => {
                  const paletteKey = name.toLowerCase();
                  // We use a mapping to ensure Tailwind's static analyzer sees the strings
                  const colorMap = {
                    primary: {
                      "50": "bg-primary-50", "100": "bg-primary-100", "200": "bg-primary-200", "300": "bg-primary-300", "400": "bg-primary-400",
                      "500": "bg-primary-500", "600": "bg-primary-600", "700": "bg-primary-700", "800": "bg-primary-800", "900": "bg-primary-900",
                    },
                    teal: {
                      "50": "bg-brand-teal-50", "100": "bg-brand-teal-100", "200": "bg-brand-teal-200", "300": "bg-brand-teal-300", "400": "bg-brand-teal-400",
                      "500": "bg-brand-teal-500", "600": "bg-brand-teal-600", "700": "bg-brand-teal-700", "800": "bg-brand-teal-800", "900": "bg-brand-teal-900",
                    },
                    orange: {
                      "50": "bg-brand-orange-50", "100": "bg-brand-orange-100", "200": "bg-brand-orange-200", "300": "bg-brand-orange-300", "400": "bg-brand-orange-400",
                      "500": "bg-brand-orange-500", "600": "bg-brand-orange-600", "700": "bg-brand-orange-700", "800": "bg-brand-orange-800", "900": "bg-brand-orange-900",
                    },
                    gray: {
                      "50": "bg-brand-gray-50", "100": "bg-brand-gray-100", "200": "bg-brand-gray-200", "300": "bg-brand-gray-300", "400": "bg-brand-gray-400",
                      "500": "bg-brand-gray-500", "600": "bg-brand-gray-600", "700": "bg-brand-gray-700", "800": "bg-brand-gray-800", "900": "bg-brand-gray-900",
                    }
                  };
                  const bgClass = colorMap[paletteKey]?.[shade] || "";
                  return (
                    <div key={shade} className="space-y-2">
                      <div className={`h-14 w-full rounded-16 shadow-xs border border-gray-100 ${bgClass}`} />
                      <div className="flex justify-between items-center px-1">
                        <span className="text-[10px] font-mono text-gray-500">{shade}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Components Preview */}
      <section className="space-y-8">
        <h3 className="text-xl border-b border-gray-200 pb-2 text-primary-700">Spacing & UI Elements</h3>
        <div className="flex flex-wrap gap-12">
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-gray-500 uppercase">Radius & Shadows</h4>
            <div className="flex gap-4">
              <div className="h-24 w-24 bg-white border border-gray-200 rounded-16 shadow-xs flex items-center justify-center text-xs">R16</div>
              <div className="h-24 w-24 bg-white border border-gray-200 rounded-32 shadow-xs flex items-center justify-center text-xs">R32</div>
              <div className="h-24 w-24 bg-white border border-gray-200 rounded-full shadow-xs flex items-center justify-center text-xs">Full</div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-bold text-gray-400 uppercase">Spacing (Gap-40)</h4>
            <div className="flex gap-40 bg-brand-gray-100 p-16 rounded-8">
              <div className="h-10 w-10 bg-brand-orange-500 rounded-full" />
              <div className="h-10 w-10 bg-brand-teal-500 rounded-full" />
              <div className="h-10 w-10 bg-primary-500 rounded-full" />
            </div>
          </div>
        </div>
      </section>

      <footer className="pt-12 border-t border-gray-200 text-sm text-gray-400 flex justify-between">
        <span>Science for Africa | Sprint 1: Foundation</span>
        <span className="font-mono">STORY-003: COMPLETE</span>
      </footer>
    </div>
  );
}
