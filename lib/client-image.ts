import type { ImageMetrics } from "./types";

const MAX_SIZE = 512;

export type PreparedImage = {
  dataUrl: string;
  metrics: ImageMetrics;
};

export async function prepareImage(file: File): Promise<PreparedImage> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please upload an image file.");
  }

  const sourceUrl = URL.createObjectURL(file);

  try {
    const image = await loadImage(sourceUrl);
    const scale = Math.min(1, MAX_SIZE / Math.max(image.width, image.height));
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d", { willReadFrequently: true });

    if (!context) {
      throw new Error("Your browser could not read this image.");
    }

    canvas.width = width;
    canvas.height = height;
    context.drawImage(image, 0, 0, width, height);

    const imageData = context.getImageData(0, 0, width, height);

    return {
      dataUrl: canvas.toDataURL("image/jpeg", 0.82),
      metrics: computeImageMetrics(imageData),
    };
  } finally {
    URL.revokeObjectURL(sourceUrl);
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("This image could not be loaded."));
    image.src = src;
  });
}

function computeImageMetrics(imageData: ImageData): ImageMetrics {
  const { data, width, height } = imageData;
  const luminance = new Float32Array(width * height);
  let total = 0;

  for (let index = 0, pixel = 0; index < data.length; index += 4, pixel += 1) {
    const value =
      (0.2126 * data[index] + 0.7152 * data[index + 1] + 0.0722 * data[index + 2]) /
      255;
    luminance[pixel] = value;
    total += value;
  }

  const count = luminance.length;
  const brightness = total / count;
  let variance = 0;

  for (const value of luminance) {
    variance += (value - brightness) ** 2;
  }

  const contrast = Math.sqrt(variance / count);
  const edgeThreshold = 0.18;
  let edgeCount = 0;
  let saliencyTotal = 0;
  let saliencyX = 0;
  let saliencyY = 0;

  for (let y = 0; y < height - 1; y += 1) {
    for (let x = 0; x < width - 1; x += 1) {
      const offset = y * width + x;
      const dx = Math.abs(luminance[offset] - luminance[offset + 1]);
      const dy = Math.abs(luminance[offset] - luminance[offset + width]);
      const edge = Math.min(1, dx + dy);
      const localContrast = Math.abs(luminance[offset] - brightness);
      const saliency = edge + localContrast * 0.65;

      if (edge > edgeThreshold) {
        edgeCount += 1;
      }

      saliencyTotal += saliency;
      saliencyX += x * saliency;
      saliencyY += y * saliency;
    }
  }

  const edgeDensity = edgeCount / Math.max(1, (width - 1) * (height - 1));
  const centroidX = saliencyTotal > 0 ? saliencyX / saliencyTotal : width / 2;
  const centroidY = saliencyTotal > 0 ? saliencyY / saliencyTotal : height / 2;
  const centerOffset = Math.min(
    1,
    Math.hypot(centroidX - width / 2, centroidY - height / 2) /
      Math.hypot(width / 2, height / 2),
  );
  const clutter = clamp01(edgeDensity * 1.6 + contrast * 0.55);

  return {
    width,
    height,
    brightness: roundMetric(brightness),
    contrast: roundMetric(contrast),
    edgeDensity: roundMetric(edgeDensity),
    centerOffset: roundMetric(centerOffset),
    clutter: roundMetric(clutter),
  };
}

function roundMetric(value: number): number {
  return Math.round(clamp01(value) * 1000) / 1000;
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}
