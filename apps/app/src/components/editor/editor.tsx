"use client";

import {
	EditorBubbleMenu,
	EditorClearFormatting,
	EditorContext,
	EditorLinkSelector,
	EditorMarkBold,
	EditorMarkCode,
	EditorMarkHighlight,
	EditorMarkItalic,
	EditorMarkStrike,
	EditorMarkSubscript,
	EditorMarkSuperscript,
	EditorMarkTextColor,
	EditorMarkUnderline,
	EditorNodeBulletList,
	EditorNodeCode,
	EditorContent as TiptapEditorContent,
	EditorNodeHeading1,
	EditorNodeHeading2,
	EditorNodeHeading3,
	EditorNodeOrderedList,
	EditorNodeQuote,
	EditorNodeTaskList,
	EditorNodeText,
	EditorSelector,
	EditorTableMenus,
	useCurrentEditor,
	useFeatulEditor as usefeatulEditor,
	type Editor as TiptapEditor,
	type AdditionalSlashSuggestionsSource,
	type JSONContent,
	type MentionSuggestionItem,
} from "@featul/editor";
import {
	forwardRef,
	type ForwardedRef,
	useCallback,
	useImperativeHandle,
	useRef,
} from "react";

/**
 * Feed Editor Menus and Content
 *
 * This component provides the editor menus (bubble menu, table menus) and content.
 * It relies on the editor instance from context (EditorContext / useFeatulEditor).
 */
function FeedEditorMenus() {
	const { editor } = useCurrentEditor();
	const contentEditor: TiptapEditor | null = editor;

	if (!contentEditor) {
		return null;
	}

	return (
		<>
			<EditorBubbleMenu>
				<EditorSelector title="Text">
					<EditorNodeText />
					<EditorNodeHeading1 />
					<EditorNodeHeading2 />
					<EditorNodeHeading3 />
					<EditorNodeBulletList />
					<EditorNodeOrderedList />
					<EditorNodeTaskList />
					<EditorNodeQuote />
					<EditorNodeCode />
				</EditorSelector>

				<EditorSelector title="Format">
					<EditorMarkBold />
					<EditorMarkItalic />
					<EditorMarkUnderline />
					<EditorMarkStrike />
					<EditorMarkCode />
					<EditorMarkSuperscript />
					<EditorMarkSubscript />
				</EditorSelector>

				<EditorMarkTextColor />
				<EditorMarkHighlight />

				<EditorLinkSelector />

				<EditorClearFormatting />
			</EditorBubbleMenu>

			<div className="prose prose-neutral dark:prose-invert max-w-none focus:outline-none min-h-[200px] [&_a]:cursor-pointer [&_a]:text-primary [&_a]:font-medium [&_a]:underline [&_a]:decoration-primary/40 [&_a:hover]:decoration-primary [&_a[href*='github.com']]:rounded [&_a[href*='github.com']]:bg-primary/5 [&_a[href*='github.com']]:px-1 [&_a[href*='github.com']]:py-0.5 [&_a[href*='github.com']]:font-semibold">
				<TiptapEditorContent editor={contentEditor} />
			</div>

			<EditorTableMenus />
		</>
	);
}

export interface FeedEditorRef {
	focus: () => void;
	getContent: () => JSONContent | undefined;
	getMarkdown: () => string | undefined;
	setContentFromMarkdown: (markdown: string) => void;
	setStreamingMarkdown: (markdown: string) => void;
	beginAiStream: () => void;
	updateStreamingMarkdown: (markdown: string) => void;
}

export interface FeedEditorProps {
	initialContent?: JSONContent;
	placeholder?: string;
	className?: string;
	onUpdate?: (content: JSONContent) => void;
	editable?: boolean;
	mentionSuggestions?: MentionSuggestionItem[];
	/** Upload handler for images (slash command, drag & drop, paste) */
	onImageUpload?: (file: File) => Promise<string>;
	additionalSlashSuggestions?: AdditionalSlashSuggestionsSource;
}

