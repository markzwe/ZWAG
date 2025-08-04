import * as React from 'react';

import { VisionBgRemoverViewProps } from './VisionBgRemover.types';

export default function VisionBgRemoverView(props: VisionBgRemoverViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
