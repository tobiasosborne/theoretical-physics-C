// The intermediate tree: one JSON file per chapter and language
// (build/web/ir/<chapter>.<lang>.json). Everything the HTML needs is in here; the renderer
// reads nothing else except the figure SVGs.
import type { Lang } from './env.ts';

export interface Loc { file: string; line: number }

export type Inline =
  | { t: 'text'; text: string }
  | { t: 'emph'; children: Inline[] }
  | { t: 'strong'; children: Inline[] }
  | { t: 'math'; src: string; tex: string; mathml: string; plain: string; loc: Loc; numClaims?: string[] }
  /** \\num[claim]{value}{unit} in running text: a supported number */
  | { t: 'num'; claim: string | null; tex: string; mathml: string; plain: string; loc: Loc }
  | { t: 'ref'; kind: 'ref' | 'eqref' | 'pageref'; target: string; number: string | null; external: boolean; chapter: string }
  | { t: 'zoomref'; target: string; number: string; depth: 'vertiefung' | 'fundament'; anchor: string | null; lead: string }
  | { t: 'defref'; id: string; number: string | null; external: boolean }
  | { t: 'srcref'; key: string; locus: Inline[] };

export interface Claim { id: string; status: string; presentation: string | null; tag: string | null }

export interface DisplayRow { id: string | null; number: string | null; claim: Claim | null }

export type Block =
  | { t: 'heading'; level: 2 | 3; id: string; number: string; title: Inline[]; loc: Loc }
  | { t: 'para'; cont: boolean; children: Inline[] }
  | { t: 'display'; env: string; rows: DisplayRow[]; src: string; tex: string; mathml: string; loc: Loc; numClaims?: string[] }
  | { t: 'unit'; env: string; numbered: boolean; id: string | null; number: string | null; name: Inline[] | null; claim: Claim | null; children: Block[]; loc: Loc }
  | { t: 'box'; env: string; title: Inline[] | null; children: Block[]; loc: Loc }
  | { t: 'list'; env: 'itemize' | 'enumerate' | 'description'; items: Array<{ label: Inline[] | null; children: Block[] }> }
  | { t: 'depth'; kind: 'vertiefung' | 'fundament'; id: string; number: string; titel: Inline[]; wozu: Inline[]; voraussetzung: Inline[]; zurueck: Inline[];
      from: { text: string; anchor: string } | null; children: Block[]; loc: Loc }
  | { t: 'figure'; id: string; number: string; file: string; demo: string | null; caption: Inline[]; alt: string; loc: Loc }
  | { t: 'table'; id: string; number: string; caption: Inline[]; colspec: string[]; rows: Array<{ rule: 'top' | 'mid' | 'bottom' } | { cells: Inline[][] }>; loc: Loc }
  | { t: 'definition'; id: string; number: string; depth: string; name: Inline[]; children: Block[]; loc: Loc };

export interface FormulaRecord { loc: Loc; display: boolean; env: string | null; src: string; tex: string; mathml: string; problems: string[] }

export interface ChapterIR {
  schema: 1;
  id: string;
  dir: string;
  lang: Lang;
  number: string;
  title: Inline[];
  titlePlain: string;
  converter: string;
  print: { aux: string; finished: string } | null;
  /** every HTML id of the page, in document order */
  ids: string[];
  counts: { vertiefung: number; fundament: number; figures: number; demos: number; formulas: number };
  demos: Array<{ id: string; still: string; kind: string; title: string }>;
  definitions: Array<{ id: string; number: string | null; name: Inline[]; children: Block[] }>;
  externalRefs: string[];
  children: Block[];
}
