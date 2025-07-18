import { View, Text, Alert, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/theme';
import { useAuth } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Header from '@/components/Header';

export default function Closet() {
  // Get the safe area insets for padding
  const insets = useSafeAreaInsets();
  const { signOut, isSignedIn } = useAuth();

  return (
    <View style={[{ paddingTop: insets.top }, styles.container]}>
      <Header />
      <Text>index</Text>
      
      <TouchableOpacity style = {styles.createButton} onPress = {() => router.push("/screens/addItem")}>
        <Ionicons name="add" size={35} color={COLORS.pureWhite} />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryBackground,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    color: COLORS.textPrimary,
  },
  createButton: {
    backgroundColor: COLORS.black,
    width: 35,
    height: 100,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    position: 'absolute',
    bottom: 90,
    right: 10,
  }
})
