import Head from "next/head";

export default function DesignSystemTest() {
  const scales = [
    { n: 50, class: "bg-sfa-green-50" },
    { n: 100, class: "bg-sfa-green-100" },
    { n: 200, class: "bg-sfa-green-200" },
    { n: 300, class: "bg-sfa-green-300" },
    { n: 400, class: "bg-sfa-green-400" },
    { n: 500, class: "bg-sfa-green-500" },
    { n: 600, class: "bg-sfa-green-600" },
    { n: 700, class: "bg-sfa-green-700" },
    { n: 800, class: "bg-sfa-green-800" },
    { n: 900, class: "bg-sfa-green-900" },
    { n: 1000, class: "bg-sfa-green-1000" },
    { n: 1110, class: "bg-sfa-green-1110" },
  ];

  const spacings = [
    { n: 0, p: "p-sfa-0" },
    { n: 1, p: "p-sfa-1" },
    { n: 2, p: "p-sfa-2" },
    { n: 3, p: "p-sfa-3" },
    { n: 4, p: "p-sfa-4" },
    { n: 5, p: "p-sfa-5" },
    { n: 6, p: "p-sfa-6" },
    { n: 7, p: "p-sfa-7" },
    { n: 8, p: "p-sfa-8" },
    { n: 9, p: "p-sfa-9" },
    { n: 10, p: "p-sfa-10" },
  ];

  const radii = [
    { n: 1, r: "rounded-sfa-1" },
    { n: 2, r: "rounded-sfa-2" },
    { n: 3, r: "rounded-sfa-3" },
    { n: 4, r: "rounded-sfa-4" },
    { n: 5, r: "rounded-sfa-5" },
    { n: 6, r: "rounded-sfa-6" },
    { n: 7, r: "rounded-sfa-7" },
    { n: "full", r: "rounded-sfa-full" },
  ];

  const borders = [
    { n: 0, b: "border-sfa-0" },
    { n: 1, b: "border-sfa-1" },
    { n: 2, b: "border-sfa-2" },
    { n: 3, b: "border-sfa-3" },
  ];

  return (
    <div className="p-sfa-4 space-y-sfa-6 bg-white min-h-screen text-black">
      <Head>
        <title>SFA Design System Verification</title>
      </Head>

      <section>
        <h1 className="text-3xl font-bold mb-sfa-2 text-sfa-green-500">
          SFA Design System Verification
        </h1>
        <p className="text-sfa-green-900 italic">
          Visual audit of custom Tailwind v4 tokens.
        </p>
      </section>

      {/* Colors */}
      <section className="space-y-sfa-3">
        <h2 className="text-xl font-semibold border-b border-sfa-1 pb-sfa-1">
          Colors: Green Scale
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-sfa-2">
          {scales.map((s) => (
            <div key={s.n} className="space-y-sfa-1">
              <div
                className={`h-12 w-full ${s.class} rounded-sfa-1 border border-black/10`}
              />
              <p className="text-xs font-mono">green-{s.n}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Spacing */}
      <section className="space-y-sfa-3">
        <h2 className="text-xl font-semibold border-b border-sfa-1 pb-sfa-1">
          Spacing: sfa-0 to sfa-10
        </h2>
        <div className="flex flex-wrap items-end gap-sfa-1">
          {spacings.map((s) => (
            <div key={s.n} className="flex flex-col items-center gap-sfa-1">
              <div
                className={`bg-sfa-green-100 ${s.p} border border-sfa-green-500 inline-block`}
              >
                <div className="h-4 w-4 bg-sfa-green-500" />
              </div>
              <p className="text-xs font-mono">p-sfa-{s.n}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Border Radius */}
      <section className="space-y-sfa-3">
        <h2 className="text-xl font-semibold border-b border-sfa-1 pb-sfa-1">
          Radius: sfa-1 to sfa-full
        </h2>
        <div className="flex flex-wrap gap-sfa-3">
          {radii.map((r) => (
            <div key={r.n} className="flex flex-col items-center gap-sfa-1">
              <div className={`h-12 w-12 bg-sfa-green-500 ${r.r}`} />
              <p className="text-xs font-mono">rounded-sfa-{r.n}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Border Width */}
      <section className="space-y-sfa-3">
        <h2 className="text-xl font-semibold border-b border-sfa-1 pb-sfa-1">
          Border Width: border-sfa-0 to 3
        </h2>
        <div className="flex flex-wrap gap-sfa-3">
          {borders.map((b) => (
            <div key={b.n} className="flex flex-col items-center gap-sfa-1">
              <div
                className={`h-12 w-12 bg-white border-sfa-green-500 ${b.b}`}
              />
              <p className="text-xs font-mono">border-sfa-{b.n}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
