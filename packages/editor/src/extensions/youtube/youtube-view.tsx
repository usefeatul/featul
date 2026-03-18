import type { NodeViewProps } from "@tiptap/core";
import { NodeViewWrapper } from "@tiptap/react";
import { useCallback } from "react";
import { EditorNodeViewWrapper } from "../../components/shared/node-view-wrapper";
import { YouTubeComp } from "./youtube-comp";
import { extractYouTubeVideoId } from "./youtube-utils";

export const YouTubeUploadView = ({
	getPos,
	editor,
	node,
	updateAttributes,
}: NodeViewProps) => {
	const currentUrl =
		node?.attrs && typeof node.attrs.src === "string" ? node.attrs.src : "";

	const onUrlChange = useCallback(
		(url: string) => {
			updateAttributes?.({ src: url });
		},
		[updateAttributes],
	);

	const onSubmit = useCallback(
		(url: string) => {
			if (url && typeof getPos === "function") {
				const pos = getPos();
				if (typeof pos === "number") {
					// Replace the youtubeUpload node with an actual YouTube embed
					editor
						.chain()
						.focus()
						.deleteRange({ from: pos, to: pos + 1 })
						.setYoutubeVideo({ src: url })
						.run();
				}
			}
		},
		[getPos, editor],
	);

	const onCancel = useCallback(() => {
		if (typeof getPos === "function") {
			const pos = getPos();
			if (typeof pos === "number") {
				// Remove the placeholder node
				editor
					.chain()
					.focus()
					.deleteRange({ from: pos, to: pos + 1 })
					.run();
			}
		}
	}, [getPos, editor]);

	if (!editor.isEditable) {
		const videoId = extractYouTubeVideoId(currentUrl);
		if (!videoId) {
			return null;
		}

		return (
			<NodeViewWrapper className="my-5">
				<div data-youtube-video="">
					<iframe
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
						allowFullScreen
						frameBorder="0"
						src={`https://www.youtube.com/embed/${videoId}`}
						title="YouTube video player"
					/>
				</div>
			</NodeViewWrapper>
		);
	}

	return (
		<EditorNodeViewWrapper data-drag-handle>
			<YouTubeComp
				autoFocus={editor.isEditable}
				initialUrl={currentUrl}
				onCancel={onCancel}
				onSubmit={onSubmit}
				onUrlChange={onUrlChange}
			/>
		</EditorNodeViewWrapper>
	);
};
