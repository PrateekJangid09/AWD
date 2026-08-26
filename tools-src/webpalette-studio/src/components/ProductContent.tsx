import { ROLE_LABEL, ROLE_ORDER, ROLE_PURPOSE } from '../lib/types';

export function ProductContent({ onStart }: { onStart: () => void }) {
  const faqs = [
    ['What is WebPalette Studio?', 'A website color-system builder that turns one to five existing colors into a five-role website palette while protecting the colors you deliberately chose.'],
    ['Is this a color palette generator?', 'It can generate missing colors, but it starts with an existing palette instead of replacing it. The main job is completing the website system around your chosen colors.'],
    ['Will WebPalette Studio change my brand colors?', 'Protected source HEX values are not mutated by the solver. Generated supporting colors remain replaceable.'],
    ['Can I start with one color?', 'Yes. A complete system can be built from one source color. Adding more existing brand colors gives the engine more original direction to preserve.'],
    ['Does Preview secretly generate missing colors?', 'No. The incomplete preview intentionally uses only the colors currently present.'],
    ['Does a perfect readiness score mean my palette is beautiful?', 'No. Website readiness evaluates role coverage, contrast, separation and utility. It does not replace taste, brand strategy or visual judgment.'],
    ['Does WebPalette Studio use AI?', 'The current engine is deterministic. Color science, role inference, candidate generation, scoring and completion do not require an LLM.'],
    ['Are my colors uploaded?', 'The core solver runs client-side and does not require a backend or external color API.'],
  ];

  return (
    <div className="product-content">
      <section className="content-lead" id="why-it-exists">
        <span className="section-kicker">WHY IT EXISTS</span>
        <h2>You probably do not need a new palette.</h2>
        <p>You may already have the right brand colors. The problem starts when those two or three colors are expected to handle an entire website. A site still needs a background, readable ink, hierarchy, an action color and enough contrast between them.</p>
        <p>WebPalette Studio keeps the colors you chose and builds the missing structure around them.</p>
      </section>

      <section className="content-split preview-story">
        <div><span className="section-kicker">BEFORE / AFTER</span><h2>See the problem before we solve it.</h2></div>
        <div><p>Preview your current palette on a fixed website. If you only have two colors, the preview uses only those two colors.</p><ul><li>No hidden neutral.</li><li>No secret accent.</li><li>No automatic repair.</li></ul><p>Then complete the palette and open the same website again. The layout stays. The color system changes.</p></div>
      </section>

      <section className="content-block">
        <span className="section-kicker">FIVE WEBSITE ROLES</span>
        <h2>Five colors. Five jobs.</h2>
        <div className="role-explain-grid">
          {ROLE_ORDER.map((role) => <article key={role}><strong>{ROLE_LABEL[role]}</strong><p>{ROLE_PURPOSE[role]}.</p></article>)}
        </div>
        <p className="content-note">A complete palette is not five coordinated colors. It is five colors that can do five different jobs.</p>
      </section>

      <section className="content-split protected-story">
        <div><span className="section-kicker">PROTECTED FIRST</span><h2>Your brand colors do not get “optimized away.”</h2></div>
        <div><p>When you add a color, WebPalette Studio treats it as a design decision. Completing the palette can create supporting colors around it. It does not silently change the HEX value you supplied.</p><p>If you explicitly choose a suggestion or lock a semantic role, that decision remains protected too.</p></div>
      </section>

      <section className="content-block steps-block" id="how-it-works">
        <span className="section-kicker">HOW IT WORKS</span>
        <h2>From brand colors to website system.</h2>
        <div className="steps-grid">
          <article><b>01</b><strong>Add your colors</strong><p>Paste HEX, search by name, pick from the screen or use Color Studio.</p></article>
          <article><b>02</b><strong>See their roles</strong><p>The tool studies lightness, chroma, hue relationships, contrast and selection order.</p></article>
          <article><b>03</b><strong>See what is missing</strong><p>Primary, Secondary, Light Neutral, Dark Neutral and Accent are checked as separate jobs.</p></article>
          <article><b>04</b><strong>Complete the system</strong><p>Missing roles are generated around the colors you chose, with tone and related hues preferred first.</p></article>
          <article><b>05</b><strong>Preview and export</strong><p>Compare the same website before and after, then copy semantic CSS variables.</p></article>
        </div>
      </section>

      <section className="content-split engine-story">
        <div><span className="section-kicker">TECHNICAL TRANSPARENCY</span><h2>No prompt. No black box.</h2></div>
        <div><p>The current completion engine is deterministic. It uses sRGB conversion, OKLab / OKLCH analysis, hue relationships, semantic role fitness, contrast, candidate generation, whole-palette scoring and beam search.</p><p>The math stays behind progressive disclosure. The product explains the decision first, then exposes technical evidence when you want it.</p></div>
      </section>

      <section className="content-block faq-section">
        <span className="section-kicker">FAQ</span>
        <h2>Questions designers usually ask.</h2>
        <div className="faq-list">
          {faqs.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}
        </div>
      </section>

      <section className="final-cta">
        <span className="section-kicker">WEBPALETTE STUDIO</span>
        <h2>Your colors are already the starting point.</h2>
        <p>Do not regenerate the identity. Complete the system.</p>
        <button className="btn dark" onClick={onStart}>Start with your colors</button>
        <small>Free to use · No signup required</small>
      </section>
    </div>
  );
}
