// Powered by OnSpace.AI
// ASK VALENTINA — Full-Screen Photo Viewer with Pinch-to-Zoom & Swipe-to-Dismiss

import React, { useCallback, useRef } from 'react';
import { View, Modal, Pressable, StyleSheet, Dimensions, Text, Platform } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { theme } from '@/constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const DISMISS_THRESHOLD = 150;

interface PhotoViewerProps {
  visible: boolean;
  imageUri: string;
  label?: string;
  onClose: () => void;
}

export function PhotoViewer({ visible, imageUri, label, onClose }: PhotoViewerProps) {
  const insets = useSafeAreaInsets();

  // Transform values
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);
  const bgOpacity = useSharedValue(1);

  const resetValues = useCallback(() => {
    'worklet';
    scale.value = withTiming(1, { duration: 200 });
    savedScale.value = 1;
    translateX.value = withTiming(0, { duration: 200 });
    translateY.value = withTiming(0, { duration: 200 });
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
    bgOpacity.value = withTiming(1, { duration: 200 });
  }, []);

  const handleClose = useCallback(() => {
    onClose();
    // Reset after modal closes
    setTimeout(() => {
      scale.value = 1;
      savedScale.value = 1;
      translateX.value = 0;
      translateY.value = 0;
      savedTranslateX.value = 0;
      savedTranslateY.value = 0;
      bgOpacity.value = 1;
    }, 300);
  }, [onClose]);

  // Pinch-to-zoom gesture
  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = savedScale.value * e.scale;
    })
    .onEnd(() => {
      if (scale.value < 1) {
        scale.value = withSpring(1);
        savedScale.value = 1;
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      } else if (scale.value > 4) {
        scale.value = withSpring(4);
        savedScale.value = 4;
      } else {
        savedScale.value = scale.value;
      }
    });

  // Pan gesture for moving zoomed image or swiping to dismiss
  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (savedScale.value > 1) {
        // When zoomed, allow panning
        translateX.value = savedTranslateX.value + e.translationX;
        translateY.value = savedTranslateY.value + e.translationY;
      } else {
        // When not zoomed, allow vertical swipe-to-dismiss
        translateY.value = e.translationY;
        translateX.value = e.translationX * 0.3;
        const progress = Math.min(Math.abs(e.translationY) / DISMISS_THRESHOLD, 1);
        bgOpacity.value = 1 - progress * 0.6;
        scale.value = 1 - progress * 0.15;
      }
    })
    .onEnd((e) => {
      if (savedScale.value > 1) {
        savedTranslateX.value = translateX.value;
        savedTranslateY.value = translateY.value;
      } else {
        // Check if swipe is far enough to dismiss
        if (Math.abs(e.translationY) > DISMISS_THRESHOLD) {
          const direction = e.translationY > 0 ? 1 : -1;
          translateY.value = withTiming(direction * SCREEN_HEIGHT, { duration: 250 });
          bgOpacity.value = withTiming(0, { duration: 250 });
          runOnJS(handleClose)();
        } else {
          resetValues();
        }
      }
    });

  // Double-tap to zoom in/out
  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (savedScale.value > 1) {
        // Zoom out
        scale.value = withSpring(1);
        savedScale.value = 1;
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      } else {
        // Zoom in
        scale.value = withSpring(2.5);
        savedScale.value = 2.5;
      }
    });

  const composedGestures = Gesture.Simultaneous(
    pinchGesture,
    Gesture.Race(doubleTapGesture, panGesture)
  );

  const imageAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const bgAnimatedStyle = useAnimatedStyle(() => ({
    backgroundColor: `rgba(0, 0, 0, ${bgOpacity.value * 0.95})`,
  }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Animated.View style={[styles.overlay, bgAnimatedStyle]}>
          {/* Close button */}
          <Pressable
            onPress={handleClose}
            style={[styles.closeButton, { top: insets.top + 12 }]}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <View style={styles.closeButtonInner}>
              <MaterialIcons name="close" size={22} color="#FFF" />
            </View>
          </Pressable>

          {/* Label */}
          {label ? (
            <View style={[styles.labelContainer, { top: insets.top + 18 }]}>
              <Text style={styles.labelText}>{label}</Text>
            </View>
          ) : null}

          {/* Image */}
          <GestureDetector gesture={composedGestures}>
            <Animated.View style={[styles.imageContainer, imageAnimatedStyle]}>
              <Image
                source={{ uri: imageUri }}
                style={styles.fullImage}
                contentFit="contain"
                transition={200}
              />
            </Animated.View>
          </GestureDetector>

          {/* Hint */}
          <View style={[styles.hintContainer, { bottom: insets.bottom + 20 }]}>
            <Text style={styles.hintText}>Pinch to zoom · Double-tap to toggle · Swipe to dismiss</Text>
          </View>
        </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    zIndex: 10,
  },
  closeButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  labelContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  labelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    overflow: 'hidden',
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.75,
  },
  hintContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  hintText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '500',
  },
});
