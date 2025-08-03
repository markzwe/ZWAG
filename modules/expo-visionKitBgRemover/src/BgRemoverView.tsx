import { requireNativeView } from 'expo';
import * as React from 'react';

import { BgRemoverViewProps } from './BgRemover.types';

const NativeView: React.ComponentType<BgRemoverViewProps> =
  requireNativeView('BgRemover');

export default function BgRemoverView(props: BgRemoverViewProps) {
  return <NativeView {...props} />;
}
