import { Link, Routes, Route, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { posts, postsBySlug } from "./posts";

const API = import.meta.env.VITE_API_URL;

function useAnalytics(page) {
  useEffect(() => {
    const key = "sudo-gg-visitor-id";
    let visitorId = localStorage.getItem(key);
    if (!visitorId) {
      visitorId = crypto.randomUUID();
      localStorage.setItem(key, visitorId);
    }

    const startedAt = Date.now();

    const send = (eventType, metadata = {}) => {
      if (!API) return;
      fetch(`${API}/event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitor_id: visitorId,
          page,
          event_type: eventType,
          metadata,
        }),
      }).catch(() => {});
    };

    send("page_view", { path: window.location.pathname });
    const onClick = (e) => send("click", { tag: e.target.tagName });
    window.addEventListener("click", onClick);

    return () => {
      window.removeEventListener("click", onClick);
      send("time_on_page", {
        seconds: Math.round((Date.now() - startedAt) / 1000),
      });
    };
  }, [page]);
}

function Layout({ children }) {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <nav className="mb-12 flex gap-4 text-sm">
        <Link
          to="/"
          className="text-stone-500 hover:text-stone-900 transition-colors"
        >
          sudo-gg
        </Link>
        <span className="text-stone-300">/</span>
        <Link
          to="/blog"
          className="text-stone-500 hover:text-stone-900 transition-colors"
        >
          blog
        </Link>
        <Link
          to="/dashboard"
          className="text-stone-500 hover:text-stone-900 transition-colors"
        >
          dashboard
        </Link>
        <Link
          to="/about"
          className="text-stone-500 hover:text-stone-900 transition-colors"
        >
          about
        </Link>
      </nav>
      <main>{children}</main>
    </div>
  );
}

function Home() {
  useAnalytics("home");
  return (
    <Layout>
      <h1 className="text-5xl font-light text-stone-900 mb-6">Sudo-gg</h1>
      <p className="text-lg leading-relaxed text-stone-600 max-w-md mb-10">
        Mathematics student exploring ML, Probability and Pure mathematics.
      </p>
      <div className="flex gap-3">
        <Link
          to="/blog"
          className="px-4 py-2 border border-stone-300 rounded text-sm text-stone-700 hover:border-stone-500 hover:bg-stone-50 transition-all"
        >
          Blog
        </Link>
        <Link
          to="/dashboard"
          className="px-4 py-2 border border-stone-300 rounded text-sm text-stone-700 hover:border-stone-500 hover:bg-stone-50 transition-all"
        >
          Dashboard
        </Link>
        <Link
          to="/about"
          className="px-4 py-2 border border-stone-300 rounded text-sm text-stone-700 hover:border-stone-500 hover:bg-stone-50 transition-all"
        >
          About
        </Link>
      </div>
    </Layout>
  );
}

function Blog() {
  useAnalytics("blog");
  return (
    <Layout>
      <h1 className="text-3xl font-light text-stone-900 mb-8">Blog</h1>
      {posts.length === 0 ? (
        <p className="text-stone-500 text-sm">No posts yet.</p>
      ) : (
        <ul className="space-y-4">
          {posts.map((p) => (
            <li
              key={p.slug}
              className="flex items-baseline justify-between gap-4 border-b border-stone-100 pb-4"
            >
              <Link
                to={`/blog/${p.slug}`}
                className="text-stone-800 hover:text-stone-500 transition-colors"
              >
                {p.title}
              </Link>
              <span className="text-xs text-stone-400 shrink-0">{p.date}</span>
            </li>
          ))}
        </ul>
      )}
    </Layout>
  );
}

function Post() {
  useAnalytics("post");
  const { slug } = useParams();
  const post = postsBySlug[slug];
  if (!post) {
    return (
      <Layout>
        <h1 className="text-3xl font-light text-stone-900 mb-4">
          Post not found
        </h1>
        <p className="text-stone-500">That post does not exist yet.</p>
        <Link
          to="/blog"
          className="mt-6 inline-block text-sm text-stone-500 hover:text-stone-900"
        >
          ← Back to blog
        </Link>
      </Layout>
    );
  }
  const PostBody = post.Component;
  return (
    <Layout>
      <Link
        to="/blog"
        className="text-sm text-stone-400 hover:text-stone-700 mb-8 inline-block transition-colors"
      >
        ← Blog
      </Link>
      <h1 className="text-3xl font-light text-stone-900 mb-2">{post.title}</h1>
      <p className="text-sm text-stone-400 mb-10">{post.date}</p>
      <div className="prose prose-stone max-w-none">
        <PostBody />
      </div>
    </Layout>
  );
}

// ── Dashboard ────────────────────────────────────────────────────────────────

function StatCard({ label, value }) {
  return (
    <div className="border border-stone-200 rounded p-4">
      <p className="text-xs text-stone-400 mb-1">{label}</p>
      <p className="text-2xl font-light text-stone-800">{value}</p>
    </div>
  );
}

function BarChart({ data, max, color = "bg-stone-800" }) {
  return (
    <div className="space-y-2">
      {data.map(({ label, value }) => (
        <div key={label} className="flex items-center gap-3 text-sm">
          <span className="text-stone-500 w-20 shrink-0 truncate">{label}</span>
          <div className="flex-1 bg-stone-100 rounded-full h-2">
            <div
              className={`${color} h-2 rounded-full transition-all`}
              style={{ width: max ? `${(value / max) * 100}%` : "0%" }}
            />
          </div>
          <span className="text-stone-400 text-xs w-6 text-right">{value}</span>
        </div>
      ))}
    </div>
  );
}

function Dashboard() {
  useAnalytics("dashboard");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!API) {
      setLoading(false);
      setError(true);
      return;
    }
    fetch(`${API}/analytics`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        setError(true);
      });
  }, []);

  // Derive page breakdown and event type breakdown from events array
  const pageCounts = {};
  const eventTypeCounts = {};
  const hourCounts = Array(24).fill(0);
  (data?.events || []).forEach((e) => {
    pageCounts[e.page] = (pageCounts[e.page] || 0) + 1;
    eventTypeCounts[e.event_type] = (eventTypeCounts[e.event_type] || 0) + 1;
    const h = new Date(e.timestamp).getHours();
    if (!isNaN(h)) hourCounts[h]++;
  });

  const pageData = Object.entries(pageCounts)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const eventData = Object.entries(eventTypeCounts)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

  const maxPage = Math.max(...pageData.map((d) => d.value), 1);
  const maxEvent = Math.max(...eventData.map((d) => d.value), 1);
  const maxHour = Math.max(...hourCounts, 1);

  // Recent events table (last 10)
  const recentEvents = (data?.events || []).slice(0, 10);

  return (
    <Layout>
      <h1 className="text-3xl font-light text-stone-900 mb-8">Dashboard</h1>

      {loading && <p className="text-stone-400 text-sm">Loading…</p>}
      {error && (
        <div className="border border-stone-200 rounded p-4 text-sm text-stone-500">
          Analytics API unavailable. Set{" "}
          <code className="text-xs bg-stone-100 px-1 rounded">
            VITE_API_URL
          </code>{" "}
          to connect.
        </div>
      )}

      {data && !error && (
        <div className="space-y-10">
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-3">
            <StatCard label="Total events" value={(data.events || []).length} />
            <StatCard label="Page views" value={data.total_page_views || 0} />
            <StatCard
              label="Unique visitors"
              value={data.unique_visitors || 0}
            />
          </div>

          {/* Page breakdown */}
          {pageData.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-stone-700 mb-4">
                Views by page
              </h2>
              <BarChart data={pageData} max={maxPage} color="bg-stone-700" />
            </div>
          )}

          {/* Event type breakdown */}
          {eventData.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-stone-700 mb-4">
                Events by type
              </h2>
              <BarChart data={eventData} max={maxEvent} color="bg-stone-400" />
            </div>
          )}

          {/* Activity by hour */}
          {data.events?.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-stone-700 mb-4">
                Activity by hour (UTC)
              </h2>
              <div className="flex items-end gap-0.5 h-20">
                {hourCounts.map((v, i) => (
                  <div
                    key={i}
                    className="flex-1 flex flex-col items-center justify-end"
                  >
                    <div
                      className="w-full bg-stone-300 rounded-sm"
                      style={{
                        height: `${maxHour ? (v / maxHour) * 100 : 0}%`,
                        minHeight: v > 0 ? "2px" : "0",
                      }}
                      title={`${i}:00 — ${v} events`}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-stone-300 mt-1">
                <span>0h</span>
                <span>6h</span>
                <span>12h</span>
                <span>18h</span>
                <span>23h</span>
              </div>
            </div>
          )}

          {/* Recent events */}
          {recentEvents.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-stone-700 mb-4">
                Recent events
              </h2>
              <div className="space-y-1">
                {recentEvents.map((e) => (
                  <div
                    key={e.id}
                    className="flex gap-3 text-xs text-stone-400 border-b border-stone-100 pb-1"
                  >
                    <span className="shrink-0">
                      {new Date(e.timestamp).toLocaleString()}
                    </span>
                    <span className="text-stone-600 font-medium">
                      {e.event_type}
                    </span>
                    <span>{e.page}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}

function About() {
  useAnalytics("about");
  return (
    <Layout>
      <h1 className="text-3xl font-light text-stone-900 mb-6">About</h1>
      <p className="text-stone-600 leading-relaxed max-w-md">
        Minimal personal site for notes, posts, and analytics experiments.
      </p>
    </Layout>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/blog/:slug" element={<Post />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/about" element={<About />} />
    </Routes>
  );
}
