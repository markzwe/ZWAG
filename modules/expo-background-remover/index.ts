import { NativeModulesProxy, EventEmitter } from 'expo-modules-core';
import { requireNativeViewManager } from 'expo-modules-core';

// Import the native module. On web, it will be resolved to ExpoBackgroundRemover.web.ts
// and on native platforms to ExpoBackgroundRemover.ts
import ExpoBackgroundRemoverModule from './src/ExpoBackgroundRemoverModule';
import ExpoBackgroundRemoverView from './src/ExpoBackgroundRemoverView';

// Export types
export * from './src/ExpoBackgroundRemover.types';

// Export view component
export { ExpoBackgroundRemoverView };

// Export function-based API
export async function removeBackground(imageUri: string): Promise<any> {
  return await ExpoBackgroundRemoverModule.removeBackground(imageUri);
}

// Export hello function (for testing)
export function hello(): string {
  return ExpoBackgroundRemoverModule.hello();
}

// Export async function for testing
export async function setValueAsync(value: string): Promise<void> {
  return await ExpoBackgroundRemoverModule.setValueAsync(value);
}

export default ExpoBackgroundRemoverModule;