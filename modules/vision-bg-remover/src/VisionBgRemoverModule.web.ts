import { registerWebModule, NativeModule } from 'expo';

import { ChangeEventPayload } from './VisionBgRemover.types';

type VisionBgRemoverModuleEvents = {
  onChange: (params: ChangeEventPayload) => void;
}

class VisionBgRemoverModule extends NativeModule<VisionBgRemoverModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
};

export default registerWebModule(VisionBgRemoverModule, 'VisionBgRemoverModule');
