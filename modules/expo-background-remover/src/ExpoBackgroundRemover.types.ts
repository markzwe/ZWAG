import type { StyleProp, ViewStyle } from 'react-native';

// ✅ Match your Swift onLoad event
export type OnLoadEventPayload = {
  status: string;
  imageSize?: {
    width: number;
    height: number;
  };
};

// ✅ Match your Swift onProcessingComplete event
export type OnProcessingCompleteEventPayload = {
  success: boolean;
  hasProcessedImage: boolean;
  method?: 'visionkit_subject_lifting' | 'white_background_fallback';
  interactionPoint?: {
    x: number;
    y: number;
  };
};

// ✅ Match your Swift onSubjectLifted event
export type OnSubjectLiftedEventPayload = {
  success: boolean;
  point: {
    x: number;
    y: number;
  };
  timestamp: number;
};

// ✅ Function-based API types
export type RemoveBackgroundResult = {
  success: boolean;
  processedImageUri?: string;
  hasSubjects: boolean;
};

// ✅ Complete view props with all event handlers
export type ExpoBackgroundRemoverViewProps = {
  imageUri: string;
  style?: StyleProp<ViewStyle>;
  
  // Event handlers (all optional)
  onLoad?: (event: { nativeEvent: OnLoadEventPayload }) => void;
  onProcessingComplete?: (event: { nativeEvent: OnProcessingCompleteEventPayload }) => void;
  onSubjectLifted?: (event: { nativeEvent: OnSubjectLiftedEventPayload }) => void;
};

// ✅ Module events (keep for backward compatibility)
export type ExpoBackgroundRemoverModuleEvents = {
  onChange: (params: ChangeEventPayload) => void;
};

export type ChangeEventPayload = {
  value: string;
};

// ✅ Error types for better error handling
export type VisionKitError = {
  code: 'UNSUPPORTED_VERSION' | 'INVALID_IMAGE' | 'NO_SUBJECTS' | 'PROCESSING_ERROR';
  message: string;
};