import * as sharp from "sharp";
import type { FigmaExportFormat } from "~/db/schema";

// Use sharp default export
const sharpFn = (sharp as unknown as { default: typeof sharp.default }).default || sharp;

// Supported export formats and their MIME types
export const FORMAT_MIME_TYPES: Record<FigmaExportFormat, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  webp: "image/webp",
};

// Format-specific configuration
export interface ImageProcessingOptions {
  format: FigmaExportFormat;
  quality?: number; // 1-100 for jpg/webp, ignored for png
  width?: number; // Target width for resizing
  height?: number; // Target height for resizing
  // PNG-specific options
  compressionLevel?: number; // 0-9 for png
  // JPG/WebP-specific options
  progressive?: boolean;
}

export interface ProcessedImage {
  buffer: Buffer;
  format: FigmaExportFormat;
  width: number;
  height: number;
  sizeBytes: number;
  mimeType: string;
}

export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  size: number;
  hasAlpha: boolean;
}

/**
 * Get metadata from an image buffer
 */
export async function getImageMetadata(buffer: Buffer): Promise<ImageMetadata> {
  const metadata = await sharpFn(buffer).metadata();

  return {
    width: metadata.width || 0,
    height: metadata.height || 0,
    format: metadata.format || "unknown",
    size: buffer.length,
    hasAlpha: metadata.hasAlpha || false,
  };
}

/**
 * Process and optimize an image buffer
 */
export async function processImage(
  inputBuffer: Buffer,
  options: ImageProcessingOptions
): Promise<ProcessedImage> {
  let pipeline = sharpFn(inputBuffer);

  // Resize if dimensions provided
  if (options.width || options.height) {
    pipeline = pipeline.resize(options.width, options.height, {
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  // Apply format-specific processing
  switch (options.format) {
    case "png":
      pipeline = pipeline.png({
        compressionLevel: options.compressionLevel ?? 6,
        palette: true, // Use palette-based encoding for smaller files when possible
      });
      break;

    case "jpg":
      pipeline = pipeline.jpeg({
        quality: options.quality ?? 85,
        progressive: options.progressive ?? true,
        mozjpeg: true, // Use mozjpeg for better compression
      });
      break;

    case "webp":
      pipeline = pipeline.webp({
        quality: options.quality ?? 85,
        alphaQuality: 100, // Preserve alpha quality
        lossless: false,
        nearLossless: false,
        smartSubsample: true,
      });
      break;

    default:
      throw new Error(`Unsupported format: ${options.format}`);
  }

  const outputBuffer = await pipeline.toBuffer();
  const outputMetadata = await sharpFn(outputBuffer).metadata();

  return {
    buffer: outputBuffer,
    format: options.format,
    width: outputMetadata.width || 0,
    height: outputMetadata.height || 0,
    sizeBytes: outputBuffer.length,
    mimeType: FORMAT_MIME_TYPES[options.format],
  };
}

/**
 * Convert an image to a different format
 */
export async function convertImage(
  inputBuffer: Buffer,
  targetFormat: FigmaExportFormat,
  quality?: number
): Promise<ProcessedImage> {
  return processImage(inputBuffer, {
    format: targetFormat,
    quality,
  });
}

/**
 * Optimize an image without changing format
 * Detects format from input and applies appropriate optimizations
 */
export async function optimizeImage(
  inputBuffer: Buffer,
  quality?: number
): Promise<ProcessedImage> {
  const metadata = await sharpFn(inputBuffer).metadata();
  const format = mapSharpFormatToExportFormat(metadata.format);

  return processImage(inputBuffer, {
    format,
    quality,
  });
}

/**
 * Generate multiple sizes of an image (for srcset)
 */
export async function generateImageSizes(
  inputBuffer: Buffer,
  options: ImageProcessingOptions,
  scales: number[] = [1, 2, 3]
): Promise<Map<number, ProcessedImage>> {
  const metadata = await sharpFn(inputBuffer).metadata();
  const baseWidth = metadata.width || 0;
  const baseHeight = metadata.height || 0;

  const results = new Map<number, ProcessedImage>();

  for (const scale of scales) {
    const processed = await processImage(inputBuffer, {
      ...options,
      width: Math.round(baseWidth * scale),
      height: Math.round(baseHeight * scale),
    });

    results.set(scale, processed);
  }

  return results;
}

/**
 * Process images for responsive srcset
 * Takes a 3x image and generates 1x and 2x variants
 */
export async function processForSrcset(
  inputBuffer: Buffer,
  baseWidth: number,
  format: FigmaExportFormat,
  quality?: number
): Promise<{
  "1x": ProcessedImage;
  "2x": ProcessedImage;
  "3x": ProcessedImage;
}> {
  const [img1x, img2x, img3x] = await Promise.all([
    processImage(inputBuffer, {
      format,
      quality,
      width: baseWidth,
    }),
    processImage(inputBuffer, {
      format,
      quality,
      width: baseWidth * 2,
    }),
    processImage(inputBuffer, {
      format,
      quality,
      width: baseWidth * 3,
    }),
  ]);

  return {
    "1x": img1x,
    "2x": img2x,
    "3x": img3x,
  };
}

/**
 * Check if an image has transparency (useful for choosing jpg vs png/webp)
 */
export async function hasTransparency(buffer: Buffer): Promise<boolean> {
  const metadata = await sharpFn(buffer).metadata();
  return metadata.hasAlpha || false;
}

/**
 * Suggest the best format based on image characteristics
 */
export async function suggestFormat(buffer: Buffer): Promise<FigmaExportFormat> {
  const metadata = await sharpFn(buffer).metadata();

  // If image has transparency, prefer webp (smaller) or png (universal support)
  if (metadata.hasAlpha) {
    return "webp";
  }

  // For photos and complex images, jpg or webp is better
  // For simple graphics, png might be smaller
  // Default to webp as it provides best compression for both
  return "webp";
}

/**
 * Map sharp format strings to our FigmaExportFormat type
 */
function mapSharpFormatToExportFormat(format: string | undefined): FigmaExportFormat {
  switch (format) {
    case "jpeg":
    case "jpg":
      return "jpg";
    case "webp":
      return "webp";
    case "png":
    default:
      return "png";
  }
}

/**
 * Download an image from a URL and return as buffer
 */
export async function downloadImage(url: string): Promise<Buffer> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Download and process an image from a URL
 */
export async function downloadAndProcessImage(
  url: string,
  options: ImageProcessingOptions
): Promise<ProcessedImage> {
  const buffer = await downloadImage(url);
  return processImage(buffer, options);
}

/**
 * Batch download and process multiple images
 */
export async function batchDownloadAndProcess(
  urls: Array<{ id: string; url: string }>,
  options: ImageProcessingOptions
): Promise<Map<string, ProcessedImage>> {
  const results = new Map<string, ProcessedImage>();

  const promises = urls.map(async ({ id, url }) => {
    try {
      const processed = await downloadAndProcessImage(url, options);
      return { id, processed, error: null };
    } catch (error) {
      return { id, processed: null, error };
    }
  });

  const responses = await Promise.all(promises);

  for (const { id, processed } of responses) {
    if (processed) {
      results.set(id, processed);
    }
  }

  return results;
}
