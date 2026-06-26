export const metadata = {
  slug: "central-limit-theorem",
  title: "A note on the Central Limit Theorem",
  date: "2025-02-03",
};

export default function Post() {
  return (
    <article>
      <p>
        The CLT is one of the most elegant results in probability. Roughly: the
        sum of many independent random variables tends toward a normal distribution,
        regardless of the underlying distribution.
      </p>
      <p>
        More precisely, if X₁, X₂, … are i.i.d. with mean μ and finite variance σ²,
        then as n → ∞:
      </p>
      <p>
        <em>√n · (X̄ₙ − μ) / σ → N(0, 1)</em>
      </p>
      <p>
        The remarkable thing is that "finite variance" is doing all the heavy lifting here.
        Without it — as with the Cauchy distribution — the theorem breaks down completely.
      </p>
    </article>
  );
}