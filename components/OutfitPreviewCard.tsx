import { View, Text } from 'react-native'
import React from 'react'
import { Id } from '@/convex/_generated/dataModel'
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Canvas, useCanvasRef } from '@shopify/react-native-skia';

type OutfitPreviewCardProps = {
    top: Id<"items">;
    bottom: Id<"items">;
    shoes?: Id<"items">;
    outerwear?: Id<"items">;
    accessories?: Id<"items">[];
    fullBody?: Id<"items">;
}

export default function OutfitPreviewCard(OutfitPreviewCardProps: OutfitPreviewCardProps) {

  return (
    <View>
      <Text>OutfitPreviewCard</Text>
      <Canvas
        style={{ width: 350, height: 500 }}
        ref={useCanvasRef()}
      >

        
      </Canvas>
    </View>
  )
}