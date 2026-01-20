import type { FigmaExportFormat } from "~/db/schema";

/**
 * Entry for a single image in a srcset
 */
export interface SrcsetEntry {
  url: string;
  width: number;
  scale?: number; // 1, 2, 3 for DPI descriptor
}

/**
 * Options for generating srcset markup
 */
export interface SrcsetOptions {
  /**
   * Use width descriptors (e.g., "200w") instead of density descriptors (e.g., "2x")
   * Width descriptors are more flexible for responsive images
   */
  useWidthDescriptors?: boolean;

  /**
   * Default width for the sizes attribute (only used with width descriptors)
   */
  defaultWidth?: number;

  /**
   * Alt text for the image
   */
  alt?: string;

  /**
   * CSS class name for the image element
   */
  className?: string;

  /**
   * Loading strategy: "lazy" or "eager"
   */
  loading?: "lazy" | "eager";

  /**
   * Decoding strategy: "async", "sync", or "auto"
   */
  decoding?: "async" | "sync" | "auto";

  /**
   * Whether to include fetchpriority attribute
   */
  fetchPriority?: "high" | "low" | "auto";
}

/**
 * Generate srcset attribute value from entries
 * Supports both density descriptors (1x, 2x, 3x) and width descriptors (200w, 400w, 600w)
 */
export function generateSrcsetAttribute(
  entries: SrcsetEntry[],
  useWidthDescriptors: boolean = false
): string {
  // Sort entries by scale/width for consistent output
  const sorted = [...entries].sort((a, b) => {
    if (useWidthDescriptors) {
      return a.width - b.width;
    }
    return (a.scale || 1) - (b.scale || 1);
  });

  return sorted
    .map((entry) => {
      if (useWidthDescriptors) {
        return `${entry.url} ${entry.width}w`;
      }
      return `${entry.url} ${entry.scale || 1}x`;
    })
    .join(", ");
}

/**
 * Generate sizes attribute for responsive images
 */
export function generateSizesAttribute(
  breakpoints: Array<{ maxWidth?: number; size: string }>
): string {
  return breakpoints
    .map((bp) => {
      if (bp.maxWidth) {
        return `(max-width: ${bp.maxWidth}px) ${bp.size}`;
      }
      return bp.size;
    })
    .join(", ");
}

/**
 * Common responsive breakpoints
 */
export const COMMON_BREAKPOINTS = {
  mobile: { maxWidth: 640, size: "100vw" },
  tablet: { maxWidth: 1024, size: "50vw" },
  desktop: { size: "33vw" },
};

/**
 * Generate complete srcset markup (just the srcset value)
 */
export function generateSrcsetMarkup(entries: SrcsetEntry[]): string {
  return generateSrcsetAttribute(entries, false);
}

/**
 * Generate full <img> tag with srcset for responsive images
 */
export function generateResponsiveImgTag(
  entries: SrcsetEntry[],
  options: SrcsetOptions = {}
): string {
  const {
    useWidthDescriptors = false,
    defaultWidth,
    alt = "",
    className,
    loading = "lazy",
    decoding = "async",
    fetchPriority,
  } = options;

  // Get the 1x image as the fallback src
  const fallbackEntry = entries.find((e) => e.scale === 1) || entries[0];
  if (!fallbackEntry) {
    throw new Error("No entries provided for srcset");
  }

  const srcset = generateSrcsetAttribute(entries, useWidthDescriptors);

  const attributes: string[] = [
    `src="${fallbackEntry.url}"`,
    `srcset="${srcset}"`,
    `alt="${alt}"`,
    `loading="${loading}"`,
    `decoding="${decoding}"`,
  ];

  if (className) {
    attributes.push(`class="${className}"`);
  }

  if (fetchPriority) {
    attributes.push(`fetchpriority="${fetchPriority}"`);
  }

  // Add sizes attribute for width descriptors
  if (useWidthDescriptors) {
    const width = defaultWidth || fallbackEntry.width;
    // Default sizes: 100vw on mobile, actual width on larger screens
    const sizes = `(max-width: ${width}px) 100vw, ${width}px`;
    attributes.push(`sizes="${sizes}"`);
  }

  // Add width and height for layout stability
  attributes.push(`width="${fallbackEntry.width}"`);
  const aspectRatio = entries[0]?.width ? fallbackEntry.width / entries[0].width : 1;
  if (entries[0]) {
    const height = Math.round(fallbackEntry.width / aspectRatio);
    attributes.push(`height="${height}"`);
  }

  return `<img ${attributes.join(" ")} />`;
}

