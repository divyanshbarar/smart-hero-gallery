import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

interface ZoomableImageProps {
    uri: string;
}

export const ZoomableImage = ({ uri }: ZoomableImageProps) => {
    const { width, height } = useWindowDimensions();

    const scale = useSharedValue(1);
    const savedScale = useSharedValue(1);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const savedTranslateX = useSharedValue(0);
    const savedTranslateY = useSharedValue(0);

    const resetZoom = () => {
        'worklet';
        scale.value = withTiming(1);
        translateX.value = withTiming(0);
        translateY.value = withTiming(0);
        savedScale.value = 1;
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
    };

    const doubleTapGesture = Gesture.Tap()
        .numberOfTaps(2)
        .maxDuration(250)
        .onEnd(() => {
            if (scale.value > 1) {
                resetZoom();
            } else {
                scale.value = withTiming(2.5);
                savedScale.value = 2.5;
            }
        });

    const pinchGesture = Gesture.Pinch()
        .onUpdate((e) => {
            scale.value = Math.max(1, savedScale.value * e.scale);
        })
        .onEnd(() => {
            if (scale.value < 1) {
                resetZoom();
            } else {
                savedScale.value = scale.value;
            }
        });

    const panGesture = Gesture.Pan()
        .averageTouches(true)
        .onUpdate((e) => {
            if (scale.value > 1) {
                translateX.value = savedTranslateX.value + e.translationX;
                translateY.value = savedTranslateY.value + e.translationY;
            }
        })
        .onEnd(() => {
            savedTranslateX.value = translateX.value;
            savedTranslateY.value = translateY.value;
        });

    panGesture.requireExternalGestureToFail(doubleTapGesture);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
            { scale: scale.value },
        ],
    }));

    const composed = Gesture.Simultaneous(doubleTapGesture, pinchGesture, panGesture);

    return (
        <View style={styles.container}>
            <GestureDetector gesture={composed}>
                <Animated.Image
                    source={{ uri }}
                    style={[{ width, height }, animatedStyle]}
                    resizeMode="contain"
                />
            </GestureDetector>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
