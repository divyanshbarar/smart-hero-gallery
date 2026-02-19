import { VideoView, useVideoPlayer } from 'expo-video';
import React, { useEffect, useRef, useState } from 'react';
import { FlatList, Modal, StyleSheet, TouchableOpacity, View, ViewToken, useWindowDimensions } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { GalleryItem } from '../constants/gallery';
import { getImageUrl, getVideoUrl } from '../utils/galleryUtils';
import { IconSymbol } from './ui/icon-symbol';
import { ZoomableImage } from './ZoomableImage';

interface FullScreenGalleryProps {
    items: GalleryItem[];
    initialItemId: string;
    onClose: () => void;
}

export const FullScreenGallery = ({ items, initialItemId, onClose }: FullScreenGalleryProps) => {
    const { width, height } = useWindowDimensions();
    const initialIndex = items.findIndex(item => item._id === initialItemId);
    const [currentIndex, setCurrentIndex] = useState(initialIndex !== -1 ? initialIndex : 0);

    const currentItem = items[currentIndex];
    const isCurrentVideo = currentItem?.type === 'video';
    const activeVideoSrc = isCurrentVideo ? getVideoUrl(currentItem.src, 'original') : '';

    const player = useVideoPlayer(activeVideoSrc, (p) => {
        p.loop = true;
    });

    useEffect(() => {
        if (isCurrentVideo) {
            player.play();
        } else {
            player.pause();
        }
    }, [currentIndex, isCurrentVideo, player]);

    const handleClose = () => {
        player.pause();
        onClose();
    };

    const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

    const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
        if (viewableItems.length > 0 && viewableItems[0].index !== null) {
            setCurrentIndex(viewableItems[0].index);
        }
    }).current;

    const renderItem = ({ item }: { item: GalleryItem }) => {
        if (item.type === 'video') {
            return (
                <View style={{ width, height, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' }}>
                    <VideoView
                        player={player}
                        style={{ width: '100%', height: '100%' }}
                        contentFit="contain"
                    />
                </View>
            );
        }

        return (
            <ZoomableImage uri={getImageUrl(item.src, 'original')} />
        );
    };

    return (
        <Modal
            visible
            animationType="fade"
            transparent={false}
            statusBarTranslucent
            onRequestClose={handleClose}
        >
            <GestureHandlerRootView style={styles.container}>
                <FlatList
                    data={items}
                    renderItem={renderItem}
                    horizontal
                    pagingEnabled
                    initialScrollIndex={initialIndex !== -1 ? initialIndex : 0}
                    getItemLayout={(_, index) => ({
                        length: width,
                        offset: width * index,
                        index,
                    })}
                    keyExtractor={item => item._id}
                    showsHorizontalScrollIndicator={false}
                    onViewableItemsChanged={onViewableItemsChanged}
                    viewabilityConfig={viewabilityConfig}
                />

                <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                    <IconSymbol name="xmark" size={30} color="white" />
                </TouchableOpacity>
            </GestureHandlerRootView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 10,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
        padding: 5,
    },
});
