import Header from '@/components/Header';
import { Button, Card, LoadingSpinner } from '@/components/ui';
import { OUTFIT_GENERATION, ROUTES } from '@/constants/app';
import { COLORS, SPACING } from '@/constants/theme';
import { LoadingState, OutfitGenerationContext } from '@/types';
import { ErrorHandler, Logger } from '@/utils/errorHandler';
import { Ionicons } from '@expo/vector-icons';

import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, Dimensions, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: screenWidth } = Dimensions.get('window');
const CARD_MARGIN = SPACING.md;
const CARD_WIDTH = (screenWidth - (SPACING.lg * 2) - CARD_MARGIN) / 2;

export default function GenerateOutfits() {
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [, setSelectedContext] = useState<OutfitGenerationContext | null>(null);

  const quickOptions = OUTFIT_GENERATION.QUICK_OPTIONS.map(option => ({
    ...option,
    color: getOptionColor(option.id),
    context: { 
      occasion: option.occasion, 
      weather: option.weather, 
      preferredItemsId: [] 
    },
  }));

  function getOptionColor(id: string) {
    const colorMap = {
      'smart-today': COLORS.accent,
      'work-ready': '#2563eb',
      'casual-comfort': '#059669',
      'date-night': '#dc2626',
    };
    return colorMap[id as keyof typeof colorMap] || COLORS.accent;
  }

  const handleQuickGenerate = useCallback(async (option: typeof quickOptions[0]) => {
    try {
      setLoadingState('loading');
      Logger.info('Quick outfit generation started', { option: option.id });

      const context: OutfitGenerationContext = {
        ...option.context,
        weather: option.context.weather === 'auto' 
          ? OUTFIT_GENERATION.DEFAULT_WEATHER_FALLBACK 
          : option.context.weather,
      };

      setSelectedContext(context);

      router.push({
        pathname: ROUTES.SCREENS.GENERATE_OUTFIT.AI_GENERATE,
        params: {
          selectedIds: context.preferredItemsId.join(","),
          occasion: context.occasion,
          weather: context.weather,
        },
      });
    } catch (error) {
      Logger.error('Quick generation failed', error, { option: option.id });
      const zwagError = ErrorHandler.handleAIGenerationError(error);
      Alert.alert('Generation Failed', zwagError.message);
      setLoadingState('error');
    }
  }, []);

  const handleCustomAIGenerate = () => {
    router.push(ROUTES.SCREENS.GENERATE_OUTFIT.CHAT);
  };

  if (loadingState === 'loading') {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner 
          size="large"
          message="Creating your perfect outfit..."
          fullScreen
        />
        <Text style={styles.loadingSubtext}>
          Analyzing your wardrobe and preferences
        </Text>
      </SafeAreaView>
    );
  }

  const renderQuickOption = ({ item, index }: { item: typeof quickOptions[0], index: number }) => (
    <Card 
      variant="elevated" 
      style={{
        ...styles.optionCard,
        marginRight: index % 2 === 0 ? CARD_MARGIN : 0
      }}
    >
      <Button
        title=""
        onPress={() => handleQuickGenerate(item)}
        variant="ghost"
        style={styles.optionButton}
      />
      <View style={styles.optionContent}>
        <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
          <Ionicons 
            name={item.icon as any} 
            size={24} 
            color="white"
          />
        </View>
        <Text style={styles.optionTitle} numberOfLines={1}>{item.title}</Text>
      </View>
    </Card>
  );

  const renderFooter = () => (
    <View style={styles.customSection}>
      <Text style={styles.sectionTitle}>Talk It Through</Text>
      <Card variant="outlined" style={styles.customCard}>
        <View style={styles.customContent}>
          <Ionicons name="chatbubbles-outline" size={32} color={COLORS.textSecondary} />
          <Text style={styles.customTitle}>Your AI Stylist</Text>
          <Text style={styles.customSubtitle}>
            Ask for outfit ideas, refine a look, or plan what to wear.
          </Text>
          <Button
            title="Chat with ZWAG"
            onPress={handleCustomAIGenerate}
            variant="outline"
            size="sm"
            style={styles.customButton}
          />
        </View>
      </Card>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <FlatList
        data={quickOptions}
        renderItem={renderQuickOption}
        keyExtractor={(item) => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.flatListContent}
        ListFooterComponent={renderFooter}
        ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryBackground,
  },
  flatListContent: {
    padding: SPACING.md,
  },
  headerContainer: {
    marginBottom: SPACING.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  itemSeparator: {
    height: SPACING.md,
  },
  optionCard: {
    position: 'relative',
    minHeight: 120,
    width: CARD_WIDTH,
  },
  optionButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  optionContent: {
    alignItems: 'center',
    padding: SPACING.xs,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  optionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  optionSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  customSection: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  customCard: {
    padding: SPACING.lg,
  },
  customContent: {
    alignItems: 'center',
  },
  customTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  customSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.md,
    lineHeight: 18,
  },
  customButton: {
    minWidth: 160,
  },
  loadingSubtext: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
});