/**
 * FeedEditor
 *
 * Editor wrapper used by the changelog pages.
 * Exposes an imperative ref with `focus` and `getContent`.
 */
export const FeedEditor = forwardRef(
	(
		{
			initialContent,
			placeholder = 'start typing or press "/" for command',
			className,
			onUpdate,
			editable = true,
			mentionSuggestions,
			onImageUpload,
			additionalSlashSuggestions,
		}: FeedEditorProps,
		ref: ForwardedRef<FeedEditorRef>,
	) => {
		const mentionSuggestionsRef = useRef<MentionSuggestionItem[]>(
			mentionSuggestions ?? [],
		);
		mentionSuggestionsRef.current = mentionSuggestions ?? [];
		const getMentionSuggestions = useCallback(
			() => mentionSuggestionsRef.current,
			[],
		);
		const streamStateRef = useRef({
			lastAppliedLength: 0,
			lastGoodMarkdown: "",
		});

		const editor = usefeatulEditor({
			content: initialContent,
			placeholder,
			editable,
			imageUpload: onImageUpload ? { upload: onImageUpload } : undefined,
			mentionSuggestions: getMentionSuggestions,
			additionalSlashSuggestions,
			onUpdate: ({ editor }) => {
				onUpdate?.(editor.getJSON());
			},
		});

		useImperativeHandle(
			ref,
			() => ({
				focus: () => {
					editor?.chain().focus().run();
				},
				getContent: () => editor?.getJSON(),
				getMarkdown: () => editor?.getMarkdown(),
				setContentFromMarkdown: (markdown: string) => {
					if (!editor) return;
					editor.commands.setContent(markdown, { contentType: "markdown" });
				},
				setStreamingMarkdown: (markdown: string) => {
					if (!editor) return;
					editor.commands.setContent(markdown, {
						contentType: "markdown",
						emitUpdate: true,
					});
				},
				beginAiStream: () => {
					if (!editor) return;
					streamStateRef.current = {
						lastAppliedLength: 0,
						lastGoodMarkdown: "",
					};
					editor.commands.setContent("", { emitUpdate: false });
				},
				updateStreamingMarkdown: (markdown: string) => {
					if (!editor || !markdown.trim()) return;

					const state = streamStateRef.current;
					if (markdown.length <= state.lastAppliedLength) return;

					const grewBy = markdown.length - state.lastAppliedLength;
					const isFirstUpdate = state.lastAppliedLength === 0;
					const onBoundary =
						markdown.endsWith("\n\n") ||
						(markdown.endsWith("\n") && grewBy >= 12);

					if (isFirstUpdate) {
						if (markdown.trim().length < 16) return;
					} else if (!onBoundary && grewBy < 48) {
						return;
					}

					const prevTextLen = editor.state.doc.textContent.length;
					editor.commands.setContent(markdown, {
						contentType: "markdown",
						emitUpdate: false,
					});
					const nextTextLen = editor.state.doc.textContent.length;

					if (nextTextLen === 0 && markdown.trim().length > 0) {
						if (state.lastGoodMarkdown) {
							editor.commands.setContent(state.lastGoodMarkdown, {
								contentType: "markdown",
								emitUpdate: false,
							});
						}
						return;
					}

					if (prevTextLen > 30 && nextTextLen < prevTextLen * 0.5) {
						if (state.lastGoodMarkdown) {
							editor.commands.setContent(state.lastGoodMarkdown, {
								contentType: "markdown",
								emitUpdate: false,
							});
						}
						return;
					}

					state.lastAppliedLength = markdown.length;
					state.lastGoodMarkdown = markdown;
				},
			}),
			[editor],
		);

		if (!editor) {
			return null;
		}

		return (
			<EditorContext.Provider value={{ editor }}>
				<div className={className}>
					<FeedEditorMenus />
				</div>
			</EditorContext.Provider>
		);
	},
);

FeedEditor.displayName = "FeedEditor";

export default FeedEditor;
