/**
 * Compress + resize an image file in-browser using the Canvas API.
 * Returns a new JPEG File, always smaller than the original.
 * Falls back to the original file if anything fails.
 */
export async function compressImage(file, {
  maxWidth  = 1200,
  maxHeight = 1200,
  quality   = 0.82,
  maxSizeMB = 1.5,
} = {}) {
  if (!file || !file.type.startsWith('image/')) return file;

  // Already small enough — skip canvas work
  if (file.size <= maxSizeMB * 1024 * 1024 && file.type === 'image/jpeg') return file;

  return new Promise((resolve) => {
    const img   = new Image();
    const objUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objUrl);

      let w = img.naturalWidth;
      let h = img.naturalHeight;
      const ratio = Math.min(maxWidth / w, maxHeight / h, 1);
      w = Math.round(w * ratio);
      h = Math.round(h * ratio);

      const canvas = document.createElement('canvas');
      canvas.width  = w;
      canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);

      canvas.toBlob(
        (blob) => {
          if (!blob) { resolve(file); return; }
          const name = file.name.replace(/\.[^/.]+$/, '.jpg');
          const compressed = new File([blob], name, { type: 'image/jpeg', lastModified: Date.now() });
          // Only use compressed if it's actually smaller
          resolve(compressed.size < file.size ? compressed : file);
        },
        'image/jpeg',
        quality,
      );
    };

    img.onerror = () => { URL.revokeObjectURL(objUrl); resolve(file); };
    img.src = objUrl;
  });
}

/** Format bytes to human-readable string */
export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
