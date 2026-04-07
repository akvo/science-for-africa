import { ChevronDown } from "lucide-react";

/**
 * Right-rail "About community" card.
 * Pure presentational — pass a `community` shaped object.
 */
function formatCount(n) {
  if (n == null) return "0";
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K`;
  return String(n);
}

export default function CommunityAboutCard({ community }) {
  const { stats = {}, moderators = [], subCommunities = [], rules = [] } =
    community;

  return (
    <aside className="flex flex-col gap-5 rounded-2xl border border-brand-gray-100 bg-brand-gray-50 p-5">
      <div>
        <h2 className="font-heading text-lg font-bold text-brand-gray-900">
          {community.name}
        </h2>
        <p className="mt-2 text-sm text-brand-gray-600">{community.about}</p>
        {community.createdAt ? (
          <p className="mt-3 text-xs text-brand-gray-500">
            Created{" "}
            {new Date(community.createdAt).toLocaleString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </p>
        ) : null}
      </div>

      <div className="flex items-center gap-6 border-t border-brand-gray-100 pt-4">
        <div>
          <div className="text-xs uppercase text-brand-gray-500">
            Subscribers
          </div>
          <div className="text-base font-semibold text-brand-gray-900">
            {stats.subscribers?.toLocaleString() ?? 0}
          </div>
        </div>
        <div>
          <div className="text-xs uppercase text-brand-gray-500">Posts</div>
          <div className="text-base font-semibold text-brand-gray-900">
            {stats.posts?.toLocaleString() ?? 0}
          </div>
        </div>
      </div>

      {moderators.length ? (
        <div className="border-t border-brand-gray-100 pt-4">
          <h3 className="mb-2 text-sm font-semibold text-brand-gray-900">
            Moderators
          </h3>
          <ul className="text-sm text-brand-gray-600">
            {moderators.map((m) => (
              <li key={m.id}>{m.name}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {subCommunities.length ? (
        <div className="border-t border-brand-gray-100 pt-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-brand-gray-900">
              Sub-Communities
            </h3>
            <button
              type="button"
              className="text-xs font-medium text-brand-teal-700 hover:underline"
            >
              See all
            </button>
          </div>
          <ul className="flex flex-col gap-2">
            {subCommunities.map((sc) => (
              <li key={sc.id} className="text-sm">
                <div className="font-medium text-brand-gray-900">
                  {sc.name}
                </div>
                <div className="text-xs text-brand-gray-500">
                  {formatCount(sc.subscribers)} Subscribers
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {rules.length ? (
        <div className="border-t border-brand-gray-100 pt-4">
          <h3 className="mb-3 text-sm font-semibold text-brand-gray-900">
            Community rules
          </h3>
          <ol className="flex flex-col">
            {rules.map((r, i) => (
              <li key={r.id}>
                <details className="group border-b border-brand-gray-100 last:border-b-0">
                  <summary className="flex cursor-pointer list-none items-center gap-3 py-3 text-sm text-brand-gray-700">
                    <span className="w-4 text-brand-gray-400">{i + 1}</span>
                    <span className="flex-1">{r.label}</span>
                    <ChevronDown className="size-4 text-brand-gray-400 transition-transform group-open:rotate-180" />
                  </summary>
                  {r.description ? (
                    <p className="pb-3 pl-7 text-xs text-brand-gray-600">
                      {r.description}
                    </p>
                  ) : null}
                </details>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </aside>
  );
}
