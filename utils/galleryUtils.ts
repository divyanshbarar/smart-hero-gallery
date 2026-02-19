import { CDN_BASE, PREVIEW_PREFIX, PROCESSED_MOBILE_PREFIX } from '../constants/gallery';

export function getImageUrl(src: string, type: 'preview' | 'processed' | 'original') {
    switch (type) {
        case 'preview':
            return `${CDN_BASE}${PREVIEW_PREFIX}${src}`;
        case 'processed':
            return `${CDN_BASE}${PROCESSED_MOBILE_PREFIX}${src}`;
        case 'original':
            return `${CDN_BASE}/${src}`;
        default:
            return `${CDN_BASE}/${src}`;
    }
}

export function getVideoUrl(src: string, type: 'processed' | 'original') {
    switch (type) {
        case 'processed':
            return `${CDN_BASE}${PROCESSED_MOBILE_PREFIX}${src}`;
        case 'original':
            return `${CDN_BASE}/${src}`;
        default:
            return `${CDN_BASE}/${src}`;
    }
}

export function getVideoPosterUrl(src: string, type: 'preview' | 'processed' | 'original') {
    const posterSrc = `${src}.webp`;
    return getImageUrl(posterSrc, type);
}
