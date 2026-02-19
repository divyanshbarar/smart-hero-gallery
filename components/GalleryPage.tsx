import React, { memo } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { PageLayout } from '../constants/gallery';
import { GalleryTile } from './GalleryTile';

interface GalleryPageProps {
    page: PageLayout;
    onPress: (itemId: string) => void;
    isVisible: boolean;
}

export const GalleryPage = memo(({ page, onPress, isVisible }: GalleryPageProps) => {
    const { width } = useWindowDimensions();
    const pageHeight = width * (16 / 9);

    return (
        <View style={[styles.container, { width, height: pageHeight }]}>
            <View style={styles.leftColumn}>
                <GalleryTile
                    item={page.left}
                    onPress={onPress}
                    isVisible={isVisible}
                    style={styles.heroTile}
                />
            </View>

            <View style={styles.rightColumn}>
                <GalleryTile
                    item={page.rightTop}
                    onPress={onPress}
                    isVisible={isVisible}
                    style={styles.stackedTile}
                />
                <GalleryTile
                    item={page.rightBottom}
                    onPress={onPress}
                    isVisible={isVisible}
                    style={styles.stackedTile}
                />
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
    },
    leftColumn: {
        flex: 2,
        padding: 2,
    },
    rightColumn: {
        flex: 1,
        padding: 2,
        gap: 4,
    },
    heroTile: {
        flex: 1,
    },
    stackedTile: {
        flex: 1,
    },
});
