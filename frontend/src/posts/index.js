const modules = import.meta.glob("./*.jsx", { eager: true });

export const posts = Object.entries(modules)
  .map(([path, module]) => {
    const slug =
      module.metadata?.slug || path.replace("./", "").replace(".jsx", "");
    return {
      slug,
      title: module.metadata?.title || slug,
      date: module.metadata?.date || "Unknown date",
      Component: module.default,
    };
  })
  .sort((a, b) => (a.date > b.date ? -1 : 1));

export const postsBySlug = Object.fromEntries(
  posts.map((post) => [post.slug, post]),
);
