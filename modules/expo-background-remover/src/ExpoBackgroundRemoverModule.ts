import { NativeModule, requireNativeModule } from 'expo';

import { ExpoBackgroundRemoverModuleEvents, RemoveBackgroundResult } from './ExpoBackgroundRemover.types';

declare class ExpoBackgroundRemoverModule extends NativeModule<ExpoBackgroundRemoverModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
  removeBackground(imageUri: string): Promise<RemoveBackgroundResult>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<ExpoBackgroundRemoverModule>('ExpoBackgroundRemover');
