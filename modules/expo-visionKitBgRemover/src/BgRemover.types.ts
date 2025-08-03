import type { ViewProps } from 'react-native';

export type ProcessingCompleteEvent = {
  processedImageUri: string;
};

export type BgRemoverViewProps = {
  imageUri: string;
  onProcessingComplete?: (event: ProcessingCompleteEvent) => void;
} & ViewProps;
