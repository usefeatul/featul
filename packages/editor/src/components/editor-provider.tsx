
import {
  EditorProvider as TiptapEditorProvider,
  type EditorProviderProps as TiptapEditorProviderProps,
  type UseEditorOptions,
  useEditor,
} from "@tiptap/react";
import { ExtensionKit } from "../extensions/extension-kit";
import { handleCommandNavigation } from "../extensions/slash-command/menu-list";

export type EditorProviderProps = Omit<
  TiptapEditorProviderProps,
  "extensions"
> & {
  limit?: number;
  placeholder?: string;
  extensions?: any[];
};

export const EditorProvider = ({
  extensions,
  limit,
  placeholder,
  onUpdate,
  ...props
}: EditorProviderProps) => {
  const defaultExtensions = ExtensionKit({ limit, placeholder });

  return (
    <TiptapEditorProvider
      editorProps={{
        handleKeyDown: (_view, event) => {
          handleCommandNavigation(event);
        },
      }}
      extensions={[...defaultExtensions, ...(extensions ?? [])]}
      immediatelyRender={false}
      onUpdate={onUpdate}
      {...props}
    />
  );
};

export { EditorContext, useCurrentEditor, useEditor } from "@tiptap/react";


export function useFeatulEditor(options: useFeatulEditorOptions) {
  const { limit, placeholder, imageUpload, extensions = [], ...restOptions } = options;
  const defaultExtensions = ExtensionKit({ limit, placeholder, imageUpload });

  const editor = useEditor({
    immediatelyRender: false,
    editorProps: {
      handleKeyDown: (_view, event) => {
        handleCommandNavigation(event);
      },
      ...restOptions.editorProps,
    },
    extensions: [...defaultExtensions, ...extensions],
    ...restOptions,
  });

  return editor;
}

export type useFeatulEditorOptions = Omit<UseEditorOptions, "extensions"> & {
  limit?: number;
  placeholder?: string;
  imageUpload?: import("../types").ImageUploadOptions;
  extensions?: any[];
};
