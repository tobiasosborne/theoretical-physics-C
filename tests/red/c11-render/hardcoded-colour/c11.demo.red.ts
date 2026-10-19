// RED FIXTURE: a view that hard-codes a colour instead of asking the tokens. The lint
// (design/lint_content.py) must reject it.
export function paint(el: SVGElement): void {
  el.setAttribute('stroke', '#003659');
}
