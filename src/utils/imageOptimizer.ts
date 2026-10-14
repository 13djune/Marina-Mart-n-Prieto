/**
 * Image optimization & preloading utilities for fast loading
 * Transforms Unsplash URLs to appropriate sizes and formats
 * Preloads images via Image() API for smooth rendering
 */

/**
 * Returns an optimized Unsplash image URL tailored for device and display size
 */
export function getOptimizedImageUrl(
  url: string, 
  width: number = 1000, 
  quality: number = 80
): string {
  if (!url) return '';
  
  // If it's an Unsplash image, optimize query parameters
  if (url.includes('images.unsplash.com')) {
    try {
      const urlObj = new URL(url);
      urlObj.searchParams.set('w', width.toString());
      urlObj.searchParams.set('q', quality.toString());
      urlObj.searchParams.set('auto', 'format');
      urlObj.searchParams.set('fit', 'crop');
      return urlObj.toString();
    } catch {
      // Fallback if URL parsing fails
      return url;
    }
  }

  return url;
}

/**
 * Preloads a single image and returns a Promise
 */
export function preloadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    if (!src) {
      reject(new Error('No image src'));
      return;
    }
    const img = new Image();
    img.src = src;
    img.decoding = 'async';
    if (img.complete) {
      resolve(img);
      return;
    }
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
  });
}

/**
 * Preloads multiple images with an optional timeout
 */
export async function preloadImages(
  urls: string[], 
  timeoutMs: number = 3000
): Promise<void> {
  const loadPromises = urls.map(url => 
    preloadImage(url).catch(() => {
      // Don't fail the whole batch if one image has network issue
      return null;
    })
  );

  const timeoutPromise = new Promise(resolve => setTimeout(resolve, timeoutMs));
  await Promise.race([Promise.all(loadPromises), timeoutPromise]);
}
