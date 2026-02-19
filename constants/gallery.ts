export type GalleryItem = {
    _id: string;
    type: "image" | "video";
    src: string;
    alt?: string;
    aspectRatio?: number;
};

export type PageLayout = {
    left: GalleryItem;
    rightTop: GalleryItem;
    rightBottom: GalleryItem;
};

export const CDN_BASE = "https://cdn.iamalive.app";
export const PROCESSED_MOBILE_PREFIX = "/processed/mobile/";
export const PREVIEW_PREFIX = "/processed/preview/";

export const API_URL = "https://dev.iamalive.app/api/destinations/experience/learn-horse-riding-and-trot-down-a-private-forest-trail?fields=gallery";

export const TARGET_RATIO = 9 / 16;
