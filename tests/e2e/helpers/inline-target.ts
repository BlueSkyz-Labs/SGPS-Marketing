/**
 * Owner decision 2026-10-18 (audit B-01): the WCAG 2.5.8 inline exception. A
 * link whose computed display is `inline` and that sits in a run of sentence
 * text inside a <p> is exempt from target-size floors. Kept self-contained so
 * specs can pass `isInlineSentenceLink.toString()` into `page.evaluate`.
 */
export const isInlineSentenceLink = (el: Element): boolean => {
  if (el.tagName !== "A" || getComputedStyle(el).display !== "inline")
    return false;
  const para = el.closest("p");
  if (!para) return false;
  const own = (el.textContent ?? "").trim();
  const rest = (para.textContent ?? "").replace(own, "").trim();
  return rest.length > 0;
};
