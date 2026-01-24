import type { JSONContent } from "@tiptap/core";

/**
 * Checks if text looks like markdown by detecting common markdown patterns
 */
export function looksLikeMarkdown(text: string): boolean {
  if (!text || text.trim().length === 0) {
    return false;
  }

  const markdownPatterns = [
    /^#{1,6}\s+.+/m, // Headings
    /\*\*[^*]+\*\*/m, // Bold with **
    /__[^_]+__/m, // Bold with __
    /\*[^*]+\*/m, // Italic with *
    /_[^_]+_/m, // Italic with _
    /\[.+\]\(.+\)/m, // Links [text](url)
    /^\s*[-*+]\s+/m, // Unordered lists
    /^\s*\d+\.\s+/m, // Ordered lists
    /```[\s\S]*?```/m, // Code blocks
    /`[^`]+`/m, // Inline code
    /^\s*>\s+/m, // Blockquotes
    /!\[.*\]\(.*\)/m, // Images
    /^\s*[-*_]{3,}\s*$/m, // Horizontal rules
    /^\|.+\|$/m, // Tables
  ];

  // Check if at least 2 patterns match for better accuracy
  const matchCount = markdownPatterns.filter((pattern) =>
    pattern.test(text)
  ).length;
  return matchCount >= 2 || /^#{1,6}\s+.+/m.test(text); // Or single heading pattern
}

/**
 * Check if a node type is an inline context where block-level figures can't exist
 */
function isInlineContext(nodeType?: string): boolean {
  const inlineTypes = ["text", "strong", "em", "code", "strike", "underline"];
  return nodeType ? inlineTypes.includes(nodeType) : false;
}

/**
 * Recursively transforms Image nodes to Figure nodes in parsed JSON
 * Converts markdown image syntax ![caption](url) to Figure nodes with captions
 * Handles linked images [![alt](img)](href) by extracting the href
 */
export function transformImageToFigure(
  content: JSONContent,
  parentType?: string
): JSONContent {
  if (!content) {
    return content;
  }

  // Handle link nodes that contain a single image (linked images)
  // Transform: link > image -> figure with href
  if (content.type === "link") {
    const hasOnlyImage =
      content.content &&
      content.content.length === 1 &&
      content.content[0]?.type === "image";

    if (hasOnlyImage && content.content) {
      const image = content.content[0];
      const href = content.attrs?.href;

      // Transform to figure with href
      return {
        type: "figure",
        attrs: {
          src: image?.attrs?.src || "",
          alt: image?.attrs?.alt || "",
          caption: image?.attrs?.alt || "",
          href: href || null,
        },
      };
    }
  }

  // Transform the current node if it's an image
  if (content.type === "image") {
    // Don't transform images in inline contexts (e.g., inside text, strong, etc.)
    if (isInlineContext(parentType)) {
      return content; // Keep as image
    }

    // Transform to figure (without href)
    return {
      type: "figure",
      attrs: {
        src: content.attrs?.src || "",
        alt: content.attrs?.alt || "",
        caption: content.attrs?.alt || "", // Use alt text as caption
        href: null,
      },
    };
  }

  // Recursively transform children, passing current node type as parent
  if (content.content && Array.isArray(content.content)) {
    return {
      ...content,
      content: content.content.map((child) =>
        transformImageToFigure(child, content.type)
      ),
    };
  }

  return content;
}

/**
 * Lifts figures out of paragraphs.
 * If a paragraph contains a figure, it splits the paragraph into multiple nodes:
 * segments of text (as separate paragraphs) and the figure interlaced.
 * This ensures figures (block nodes) are not nested inside paragraphs.
 */
function liftFiguresFromParagraphs(
  content: JSONContent
): JSONContent | JSONContent[] {
  if (!content) {
    return content;
  }

  // If this is a paragraph that might contain figures
  if (
    content.type === "paragraph" &&
    content.content &&
    Array.isArray(content.content)
  ) {
    const hasFigure = content.content.some((child) => child.type === "figure");

    if (hasFigure) {
      const newNodes: JSONContent[] = [];
      let currentBuffer: JSONContent[] = [];

      for (const child of content.content) {
        if (child.type === "figure") {
          // If we have text accumulated, push it as a paragraph first
          if (currentBuffer.length > 0) {
            newNodes.push({
              type: "paragraph",
              content: currentBuffer,
            });
            currentBuffer = [];
          }
          // Push the figure itself (now a top-level block sibling)
          newNodes.push(child);
        } else {
          // Accumulate non-figure nodes (text, etc.)
          currentBuffer.push(child);
        }
      }

      // Push remaining text if any
      if (currentBuffer.length > 0) {
        newNodes.push({
          type: "paragraph",
          content: currentBuffer,
        });
      }

      return newNodes;
    }
  }

  // Recursively process children
  if (content.content && Array.isArray(content.content)) {
    // Process each child and flatten the results (in case a child became multiple nodes)
    const newContent = content.content.flatMap((child) => {
      const result = liftFiguresFromParagraphs(child);
      return Array.isArray(result) ? result : [result];
    });

    return {
      ...content,
      content: newContent,
    };
  }

  return content;
}

/**
 * Transforms an array of JSON content, converting images to figures
 * and lifting figures out of invalid contexts
 */
export function transformContent(
  json: JSONContent | JSONContent[]
): JSONContent | JSONContent[] {
  if (Array.isArray(json)) {
    // First transform images to figures
    const transformed = json.map((item) => transformImageToFigure(item));
    // Then lift figures out of paragraphs
    return transformed.flatMap((item) => {
      const result = liftFiguresFromParagraphs(item);
      return Array.isArray(result) ? result : [result];
    });
  }
  // First transform images to figures
  const transformed = transformImageToFigure(json);
  // Then lift figures out of paragraphs
  return liftFiguresFromParagraphs(transformed);
}
