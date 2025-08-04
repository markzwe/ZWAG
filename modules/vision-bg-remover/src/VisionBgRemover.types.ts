import type { StyleProp, ViewStyle } from 'react-native';

export type ProcessingCompleteEventPayload = {
  processedImageUri: string;
};

export type ProcessingErrorEventPayload = {
  error: string;
};

export type VisionBgRemoverModuleEvents = {
  onProcessingComplete: (params: ProcessingCompleteEventPayload) => void;
  onProcessingError: (params: ProcessingErrorEventPayload) => void;
};

export type VisionBgRemoverViewProps = {
  imageUri: string;
  onProcessingComplete?: (event: { nativeEvent: ProcessingCompleteEventPayload }) => void;
  onProcessingError?: (event: { nativeEvent: ProcessingErrorEventPayload }) => void;
  style?: StyleProp<ViewStyle>;
};
