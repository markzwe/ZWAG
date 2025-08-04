import { requireNativeView } from 'expo';
import * as React from 'react';

import { VisionBgRemoverViewProps } from './VisionBgRemover.types';

const NativeView: React.ComponentType<VisionBgRemoverViewProps> =
  requireNativeView('VisionBgRemover');

export default function VisionBgRemoverView(props: VisionBgRemoverViewProps) {
  return <NativeView {...props} />;
}
