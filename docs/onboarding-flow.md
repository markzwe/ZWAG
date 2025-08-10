# ZWAG Onboarding Flow Documentation

## Overview

A streamlined 5-screen onboarding flow designed to get users to their first AI-generated outfit in under 3 minutes, focusing on practical preferences over abstract fashion concepts.

## Flow Architecture

### Screen 1: Value Proposition (`welcome.tsx`)

**Purpose**: Hook users with clear time-saving benefits
**Key Messages**:

- "Never waste time choosing outfits again"
- "AI-powered styling in under 30 seconds"
- "Built for busy guys who want to look sharp"
- "Get your first outfit in under 3 minutes"

**Actions**:

- Primary: "Start Your Style Journey" → styleAssessment
- Secondary: "I already have an account" → sign-in
- Tertiary: "Skip for now" → main app

### Screen 2: Style Assessment (`styleAssessment.tsx`)

**Purpose**: 2-question style preference capture
**Progress**: 2 of 5

**Question 1**: "What's your default style?"

- Business professional 💼
- Business casual 👔
- Casual/weekend 👕
- Creative/trendy 🎨

**Question 2**: "What's your biggest clothing challenge?"

- Don't know what matches 🤔
- Always running late in mornings ⏰
- Want to look more professional 📈
- Tired of wearing the same thing 🔄

**Data Stored**: `defaultStyle`, `clothingChallenge`

### Screen 3: Wardrobe Setup Method (`wardrobeSetup.tsx`)

**Purpose**: Choose setup approach without overwhelming users
**Progress**: 3 of 5

**Options**:

1. **Quick Start** ⚡ (Recommended)
   - Use sample wardrobe, add items later
   - Start now
2. **Essential Builder** 🎯
   - Add 5-10 core pieces now
   - 5-10 minutes
3. **Full Setup** 📱
   - Catalog entire wardrobe (discouraged)
   - 30+ minutes

**Data Stored**: `setupMethod`

### Screen 4: Practical Preferences (`practicalPreferences.tsx`)

**Purpose**: Lifestyle-based recommendations
**Progress**: 4 of 5

**Question 1**: "How formal is your typical workday?"

- Suit required 🤵
- Business casual 👔
- Smart casual 👕
- Casual/no dress code 👯

**Question 2**: "What weather do you deal with most?"

- Hot/sunny ☀️
- Cold/rainy 🌧️
- Seasonal changes 🍂
- Mild year-round 🌤️

**Data Stored**: `formalityLevel`, `weatherType`

### Screen 5: Frequency Settings (`frequencySettings.tsx`)

**Purpose**: Set expectation for ongoing engagement
**Progress**: 5 of 5

**Question**: "How often do you want outfit suggestions?"

- Daily 🌅 (Most Popular)
- Weekdays only 💼
- When I ask 🎯
- Special occasions only ✨

**Completion**: "You're all set! 🎉"
**Final Action**: "Get My First Outfit" → main app

**Data Stored**: `suggestionFrequency`

## Technical Implementation

### Context Management (`OnboardingContext.tsx`)

Centralized state management for onboarding data:

```typescript
interface OnboardingData {
  defaultStyle?:
    | "business-professional"
    | "business-casual"
    | "casual-weekend"
    | "creative-trendy";
  clothingChallenge?:
    | "matching"
    | "time-pressure"
    | "professional-look"
    | "variety";
  setupMethod?: "quick-start" | "essential-builder" | "full-setup";
  formalityLevel?:
    | "suit-required"
    | "business-casual"
    | "smart-casual"
    | "casual-no-dress-code";
  weatherType?:
    | "hot-sunny"
    | "cold-rainy"
    | "seasonal-changes"
    | "mild-year-round";
  suggestionFrequency?:
    | "daily"
    | "weekdays-only"
    | "when-asked"
    | "special-occasions";
}
```

### Smart Defaults Helper

`getSmartDefaults()` function converts onboarding preferences into AI prompt parameters:

- Formality level influences dress code recommendations
- Weather type affects fabric and layering suggestions
- Style direction guides overall aesthetic
- Setup method determines initial wardrobe approach

### Navigation Flow

```
welcome → styleAssessment → wardrobeSetup → practicalPreferences → frequencySettings → /(tabs)
```

All screens include:

- Progress indicator (visual completion bar)
- Skip options for user flexibility
- Consistent visual design with gradients
- Disabled state handling for incomplete forms

## Design Principles Implemented

### ✅ Under 2 Minutes

- Maximum 5 screens
- 2 questions per screen maximum
- Skip options on everything

### ✅ Problem-Focused, Not Fashion-Focused

- Emphasizes time-saving and convenience
- Avoids abstract fashion terminology
- Frames around practical outcomes

### ✅ Deferred Complex Setup

- Quick Start option is recommended
- Full wardrobe input is optional
- "Build as you go" approach

### ✅ Smart Defaults

- Assumes business casual if unsure
- Defaults to practical over trendy
- Conservative occasion defaults
- Weather integration enabled

### ✅ Questions Avoided

- No color preferences (too subjective)
- No brand preferences (irrelevant for AI)
- No body type questions (sensitive)
- No budget questions (premature)
- No style inspiration (too abstract)

## Integration Points

### With AI Generation System

Onboarding data should be passed to GPT prompt engineering:

- Use `formalityLevel` for dress code context
- Apply `weatherType` for seasonal appropriateness
- Reference `clothingChallenge` for targeted solutions
- Respect `defaultStyle` for aesthetic direction

### With Notification System

- Use `suggestionFrequency` for push notification scheduling
- Daily users get morning outfit alerts
- "When asked" users get no automated notifications

### With Wardrobe Management

- `setupMethod: 'quick-start'` → populate with sample items
- `setupMethod: 'essential-builder'` → guide user to add 5-10 items
- `setupMethod: 'full-setup'` → provide comprehensive upload flow

## Success Metrics

- Time to first outfit generation < 3 minutes
- Completion rate > 80%
- Skip rate < 30% per screen
- User satisfaction with first AI-generated outfit
- Retention at day 3 post-onboarding

## Future Enhancements

- A/B testing different value propositions
- Personalized quick start based on style assessment
- Weather API integration for real-time suggestions
- Machine learning on onboarding choices vs. actual usage patterns
