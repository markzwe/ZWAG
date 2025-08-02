// import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native'
// import React, { useState } from 'react'
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import Header from '@/components/Header';
// import { Ionicons } from '@expo/vector-icons';

// export default function SavedSettings() {
//   const insets = useSafeAreaInsets();
//   const [selectedOccasion, setSelectedOccasion] = useState('');
//   const [selectedWeather, setSelectedWeather] = useState('');

//   const occasions = [
//     { id: 'work', label: 'Work', icon: 'briefcase-outline' },
//     { id: 'casual', label: 'Casual', icon: 'person-outline' },
//     { id: 'date', label: 'Date', icon: 'heart-outline' },
//     { id: 'gym', label: 'Gym', icon: 'barbell-outline' },
//   ];

//   const weather = [
//     { id: 'hot', label: 'Hot', temp: '80°F+', icon: 'sunny' },
//     { id: 'warm', label: 'Warm', temp: '70-80°F', icon: 'partly-sunny' },
//     { id: 'cool', label: 'Cool', temp: '60-70°F', icon: 'cloudy' },
//     { id: 'cold', label: 'Cold', temp: '50-60°F', icon: 'snow' },
//   ];

//   const canGenerate = selectedOccasion && selectedWeather;

//   const handleGenerate = () => {
//     if (canGenerate) {
//       // Navigate to outfit result or trigger generation
//       console.log('Generating outfit for:', selectedOccasion, selectedWeather);
//     }
//   };

//   return (
//     <ScrollView style={[styles.container, { paddingTop: insets.top }]}>      
//       <View style={styles.content}>
        
//         {/* Step 1: Occasion */}
//         <View style={styles.section}>
//           <Text style={styles.stepNumber}>1</Text>
//           <Text style={styles.question}>What's the occasion?</Text>
//           <View style={styles.optionsRow}>
//             {occasions.map((occasion) => (
//               <TouchableOpacity
//                 key={occasion.id}
//                 style={[
//                   styles.optionButton,
//                   selectedOccasion === occasion.id && styles.selectedButton
//                 ]}
//                 onPress={() => setSelectedOccasion(occasion.id)}
//               >
//                 <Ionicons 
//                   name={occasion.icon} 
//                   size={24} 
//                   color={selectedOccasion === occasion.id ? '#fff' : '#000'} 
//                 />
//                 <Text style={[
//                   styles.optionText,
//                   selectedOccasion === occasion.id && styles.selectedText
//                 ]}>
//                   {occasion.label}
//                 </Text>
//               </TouchableOpacity>
//             ))}
//           </View>
//         </View>

//         {/* Step 2: Weather */}
//         <View style={styles.section}>
//           <Text style={styles.stepNumber}>2</Text>
//           <Text style={styles.question}>How's the weather?</Text>
//           <View style={styles.optionsRow}>
//             {weather.map((w) => (
//               <TouchableOpacity
//                 key={w.id}
//                 style={[
//                   styles.optionButton,
//                   selectedWeather === w.id && styles.selectedButton
//                 ]}
//                 onPress={() => setSelectedWeather(w.id)}
//               >
//                 <Ionicons 
//                   name={w.icon} 
//                   size={24} 
//                   color={selectedWeather === w.id ? '#fff' : '#000'} 
//                 />
//                 <Text style={[
//                   styles.optionText,
//                   selectedWeather === w.id && styles.selectedText
//                 ]}>
//                   {w.label}
//                 </Text>
//                 <Text style={[
//                   styles.tempText,
//                   selectedWeather === w.id && styles.selectedText
//                 ]}>
//                   {w.temp}
//                 </Text>
//               </TouchableOpacity>
//             ))}
//           </View>
//         </View>

//         {/* Quick Generate Button */}
//         <TouchableOpacity 
//           style={styles.quickGenerate}
//           onPress={handleGenerate}
//         >
//           <Ionicons name="flash" size={20} color="#666" />
//           <Text style={styles.quickText}>Skip questions - Surprise me!</Text>
//         </TouchableOpacity>

//       </View>

//       {/* Generate Button */}
//       <View style={styles.bottomContainer}>
//         <TouchableOpacity 
//           style={[
//             styles.generateButton,
//             !canGenerate && styles.disabledButton
//           ]}
//           onPress={handleGenerate}
//           disabled={!canGenerate}
//         >
//           <Ionicons 
//             name="sparkles" 
//             size={24} 
//             color={canGenerate ? 'white' : '#ccc'} 
//           />
//           <Text style={[
//             styles.generateText,
//             !canGenerate && styles.disabledText
//           ]}>
//             Generate My Outfit
//           </Text>
//         </TouchableOpacity>
//       </View>
//     </ScrollView>
//   )
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f5f5f5',
//   },
//   content: {
//     flex: 1,
//     paddingHorizontal: 20,
//     paddingTop: 20,
//   },
//   section: {
//     marginBottom: 40,
//   },
//   stepNumber: {
//     fontSize: 14,
//     fontWeight: '700',
//     color: '#000',
//     backgroundColor: '#fff',
//     width: 24,
//     height: 24,
//     borderRadius: 12,
//     textAlign: 'center',
//     lineHeight: 24,
//     marginBottom: 8,
//   },
//   question: {
//     fontSize: 24,
//     fontWeight: '700',
//     color: '#000',
//     marginBottom: 20,
//   },
//   optionsRow: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 12,
//   },
//   optionButton: {
//     width: '48%',
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     paddingVertical: 20,
//     paddingHorizontal: 16,
//     borderRadius: 15,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//     borderWidth: 2,
//     borderColor: 'transparent',
//   },
//   selectedButton: {
//     backgroundColor: '#000',
//     borderColor: '#000',
//   },
//   optionText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#000',
//     marginTop: 8,
//   },
//   selectedText: {
//     color: '#fff',
//   },
//   tempText: {
//     fontSize: 12,
//     color: '#666',
//     marginTop: 2,
//   },
//   quickGenerate: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#fff',
//     paddingVertical: 16,
//     borderRadius: 12,
//     gap: 8,
//     marginTop: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 2,
//   },
//   quickText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#666',
//   },
//   bottomContainer: {
//     padding: 20,
//     backgroundColor: '#f5f5f5',
//     borderTopWidth: 1,
//     borderTopColor: '#e0e0e0',
//   },
//   generateButton: {
//     backgroundColor: '#000',
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 18,
//     borderRadius: 25,
//     gap: 12,
//   },
//   disabledButton: {
//     backgroundColor: '#f0f0f0',
//   },
//   generateText: {
//     color: 'white',
//     fontSize: 18,
//     fontWeight: '700',
//   },
//   disabledText: {
//     color: '#ccc',
//   },
// });