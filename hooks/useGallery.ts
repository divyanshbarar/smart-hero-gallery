import { useEffect, useMemo, useState } from 'react';
import { API_URL, GalleryItem } from '../constants/gallery';
import { buildPages } from '../utils/buildPages';

export function useGallery() {
    const [items, setItems] = useState<GalleryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const response = await fetch(API_URL);
                const json = await response.json();

                if (json.data && json.data.gallery) {
                    setItems(json.data.gallery);
                } else {
                    throw new Error('Invalid API response');
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    const pages = useMemo(() => buildPages(items), [items]);

    return { items, pages, loading, error };
}
