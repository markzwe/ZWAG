import { View, Text } from 'react-native'
import React from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '@/components/Header';

export default function GenerateOutfits() {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <Header />
      <Text>generateOutfits</Text>
    </View>
  )
}
