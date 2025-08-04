import { NativeModule, requireNativeModule } from 'expo';

import { VisionBgRemoverModuleEvents } from './VisionBgRemover.types';

declare class VisionBgRemoverModule extends NativeModule<VisionBgRemoverModuleEvents> {
  hello(): string;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<VisionBgRemoverModule>('VisionBgRemover');
