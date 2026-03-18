import type { NodeViewProps } from "@tiptap/core";
import { NodeViewWrapper } from "@tiptap/react";
import { useCallback } from "react";
import { Tweet } from "react-tweet";
import { EditorNodeViewWrapper } from "../../components/shared/node-view-wrapper";
import { TwitterComp } from "./twitter-comp";
import { extractTweetId } from "./twitter-utils";

export const TwitterUploadView = ({
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
					// Replace the twitterUpload node with an actual Twitter embed
					editor
						.chain()
						.focus()
						.deleteRange({ from: pos, to: pos + 1 })
						.setTweet({ src: url })
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
		const tweetId = extractTweetId(currentUrl);
		if (!tweetId) {
			return null;
		}

		return (
			<NodeViewWrapper className="my-5">
				<div data-twitter="">
					<Tweet id={tweetId} />
				</div>
			</NodeViewWrapper>
		);
	}

	return (
		<EditorNodeViewWrapper data-drag-handle>
			<TwitterComp
				autoFocus={editor.isEditable}
				initialUrl={currentUrl}
				onCancel={onCancel}
				onSubmit={onSubmit}
				onUrlChange={onUrlChange}
			/>
		</EditorNodeViewWrapper>
	);
};
