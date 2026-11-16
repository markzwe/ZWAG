import { registerWebModule, NativeModule } from 'expo';

import { VisionBgRemoverModuleEvents } from './VisionBgRemover.types';

class VisionBgRemoverModule extends NativeModule<VisionBgRemoverModuleEvents> {
  isVisionKitAvailable() {
    return false;
  }
  hello() {
    return 'Hello world! 👋';
  }
};

export default registerWebModule(VisionBgRemoverModule, 'VisionBgRemoverModule');