/**
 * Generate <picture> element with multiple format sources
 * Allows browsers to choose the best format (webp > png > jpg)
 */
export function generatePictureElement(
  sources: Array<{
    format: FigmaExportFormat;
    entries: SrcsetEntry[];
  }>,
  options: SrcsetOptions = {}
): string {
  const { alt = "", className, loading = "lazy", decoding = "async" } = options;

  // Sort formats by preference: webp first (best compression), then png, then jpg
  const formatOrder: FigmaExportFormat[] = ["webp", "png", "jpg"];
  const sortedSources = [...sources].sort(
    (a, b) => formatOrder.indexOf(a.format) - formatOrder.indexOf(b.format)
  );

  const mimeTypes: Record<FigmaExportFormat, string> = {
    webp: "image/webp",
    png: "image/png",
    jpg: "image/jpeg",
  };

  const sourceElements = sortedSources
    .slice(0, -1) // All but the last one go in <source> tags
    .map((source) => {
      const srcset = generateSrcsetAttribute(source.entries);
      return `  <source srcset="${srcset}" type="${mimeTypes[source.format]}" />`;
    });

  // Last format goes in the <img> tag as fallback
  const fallback = sortedSources[sortedSources.length - 1];
  const fallbackEntry = fallback?.entries.find((e) => e.scale === 1) || fallback?.entries[0];

  if (!fallbackEntry) {
    throw new Error("No entries provided for picture element");
  }

  const imgAttributes = [
    `src="${fallbackEntry.url}"`,
    `srcset="${generateSrcsetAttribute(fallback.entries)}"`,
    `alt="${alt}"`,
    `loading="${loading}"`,
    `decoding="${decoding}"`,
  ];

  if (className) {
    imgAttributes.push(`class="${className}"`);
  }

  return `<picture>
${sourceElements.join("\n")}
  <img ${imgAttributes.join(" ")} />
</picture>`;
}

/**
 * Generate React/JSX-compatible img props object
 */
export function generateImgProps(
  entries: SrcsetEntry[],
  options: SrcsetOptions = {}
): Record<string, string | number> {
  const {
    useWidthDescriptors = false,
    defaultWidth,
    alt = "",
    className,
    loading = "lazy",
    decoding = "async",
    fetchPriority,
  } = options;

  const fallbackEntry = entries.find((e) => e.scale === 1) || entries[0];
  if (!fallbackEntry) {
    throw new Error("No entries provided for srcset");
  }

  const srcset = generateSrcsetAttribute(entries, useWidthDescriptors);

  const props: Record<string, string | number> = {
    src: fallbackEntry.url,
    srcSet: srcset,
    alt,
    loading,
    decoding,
    width: fallbackEntry.width,
  };

  if (className) {
    props.className = className;
  }

  if (fetchPriority) {
    props.fetchPriority = fetchPriority;
  }

  if (useWidthDescriptors) {
    const width = defaultWidth || fallbackEntry.width;
    props.sizes = `(max-width: ${width}px) 100vw, ${width}px`;
  }

  return props;
}

/**
 * Generate CSS background-image with image-set for multiple resolutions
 */
export function generateCssImageSet(entries: SrcsetEntry[]): string {
  const sorted = [...entries].sort((a, b) => (a.scale || 1) - (b.scale || 1));

  const imageSetParts = sorted.map(
    (entry) => `url("${entry.url}") ${entry.scale || 1}x`
  );

  // Include both standard and webkit-prefixed versions for compatibility
  return `background-image: -webkit-image-set(${imageSetParts.join(", ")});
background-image: image-set(${imageSetParts.join(", ")});`;
}

/**
 * Utility to create srcset entries from a base URL pattern
 * e.g., "/images/hero" -> ["/images/hero@1x.png", "/images/hero@2x.png", "/images/hero@3x.png"]
 */
export function createSrcsetEntriesFromPattern(
  baseUrl: string,
  extension: string,
  baseWidth: number,
  scales: number[] = [1, 2, 3]
): SrcsetEntry[] {
  return scales.map((scale) => ({
    url: `${baseUrl}@${scale}x.${extension}`,
    width: baseWidth * scale,
    scale,
  }));
}
