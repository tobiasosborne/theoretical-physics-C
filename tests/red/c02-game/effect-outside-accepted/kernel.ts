// RED FIXTURE: the kernel with a membership test that accepts every "effect".
export * from '../../../../web/src/kernels/gpt';
export function isEffect(): boolean { return true; }
