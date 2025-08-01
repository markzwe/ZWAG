import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native'
import React, { useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '@/components/Header';
import { Ionicons } from '@expo/vector-icons';
import { Redirect } from 'expo-router';

export default function GenerateOutfits() {
  const insets = useSafeAreaInsets();
  const [selectedOccasion, setSelectedOccasion] = useState('');
  const [selectedWeather, setSelectedWeather] = useState('');

  const occasions = [
    { id: 'work', label: 'Work', icon: 'briefcase-outline' },
    { id: 'casual', label: 'Casual', icon: 'person-outline' },
    { id: 'date', label: 'Date', icon: 'heart-outline' },
    { id: 'gym', label: 'Gym', icon: 'barbell-outline' },
  ];

  const weather = [
    { id: 'hot', label: 'Hot', temp: '80°F+', icon: 'sunny' },
    { id: 'warm', label: 'Warm', temp: '70-80°F', icon: 'partly-sunny' },
    { id: 'cool', label: 'Cool', temp: '60-70°F', icon: 'cloudy' },
    { id: 'cold', label: 'Cold', temp: '50-60°F', icon: 'snow' },
  ];

  const canGenerate = selectedOccasion && selectedWeather;

  const handleGenerate = () => {
    if (canGenerate) {
      // Navigate to outfit result or trigger generation
      console.log('Generating outfit for:', selectedOccasion, selectedWeather);
    }
  };

  return (
    <View>
      <Redirect
       href='/screens/generateOutfit/askOccasion'
        />
    </View>
  )
}
