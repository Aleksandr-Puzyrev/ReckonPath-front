import { Skia } from "@shopify/react-native-skia";
import type { SkImage } from "@shopify/react-native-skia";
import { useEffect, useState } from "react";

import type { BoardTexture, BoardTextureUrls } from "@entities/item";

export type BoardTextures = Record<BoardTexture, SkImage | null>;

const MAX_CACHED_TEXTURES = 48;
const pendingImages = new Map<string, Promise<SkImage | null>>();

const loadTexture = (url: string) => {
  const cached = pendingImages.get(url);
  if (cached !== undefined) return cached;
  if (pendingImages.size >= MAX_CACHED_TEXTURES) {
    const oldest = pendingImages.keys().next().value;
    if (oldest !== undefined) pendingImages.delete(oldest);
  }

  const loading = Skia.Data.fromURI(url)
    .then((data) => Skia.Image.MakeImageFromEncoded(data))
    .catch(() => null)
    .then((image) => {
      if (image === null && pendingImages.get(url) === loading) pendingImages.delete(url);
      return image;
    });
  pendingImages.set(url, loading);
  return loading;
};

const useTexture = (url: string | undefined) => {
  const [loaded, setLoaded] = useState<{ url: string; image: SkImage } | null>(null);
  useEffect(() => {
    if (url === undefined) return;
    let cancelled = false;
    void loadTexture(url).then((image) => {
      if (!cancelled && image !== null) setLoaded({ url, image });
    });
    return () => {
      cancelled = true;
    };
  }, [url]);
  return loaded !== null && loaded.url === url ? loaded.image : null;
};

export const useBoardTextures = (urls: BoardTextureUrls | undefined): BoardTextures => ({
  bg: useTexture(urls?.bg),
  cell: useTexture(urls?.cell),
  open: useTexture(urls?.open),
  fence: useTexture(urls?.fence),
  water: useTexture(urls?.water),
  bridge: useTexture(urls?.bridge),
  heavy: useTexture(urls?.heavy),
  rock: useTexture(urls?.rock),
  bomb: useTexture(urls?.bomb),
  buoy: useTexture(urls?.buoy),
  beacon: useTexture(urls?.beacon),
  marker: useTexture(urls?.marker),
});
