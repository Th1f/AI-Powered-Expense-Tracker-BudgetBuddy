import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, BorderRadius, Shadow } from '../constants/Theme';

// Define the tab items with their icons
const TAB_ITEMS = [
  {
    name: 'index',
    label: 'Home',
    icon: 'home',
  },
  {
    name: 'transactions',
    label: 'Transactions',
    icon: 'list',
  },
  {
    name: 'budgets',
    label: 'Budgets',
    icon: 'pie-chart',
  },
  {
    name: 'analytics',
    label: 'Analytics',
    icon: 'bar-chart',
  },
];

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const animation = useState(new Animated.Value(0))[0];

  const toggleMenu = () => {
    const toValue = isOpen ? 0 : 1;
    
    Animated.spring(animation, {
      toValue,
      friction: 7,
      tension: 40,
      useNativeDriver: true,
    }).start();
    
    setIsOpen(!isOpen);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  // Handles the action when a specific entry method is selected
  const handleAction = (route: string) => {
    // Close the menu first
    toggleMenu();
    // Navigate after a small delay to allow animation to start
    setTimeout(() => {
      router.push(route as any);
    }, 300);
  };

  // Rotation animation for the plus icon
  const rotation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  // Scale animation for the button
  const scale = animation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.1, 1.1],
  });

  // Background color animation
  const backgroundColor = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.primary, Colors.accent],
  });

  // Animation for the backdrop opacity
  const backdropOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });

  // Animation for secondary buttons
  const manualButtonAnimation = {
    opacity: animation,
    transform: [
      { scale: animation.interpolate({
          inputRange: [0, 0.7, 1],
          outputRange: [0, 0.8, 1],
        }) 
      },
      {
        translateY: animation.interpolate({
          inputRange: [0, 0.7, 1],
          outputRange: [0, -80, -140],
        }),
      },
    ],
  };

  const voiceButtonAnimation = {
    opacity: animation,
    transform: [
      { scale: animation.interpolate({
          inputRange: [0, 0.7, 1],
          outputRange: [0, 0.8, 1],
        }) 
      },
      {
        translateY: animation.interpolate({
          inputRange: [0, 0.7, 1],
          outputRange: [0, -60, -100],
        }),
      },
      {
        translateX: animation.interpolate({
          inputRange: [0, 0.7, 1],
          outputRange: [0, -40, -100],
        }),
      },
    ],
  };

  const scanButtonAnimation = {
    opacity: animation,
    transform: [
      { scale: animation.interpolate({
          inputRange: [0, 0.7, 1],
          outputRange: [0, 0.8, 1],
        }) 
      },
      {
        translateY: animation.interpolate({
          inputRange: [0, 0.7, 1],
          outputRange: [0, -60, -100],
        }),
      },
      {
        translateX: animation.interpolate({
          inputRange: [0, 0.7, 1],
          outputRange: [0, 40, 100],
        }),
      },
    ],
  };

  return (
    <View style={styles.containerWrapper}>
      {/* Backdrop for when menu is open */}
      {isOpen && (
        <Animated.View 
          pointerEvents={isOpen ? 'auto' : 'none'}
          onTouchEnd={toggleMenu}
        />
      )}
      
      <View style={styles.container}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.title || route.name;
          const isFocused = state.index === index;

          // Find the matching tab item for this route
          const tabItem = TAB_ITEMS.find(item => item.name === route.name) || TAB_ITEMS[0];

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          // Split tabs into two groups (left and right of the plus button)
          const isLeftTab = index < 2;
          const isRightTab = index >= 2;

          if (isLeftTab || isRightTab) {
            return (
              <TouchableOpacity
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                onPress={onPress}
                style={styles.tabButton}
              >
                <View style={[styles.iconContainer, isFocused && styles.activeIconContainer]}>
                  <Ionicons 
                    name={tabItem.icon as any} 
                    size={24} 
                    color={isFocused ? Colors.primary : Colors.textSecondary} 
                  />
                </View>
                <Text style={[
                  styles.label, 
                  isFocused ? styles.activeLabel : styles.inactiveLabel
                ]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          }
          return null;
        })}
      </View>
      
      {/* Main add button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => handleAction('/add/manual')}
        activeOpacity={0.9}
      >
        <Animated.View 
          style={[
            styles.addButtonInner, 
            { 
            }
          ]}
        >
          <Ionicons name="add" size={32} color="#FFFFFF" />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  containerWrapper: {
    position: 'relative',
  },
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBackground,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    height: 60 + (Platform.OS === 'ios' ? 20 : 0),
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 8,
  },
  iconContainer: {
    padding: Spacing.xs,
    borderRadius: BorderRadius.s,
  },
  activeIconContainer: {
    backgroundColor: `${Colors.primary}15`,
  },
  label: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  activeLabel: {
    color: Colors.primary,
  },
  inactiveLabel: {
    color: Colors.textSecondary,
  },
  addButton: {
    position: 'absolute',
    top: -22,
    left: Dimensions.get('window').width / 2 - 28,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  addButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadow.medium,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
    zIndex: 5,
  },
  actionButton: {
    position: 'absolute',
    width: 48,
    height: 48,
    top: -22,
    left: Dimensions.get('window').width / 2 - 24,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  actionButtonInner: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadow.medium,
  },
  labelContainer: {
    position: 'absolute',
    top: 55,
    backgroundColor: Colors.cardBackground,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    width: 70,
    ...Shadow.small,
  },
  leftLabelContainer: {
    right: -5,
    width: 60,
  },
  rightLabelContainer: {
    left: -5,
    width: 60,
  },
  actionLabel: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
});
