import { Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import type { ComponentType } from "react";

type CreateUploadNodeOptions = {
  name: string;
  dataType: string;
  view: ComponentType<any>;
};

export function createUploadNode({
  name,
  dataType,
  view,
}: CreateUploadNodeOptions) {
  return Node.create({
    name,

    group: "block",

    atom: true,

    addAttributes() {
      return {
        src: {
          default: null,
          parseHTML: (element: HTMLElement) => element.getAttribute("data-src"),
          renderHTML: (attributes: { src?: string | null }) => {
            if (!attributes.src) {
              return {};
            }

            return {
              "data-src": attributes.src,
            };
          },
        },
      };
    },

    addNodeView() {
      return ReactNodeViewRenderer(view);
    },

    parseHTML() {
      return [
        {
          tag: `div[data-type="${dataType}"]`,
        },
      ];
    },

    renderHTML({ HTMLAttributes }) {
      return ["div", { "data-type": dataType, ...HTMLAttributes }];
    },
  });
}
