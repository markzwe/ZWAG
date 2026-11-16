import * as React from 'react';

import { VisionBgRemoverViewProps } from './VisionBgRemover.types';

export default function VisionBgRemoverView(props: VisionBgRemoverViewProps) {
  const { imageUri, onProcessingError } = props;
  React.useEffect(() => {
    onProcessingError?.({ nativeEvent: {
      error: 'Automatic background removal is available in the iOS app. You can continue with your original photo.',
    } });
  }, [imageUri, onProcessingError]);
  return null;
}
