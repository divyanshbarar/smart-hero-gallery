import { VideoView, useVideoPlayer } from 'expo-video';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GalleryItem } from '../constants/gallery';
import { getImageUrl, getVideoPosterUrl, getVideoUrl } from '../utils/galleryUtils';

interface MediaTileProps {
    item: GalleryItem;
    isVisible: boolean;
    onPress?: () => void;
}

export const MediaTile = ({ item, isVisible, onPress }: MediaTileProps) => {
    const [sourceType, setSourceType] = useState<'preview' | 'processed' | 'original'>('preview');
    const [error, setError] = useState(false);
    const [playbackError, setPlaybackError] = useState(false);

    const isVideo = item.type === 'video';
    const videoUrl = isVideo ? getVideoUrl(item.src, sourceType === 'original' ? 'original' : 'processed') : '';

    const player = useVideoPlayer(videoUrl, (player) => {
        player.loop = true;
        player.muted = true;
    });

    useEffect(() => {
        if (isVisible) {
            player.play();
        } else {
            player.pause();
        }
    }, [isVisible, player]);

    const handleMediaError = () => {
        if (sourceType === 'preview') setSourceType('processed');
        else if (sourceType === 'processed') setSourceType('original');
        else setError(true);
    };

    const renderImage = () => (
        <Image
            source={{ uri: getImageUrl(item.src, sourceType) }}
            style={styles.media}
            resizeMode="cover"
            onError={handleMediaError}
        />
    );

    const renderVideo = () => {
        const posterUri = getVideoPosterUrl(item.src, sourceType);

        if (playbackError) {
            return (
                <TouchableOpacity
                    style={styles.fullFill}
                    onPress={() => { setPlaybackError(false); player.play(); }}
                    activeOpacity={0.8}
                >
                    <Image source={{ uri: posterUri }} style={styles.media} resizeMode="cover" />
                    <View style={styles.videoOverlay}>
                        <Text style={styles.retryText}>Tap to retry</Text>
                    </View>
                </TouchableOpacity>
            );
        }

        return (
            <View style={styles.fullFill}>
                <VideoView
                    player={player}
                    style={styles.media}
                    contentFit="cover"
                    nativeControls={false}
                />
                {!isVisible && (
                    <Image
                        source={{ uri: posterUri }}
                        style={[styles.media, StyleSheet.absoluteFill]}
                        resizeMode="cover"
                    />
                )}
                {/* Transparent overlay to capture tap on video tiles */}
                {onPress && (
                    <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onPress} activeOpacity={0.8} />
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {isVideo ? renderVideo() : renderImage()}
            {error && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>!</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    fullFill: {
        flex: 1,
    },
    media: {
        width: '100%',
        height: '100%',
    },
    videoOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    retryText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    errorContainer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#444',
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: 'white',
        fontSize: 24,
    },
});
