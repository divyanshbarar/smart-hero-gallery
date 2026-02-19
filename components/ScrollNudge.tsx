import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { IconSymbol } from './ui/icon-symbol';

interface ScrollNudgeProps {
    onPress: () => void;
}

export const ScrollNudge = ({ onPress }: ScrollNudgeProps) => {
    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <IconSymbol name="chevron.right" size={24} color="#000" />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        right: 20,
        top: '50%',
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
});
