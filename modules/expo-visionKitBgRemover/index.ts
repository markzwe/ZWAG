// Reexport the native module. On web, it will be resolved to BgRemoverModule.web.ts
// and on native platforms to BgRemoverModule.ts
export { default } from './src/BgRemoverModule';
export { default as BgRemoverView } from './src/BgRemoverView';
export * from  './src/BgRemover.types';
