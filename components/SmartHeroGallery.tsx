import { Image } from 'expo-image';
import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View, ViewToken, useWindowDimensions } from 'react-native';
import { useGallery } from '../hooks/useGallery';
import { getImageUrl, getVideoPosterUrl } from '../utils/galleryUtils';
import { FullScreenGallery } from "./FullScreenGallery";
import { GalleryPage } from './GalleryPage';
import { ScrollNudge } from './ScrollNudge';

export function SmartHeroGallery() {
    const { pages, loading, error, items } = useGallery();
    const { width } = useWindowDimensions();
    const [visibleIndices, setVisibleIndices] = useState<number[]>([0]);
    const [showNudge, setShowNudge] = useState(true);
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

    const flatListRef = useRef<FlatList>(null);

    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 50,
    }).current;

    const prefetchPage = (index: number) => {
        if (index >= 0 && index < pages.length) {
            const page = pages[index];
            const itemsToPrefetch = [page.left, page.rightTop, page.rightBottom];
            itemsToPrefetch.forEach(item => {
                const url = item.type === 'image'
                    ? getImageUrl(item.src, 'processed')
                    : getVideoPosterUrl(item.src, 'processed');
                Image.prefetch(url);
            });
        }
    };

    const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
        const indices = viewableItems.map(vi => vi.index).filter((idx): idx is number => idx !== null);
        setVisibleIndices(indices);

        if (indices.length > 0) {
            const currentIndex = indices[0];
            prefetchPage(currentIndex + 1);
            prefetchPage(currentIndex + 2);
        }

        if (indices.length > 0 && !indices.includes(0)) {
            setShowNudge(false);
        }
    }).current;

    const handleNudgePress = useCallback(() => {
        setShowNudge(false);
        flatListRef.current?.scrollToIndex({ index: 1, animated: true });
    }, []);

    const handleTilePress = useCallback((itemId: string) => {
        setSelectedItemId(itemId);
    }, []);

    const renderPage = useCallback(({ item, index }: { item: any, index: number }) => (
        <GalleryPage
            page={item}
            onPress={handleTilePress}
            isVisible={visibleIndices.includes(index) && selectedItemId === null}
        />
    ), [visibleIndices, handleTilePress, selectedItemId]);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorText}>Error: {error}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={pages}
                renderItem={renderPage}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                keyExtractor={(_, index) => `page-${index}`}
                getItemLayout={(_, index) => ({
                    length: width,
                    offset: width * index,
                    index,
                })}
            />

            <View style={styles.dotsContainer}>
                {pages.map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.dot,
                            visibleIndices.includes(index) && styles.activeDot
                        ]}
                    />
                ))}
            </View>

            {showNudge && pages.length > 1 && (
                <ScrollNudge onPress={handleNudgePress} />
            )}

            {selectedItemId && (
                <FullScreenGallery
                    items={items}
                    initialItemId={selectedItemId}
                    onClose={() => setSelectedItemId(null)}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
    },
    errorText: {
        color: 'red',
    },
    dotsContainer: {
        position: 'absolute',
        bottom: 20,
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'center',
        gap: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.3)',
    },
    activeDot: {
        backgroundColor: 'white',
        width: 12,
    },
});
