export default function Home() {
  return (
    <main className="min-h-screen bg-white font-sans text-gray-700">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <header className="mb-16 border-b border-gray-100 pb-8">
          <h1 className="text-display-1 text-primary-500 mb-2">
            Design System
          </h1>
          <p className="text-body-1 text-gray-500">
            Science for Africa - Design System Foundation Verification
          </p>
        </header>

        {/* Colors */}
        <section className="mb-16">
          <h2 className="text-h6 uppercase tracking-wider text-gray-400 mb-6">
            Colors
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="h-20 w-full rounded-lg bg-primary-500 shadow-sm"></div>
              <p className="text-body-2 font-medium">Primary 500</p>
              <p className="text-xs text-gray-400">#005850</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 w-full rounded-lg bg-primary-700 shadow-sm"></div>
              <p className="text-body-2 font-medium">Primary 700</p>
              <p className="text-xs text-gray-400">#003e39</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 w-full rounded-lg bg-success-500 shadow-sm"></div>
              <p className="text-body-2 font-medium">Success 500</p>
              <p className="text-xs text-gray-400">#12b76a</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 w-full rounded-lg bg-error-500 shadow-sm"></div>
              <p className="text-body-2 font-medium">Error 500</p>
              <p className="text-xs text-gray-400">#f04438</p>
            </div>
          </div>
        </section>

        {/* Typography */}
        <section className="mb-16 space-y-8">
          <h2 className="text-h6 uppercase tracking-wider text-gray-400">
            Typography (Inter)
          </h2>
          <div>
            <p className="text-xs text-gray-400 mb-1">.text-display-1</p>
            <h1 className="text-display-1">Science for Africa</h1>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">.text-h3</p>
            <h3 className="text-h3">Global Health Progress</h3>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">.text-h6</p>
            <h6 className="text-h6">Research Collaboration Portal</h6>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">.text-body-1</p>
            <p className="text-body-1">
              This is the primary body text. It uses the Inter font with a line
              height of 22px, providing excellent readability for long-form
              scientific content.
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">.text-body-2</p>
            <p className="text-body-2 text-gray-500">
              Captions and secondary information use body-2 (14px).
            </p>
          </div>
        </section>

        {/* Components */}
        <section>
          <h2 className="text-h6 uppercase tracking-wider text-gray-400 mb-6">
            Base Components
          </h2>
          <div className="flex flex-wrap gap-4">
            <button className="rounded-full bg-primary-500 px-8 py-3 text-white font-medium hover:bg-primary-700 transition-colors shadow-xs">
              Primary Button
            </button>
            <button className="rounded-full border border-gray-200 bg-white px-8 py-3 text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-xs">
              Secondary Button
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
