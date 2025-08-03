import { NativeModule, requireNativeModule } from 'expo';

import { BgRemoverModuleEvents } from './BgRemover.types';

declare class BgRemoverModule extends NativeModule<BgRemoverModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<BgRemoverModule>('BgRemover');
