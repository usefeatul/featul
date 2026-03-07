import {
  autoUpdate,
  computePosition,
  flip,
  offset,
  shift,
  type VirtualElement,
} from "@floating-ui/dom";
import Mention from "@tiptap/extension-mention";
import { ReactRenderer } from "@tiptap/react";
import type { MentionSuggestionItem, MentionSuggestionSource } from "../../types";
import { EditorMentionMenu, type EditorMentionMenuProps, handleMentionNavigation } from "./menu-list";

export type ConfigureMentionOptions = {
  suggestions?: MentionSuggestionSource;
  char?: string;
  maxItems?: number;
  className?: string;
};

const resolveSuggestions = (
  source?: MentionSuggestionSource,
): MentionSuggestionItem[] => {
  if (!source) {
    return [];
  }

  if (typeof source === "function") {
    return source();
  }

  return source;
};

const filterMentionItems = (
  items: MentionSuggestionItem[],
  query: string,
  maxItems: number,
) => {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return items.slice(0, maxItems);
  }

  return items
    .filter((item) => {
      const haystack = `${item.label} ${item.email ?? ""}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    })
    .slice(0, maxItems);
};

/**
 * Configures Tiptap Mention extension with a Floating UI based autocomplete menu.
 */
export const configureMention = ({
  suggestions,
  char = "@",
  maxItems = 8,
  className = "mention",
}: ConfigureMentionOptions = {}) =>
  Mention.configure({
    HTMLAttributes: {
      class: className,
    },
    suggestion: {
      char,
      items: ({ query }) =>
        filterMentionItems(resolveSuggestions(suggestions), query, maxItems),
      render: () => {
        let component: ReactRenderer<EditorMentionMenuProps>;
        let cleanup: (() => void) | undefined;

        return {
          onStart: (onStartProps) => {
            if (component) {
              if (cleanup) {
                cleanup();
              }
              if (component.element.parentNode) {
                component.element.parentNode.removeChild(component.element);
              }
              component.destroy();
            }

            component = new ReactRenderer(EditorMentionMenu, {
              props: {
                ...onStartProps,
                isLoading: true,
              },
              editor: onStartProps.editor,
            });

            const referenceElement: VirtualElement = {
              getBoundingClientRect: () =>
                onStartProps.clientRect?.() || new DOMRect(),
            };

            cleanup = autoUpdate(referenceElement, component.element, () => {
              computePosition(referenceElement, component.element, {
                placement: "bottom-start",
                middleware: [offset(6), flip(), shift({ padding: 8 })],
              }).then(({ x, y }) => {
                Object.assign(component.element.style, {
                  left: `${x}px`,
                  top: `${y}px`,
                  position: "absolute",
                });
                component.updateProps({ isLoading: false });
              });
            });

            if (!component.element.parentNode) {
              document.body.appendChild(component.element);
            }
          },

          onUpdate(onUpdateProps) {
            component.updateProps(onUpdateProps);
          },

          onKeyDown(onKeyDownProps) {
            if (onKeyDownProps.event.key === "Escape") {
              if (cleanup) {
                cleanup();
              }
              if (component.element.parentNode) {
                component.element.parentNode.removeChild(component.element);
              }
              component.destroy();
              return true;
            }

            return handleMentionNavigation(onKeyDownProps.event) ?? false;
          },

          onExit() {
            if (cleanup) {
              cleanup();
            }
            if (component.element.parentNode) {
              component.element.parentNode.removeChild(component.element);
            }
            component.destroy();
          },
        };
      },
    },
  });

export default configureMention;
