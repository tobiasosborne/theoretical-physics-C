// Where things are. The lecture site reads the lecture sources in latex/lectures/, the
// vendored design tokens and notation names in web/vendor/, and writes build/site/.
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export type Lang = 'de' | 'en';
export const LANGS: Lang[] = ['de', 'en'];

export const WEB = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const ROOT = path.resolve(WEB, '..');
export const LATEX = path.join(ROOT, 'latex');
export const VENDOR = path.join(WEB, 'vendor');
/** generated inputs of the bundles (alias @gen) */
export const GEN = path.join(ROOT, 'build/web/gen');
