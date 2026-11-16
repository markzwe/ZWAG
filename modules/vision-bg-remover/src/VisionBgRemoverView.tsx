import { requireNativeView } from 'expo';
import * as React from 'react';

import { VisionBgRemoverViewProps } from './VisionBgRemover.types';
import VisionBgRemoverModule from './VisionBgRemoverModule';

const NativeView: React.ComponentType<VisionBgRemoverViewProps> | null =
  VisionBgRemoverModule ? requireNativeView('VisionBgRemover') : null;

export default function VisionBgRemoverView(props: VisionBgRemoverViewProps) {
  const { imageUri, onProcessingError } = props;
  React.useEffect(() => {
    if (!NativeView) {
      onProcessingError?.({ nativeEvent: {
        error: 'Background removal is missing from this app build. Rebuild the iOS app, then try again.',
      } });
    }
  }, [imageUri, onProcessingError]);
  if (!NativeView) return null;
  return <NativeView {...props} />;
}
