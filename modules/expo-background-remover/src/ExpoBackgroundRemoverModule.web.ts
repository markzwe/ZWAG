import { registerWebModule, NativeModule } from 'expo';

import { ChangeEventPayload } from './ExpoBackgroundRemover.types';

type ExpoBackgroundRemoverModuleEvents = {
  onChange: (params: ChangeEventPayload) => void;
}

class ExpoBackgroundRemoverModule extends NativeModule<ExpoBackgroundRemoverModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
};

export default registerWebModule(ExpoBackgroundRemoverModule, 'ExpoBackgroundRemoverModule');
