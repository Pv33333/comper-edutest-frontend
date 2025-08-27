// Normalizes background classes on top-level page wrappers only.
const DENY_PREFIXES = ["bg-gray-", "bg-blue-", "bg-slate-", "bg-gradient-"];

/** Curăță fundalurile greșite DOAR la nivelul copiilor direcți din #page-root */
export function stripPageBg() {
  const root = document.getElementById("page-root");
  if (!root) return;

  const direct = Array.from(root.children);
  direct.forEach((el) => {
    if (!(el instanceof HTMLElement)) return;

    // scoate clasele de tip bg-* problematice
    const toRemove = [];
    el.classList.forEach((c) => {
      if (c.startsWith("bg-") && DENY_PREFIXES.some((p) => c.startsWith(p))) {
        toRemove.push(c);
      }
    });
    toRemove.forEach((c) => el.classList.remove(c));

    // curăță inline background (dacă există)
    el.style.background = "";
    el.style.backgroundColor = "";
  });
}
