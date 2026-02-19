import { GalleryItem, PageLayout, TARGET_RATIO } from '../constants/gallery';

export function buildPages(
    items: GalleryItem[],
    opts: { lookahead?: number } = { lookahead: 12 }
): PageLayout[] {
    const pages: PageLayout[] = [];
    const remaining = [...items];

    while (remaining.length >= 3) {
        const lookaheadCount = opts.lookahead || 12;
        const pool = remaining.slice(0, lookaheadCount);

        const videosInPool = pool
            .map((item, index) => ({ item, index }))
            .filter((v) => v.item.type === 'video');

        let selectedVideoIndexInRemaining = -1;

        if (videosInPool.length > 0) {
            let bestVideo = videosInPool[0];
            let minDiff = Math.abs((bestVideo.item.aspectRatio || 0) - TARGET_RATIO);

            for (let i = 1; i < videosInPool.length; i++) {
                const diff = Math.abs((videosInPool[i].item.aspectRatio || 0) - TARGET_RATIO);
                if (diff < minDiff) {
                    minDiff = diff;
                    bestVideo = videosInPool[i];
                }
            }
            selectedVideoIndexInRemaining = bestVideo.index;
        }

        const selectedVideo = selectedVideoIndexInRemaining !== -1 ? remaining[selectedVideoIndexInRemaining] : null;

        if (selectedVideo) {
            const imageIndices: number[] = [];
            for (let i = 0; i < remaining.length && imageIndices.length < 2; i++) {
                if (i !== selectedVideoIndexInRemaining && remaining[i].type === 'image') {
                    imageIndices.push(i);
                }
            }

            if (imageIndices.length === 2) {
                const item1 = selectedVideo;
                const item2 = remaining[imageIndices[0]];
                const item3 = remaining[imageIndices[1]];

                pages.push({
                    left: item1,
                    rightTop: item2,
                    rightBottom: item3
                });

                const toRemove = [selectedVideoIndexInRemaining, ...imageIndices].sort((a, b) => b - a);
                toRemove.forEach(idx => remaining.splice(idx, 1));
                continue;
            }
        }

        const fallbackItems: GalleryItem[] = [];
        const indicesToRemove: number[] = [];
        let hasVideo = false;

        for (let i = 0; i < remaining.length && fallbackItems.length < 3; i++) {
            const item = remaining[i];
            if (item.type === 'video') {
                if (!hasVideo) {
                    fallbackItems.push(item);
                    indicesToRemove.push(i);
                    hasVideo = true;
                }
            } else {
                fallbackItems.push(item);
                indicesToRemove.push(i);
            }
        }

        if (fallbackItems.length === 3) {
            let left: GalleryItem;
            let rt: GalleryItem;
            let rb: GalleryItem;

            const videoIdx = fallbackItems.findIndex(item => item.type === 'video');
            if (videoIdx !== -1) {
                left = fallbackItems[videoIdx];
                const others = fallbackItems.filter((_, idx) => idx !== videoIdx);
                rt = others[0];
                rb = others[1];
            } else {
                left = fallbackItems[0];
                rt = fallbackItems[1];
                rb = fallbackItems[2];
            }

            pages.push({ left, rightTop: rt, rightBottom: rb });
            indicesToRemove.sort((a, b) => b - a).forEach(idx => remaining.splice(idx, 1));
        } else {
            break;
        }
    }

    return pages;
}
