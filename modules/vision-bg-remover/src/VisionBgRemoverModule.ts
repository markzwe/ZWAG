import { NativeModule, requireOptionalNativeModule } from 'expo';

import { VisionBgRemoverModuleEvents } from './VisionBgRemover.types';

declare class VisionBgRemoverModule extends NativeModule<VisionBgRemoverModuleEvents> {
  hello(): string;
  isVisionKitAvailable(): boolean;
}

// This call loads the native module object from the JSI.
export default requireOptionalNativeModule<VisionBgRemoverModule>('VisionBgRemover');
