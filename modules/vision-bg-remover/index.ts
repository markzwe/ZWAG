// Reexport the native module. On web, it will be resolved to VisionBgRemoverModule.web.ts
// and on native platforms to VisionBgRemoverModule.ts
export { default } from './src/VisionBgRemoverModule';
export { default as VisionBgRemoverView } from './src/VisionBgRemoverView';
export * from  './src/VisionBgRemover.types';
