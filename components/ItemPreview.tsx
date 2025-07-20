import { View, Text } from 'react-native'
import React from 'react'

type ItemsPreviewProps = {
  imageUri: string;
  itemCaption: string;
  categtory: string;
  subcategory: string;
}

export default function ItemsPreview() {
  return (
    <View>
      <Text>itemsPreview</Text>
    </View>
  )
}