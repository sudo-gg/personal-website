import { Link, Routes, Route, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { InlineMath } from "react-katex";
import { posts, postsBySlug } from "./posts";

const API = import.meta.env.VITE_API_URL;
console.log(import.meta.env);
console.log(API);

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
      fetch(`${API}/event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitor_id: visitorId,
          page,
          event_type: eventType,
          metadata,
        }),
      });
    };

    send("page_view", { path: window.location.pathname });

    const onClick = (e) => {
      send("click", { tag: e.target.tagName });
    };

    window.addEventListener("click", onClick);

    return () => {
      window.removeEventListener("click", onClick);
      send("time_on_page", {
        seconds: Math.round((Date.now() - startedAt) / 1000),
      });
    };
  }, [page]);
}

function Layout({ title, children }) {
  return (
    <div className="wrap">
      <header>
        <h1>{title}</h1>
      </header>
      <main>{children}</main>
    </div>
  );
}

function Home() {
  useAnalytics("home");

  return (
    <Layout title="Sudo-gg">
      <p className="lead">
        Mathematics student exploring machine learning, probability, stochastic
        systems, and pure mathematics.
      </p>
      <nav className="links">
        <Link to="/blog">Blog</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/about">About</Link>
      </nav>
    </Layout>
  );
}

function Blog() {
  useAnalytics("blog");

  return (
    <Layout title="Blog">
      <ul>
        {posts.map((p) => (
          <li key={p.slug}>
            <Link to={`/blog/${p.slug}`}>{p.title}</Link> <span>{p.date}</span>
          </li>
        ))}
      </ul>
    </Layout>
  );
}

function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>Count: {count}</button>;
}

function Post() {
  useAnalytics("post");
  const { slug } = useParams();
  const post = postsBySlug[slug];

  if (!post) {
    return (
      <Layout title="Post not found">
        <p>That post does not exist yet.</p>
      </Layout>
    );
  }

  const PostBody = post.Component;

  return (
    <Layout title={post.title}>
      <PostBody />
    </Layout>
  );
}

function Dashboard() {
  useAnalytics("dashboard");
  const [data, setData] = useState({ events: [] });

  useEffect(() => {
    fetch(`${API}/analytics`)
      .then((r) => r.json())
      .then(setData);
  }, []);

  return (
    <Layout title="Dashboard">
      <p>Total page views: {data.total_page_views || 0}</p>
      <p>Unique visitors: {data.unique_visitors || 0}</p>
      <ul>
        {(data.events || []).map((e) => (
          <li key={e.id}>
            {e.timestamp} {e.event_type} {e.page}
          </li>
        ))}
      </ul>
    </Layout>
  );
}

function About() {
  useAnalytics("about");

  return (
    <Layout title="About">
      <p>
        This is a minimal personal site for notes, posts, and analytics
        experiments.
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
