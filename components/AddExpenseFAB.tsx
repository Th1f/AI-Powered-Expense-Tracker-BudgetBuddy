import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../constants/Theme';
import { router, useRouter } from 'expo-router';

interface AddExpenseFABProps {
  onPressManual: () => void;
  onPressVoice: () => void;
  onPressScan: () => void;
}

const AddExpenseFAB: React.FC<AddExpenseFABProps> = ({
  onPressManual,
  onPressVoice,
  onPressScan,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const animation = useState(new Animated.Value(0))[0];

  const toggleMenu = () => {
    const toValue = isOpen ? 0: 1;
    
    Animated.spring(animation, {
      toValue,
      friction: 7,
      tension: 40,
      useNativeDriver: true,
    }).start();
    
    setIsOpen(!isOpen);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  // This ensures action buttons are only shown when menu is opening
  // and completely hidden when menu is closed
  const opacityAnimation = animation.interpolate({
    inputRange: [0, 0.01, 0.1, 1],
    outputRange: [0, 0, 1, 1],
  });

  const manualStyle = {
    opacity: opacityAnimation,
    transform: [
      { scale: animation.interpolate({
          inputRange: [0, 0.01, 0.7, 1],
          outputRange: [0, 0.3, 0.8, 1],
        }) 
      },
      {
        translateX: animation.interpolate({
          inputRange: [0, 0.01, 0.2, 1],
          outputRange: [0, -50, -40, -120],
        }),
      },
      {
        translateY: animation.interpolate({
          inputRange: [0, 0.01, 0.2, 1],
          outputRange: [0, 0, -20, -70],
        }),
      },
    ],
  };

  const voiceStyle = {
    opacity: opacityAnimation,
    transform: [
      { scale: animation.interpolate({
          inputRange: [0, 0.01, 0.7, 1],
          outputRange: [0, 0.3, 0.8, 1],
        }) 
      },
      {
        translateX: animation.interpolate({
          inputRange: [0, 0.01, 0.2, 1],
          outputRange: [0, -50, -10, -30],
        }),
      },
      {
        translateY: animation.interpolate({
          inputRange: [0, 0.01, 0.2, 1],
          outputRange: [0, 0, -40, -120],
        }),
      },
    ],
  };

  const scanStyle = {
    opacity: opacityAnimation,
    transform: [
      { scale: animation.interpolate({
          inputRange: [0, 0.01, 0.7, 1],
          outputRange: [0, 0.3, 0.8, 1],
        }) 
      },
      {
        translateX: animation.interpolate({
          inputRange: [0, 0.01, 0.2, 1],
          outputRange: [0, -50, 20, 60],
        }),
      },
      {
        translateY: animation.interpolate({
          inputRange: [0, 0.01, 0.2, 1],
          outputRange: [0, 0, -20, -70],
        }),
      },
    ],
  };

  const backdropOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });

  const rotation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  const buttonStyle = {
    transform: [{ rotate: rotation }],
  };

  const handlePressAction = (action: () => void) => {
    toggleMenu();
    setTimeout(() => {
      action();
    }, 300);
  };

  return (
    <>
      {isOpen && (
        <Animated.View 
          style={[
            styles.backdrop, 
            { opacity: backdropOpacity }
          ]}
          pointerEvents={isOpen ? 'auto' : 'none'}
          onTouchEnd={toggleMenu}
        />
      )}
      
      <View style={styles.container} pointerEvents="box-none">
        {/* Secondary action buttons */}
        <Animated.View style={[styles.actionButton, { position: 'absolute', bottom: 8, left: 8 }, manualStyle]}>
          <TouchableOpacity
            style={[styles.actionButtonInner, { backgroundColor: Colors.secondary }]}
            onPress={() => handlePressAction(onPressManual)}
          >
            <Ionicons name="create" color="#fff" size={20} />
          </TouchableOpacity>
          <View style={styles.labelContainer}>
            <Text style={styles.actionLabel}>Manual</Text>
          </View>
        </Animated.View>
        
        <Animated.View style={[styles.actionButton, { position: 'absolute', bottom: 8, left: 8 }, voiceStyle]}>
          <TouchableOpacity
            style={[styles.actionButtonInner, { backgroundColor: Colors.accent }]}
            onPress={() => handlePressAction(onPressVoice)}
          >
            <Ionicons name="mic" color="#fff" size={20} />
          </TouchableOpacity>
          <View style={styles.labelContainer}>
            <Text style={styles.actionLabel}>Voice</Text>
          </View>
        </Animated.View>
        
        <Animated.View style={[styles.actionButton, { position: 'absolute', bottom: 8, left: 8 }, scanStyle]}>
          <TouchableOpacity
            style={[styles.actionButtonInner, { backgroundColor: Colors.primary }]}
            onPress={() => handlePressAction(onPressScan)}
          >
            <Ionicons name="scan" color="#fff" size={20} />
          </TouchableOpacity>
          <View style={styles.labelContainer}>
            <Text style={styles.actionLabel}>Scan</Text>
          </View>
        </Animated.View>
        
        {/* Main action button */}
        <Animated.View style={[styles.actionButton, styles.mainActionButton]}>
          <TouchableOpacity 
            style={styles.actionButtonInner}
            onPress={toggleMenu}
          >
            <Animated.View style={{ transform: [{ rotate: rotation }] }}>
              <Ionicons name="add" color="#fff" size={30} />
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
    zIndex: 1,
  },
  container: {
    position: 'absolute',
    bottom: 70,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  actionButton: {
    position: 'absolute',
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    zIndex: 3,
  },
  secondaryButton: {
    position: 'absolute',
    bottom: 0, 
    left: 0,
    right: 30, 
  },
  mainActionButton: {
    bottom: 0,
    width: 64,
    height: 64,
  },
  actionButtonInner: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  labelContainer: {
    position: 'absolute',
    top: 60, 
    backgroundColor: Colors.cardBackground,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    ...Shadow.small,
  },
  actionLabel: {
    color: Colors.textPrimary,
    fontSize: FontSize.s,
    fontWeight: '500',
  },
});

export default AddExpenseFAB;
