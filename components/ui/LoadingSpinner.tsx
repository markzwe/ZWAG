import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '@/constants/theme';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  message?: string;
  fullScreen?: boolean;
}

export default function LoadingSpinner({
  size = 'large',
  color = COLORS.textPrimary,
  message,
  fullScreen = false,
}: LoadingSpinnerProps) {
  const containerStyle = fullScreen ? styles.fullScreen : styles.inline;

  return (
    <View style={containerStyle}>
      <ActivityIndicator size={size} color={color} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primaryBackground,
  },
  inline: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  message: {
    marginTop: SPACING.sm,
    color: COLORS.textSecondary,
    fontSize: 16,
    textAlign: 'center',
  },
});
