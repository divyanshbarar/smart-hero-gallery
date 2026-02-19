import React, { memo } from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { GalleryItem } from '../constants/gallery';
import { MediaTile } from './MediaTile';

interface GalleryTileProps {
    item: GalleryItem;
    onPress: (itemId: string) => void;
    isVisible: boolean;
    style?: ViewStyle;
}

export const GalleryTile = memo(({ item, onPress, isVisible, style }: GalleryTileProps) => {
    const handlePress = () => onPress(item._id);

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={item.type === 'image' ? handlePress : undefined}
            style={[styles.container, style]}
        >
            <MediaTile
                item={item}
                isVisible={isVisible}
                onPress={item.type === 'video' ? handlePress : undefined}
            />
        </TouchableOpacity>
    );
});

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
        borderRadius: 8,
        backgroundColor: '#333',
    },
});
