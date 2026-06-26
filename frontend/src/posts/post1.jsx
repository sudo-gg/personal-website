import { InlineMath } from "react-katex";

export const metadata = {
  slug: "first-post",
  title: "A tiny note on randomness",
  date: "2026-06-23",
};

export default function FirstPost() {
  return (
    <article className="post">
      <p>Test post :)</p>
      <img src="/sample.jpg" alt="Sample" />
      <p>
        Equation: <InlineMath math="\\int_0^1 x^2 \, dx = \\frac{1}{3}" />
      </p>
      <iframe title="pdf" src="/sample.pdf"></iframe>
    </article>
  );
}
