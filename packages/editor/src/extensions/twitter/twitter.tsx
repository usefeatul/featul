/** biome-ignore-all lint/style/useConsistentTypeDefinitions: <> */
import { mergeAttributes, Node, nodePasteRule } from "@tiptap/core";
import {
	NodeViewWrapper,
	ReactNodeViewRenderer,
	type ReactNodeViewRendererOptions,
} from "@tiptap/react";
import { Tweet } from "react-tweet";
import {
	extractTweetId,
	normalizeTwitterUrl,
	TWITTER_URL_GLOBAL_REGEX,
} from "./twitter-utils";

const TweetComponent = ({
	node,
}: {
	node: Partial<ReactNodeViewRendererOptions>;
}) => {
	const attrs = node?.attrs;
	const url =
		attrs &&
		typeof attrs === "object" &&
		"src" in attrs &&
		typeof attrs.src === "string"
			? attrs.src
			: null;
	const tweetId = url ? extractTweetId(url) : null;

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
};

export interface TwitterOptions {
	/**
	 * Controls if the paste handler for tweets should be added.
	 * @default true
	 * @example false
	 */
	addPasteHandler: boolean;

	HTMLAttributes: Record<string, string>;

	/**
	 * Controls if the twitter node should be inline or not.
	 * @default false
	 * @example true
	 */
	inline: boolean;

	/**
	 * The origin of the tweet.
	 * @default ''
	 * @example 'https://tiptap.dev'
	 */
	origin: string;
}

/**
 * The options for setting a tweet.
 */
type SetTweetOptions = { src: string };

declare module "@tiptap/core" {
	interface Commands<ReturnType> {
		twitter: {
			/**
			 * Insert a tweet
			 * @param options The tweet attributes
			 * @example editor.commands.setTweet({ src: 'https://x.com/seanpk/status/1800145949580517852' })
			 */
			setTweet: (options: SetTweetOptions) => ReturnType;
		};
	}
}

/**
 * This extension adds support for tweets.
 */
export const Twitter = Node.create<TwitterOptions>({
	name: "twitter",

	addOptions() {
		return {
			addPasteHandler: true,
			HTMLAttributes: {},
			inline: false,
			origin: "",
		};
	},

	addNodeView() {
		return ReactNodeViewRenderer(TweetComponent, {
			attrs: this.options.HTMLAttributes,
		});
	},

	inline() {
		return this.options.inline;
	},

	group() {
		return this.options.inline ? "inline" : "block";
	},

	draggable: true,

	addAttributes() {
		return {
			src: {
				default: null,
				parseHTML: (element) => element.getAttribute("data-src"),
				renderHTML: (attributes) => {
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

	parseHTML() {
		return [
			{
				tag: "div[data-twitter]",
			},
		];
	},

	addCommands() {
		return {
			setTweet:
				(options: SetTweetOptions) =>
				({ commands }) => {
					const normalizedUrl = normalizeTwitterUrl(options.src);
					if (!normalizedUrl) {
						return false;
					}

					return commands.insertContent({
						type: this.name,
						attrs: {
							src: normalizedUrl,
						},
					});
				},
		};
	},

	addPasteRules() {
		if (!this.options.addPasteHandler) {
			return [];
		}

		return [
			nodePasteRule({
				find: TWITTER_URL_GLOBAL_REGEX,
				type: this.type,
				getAttributes: (match) => {
					const matchText = Array.isArray(match) ? match[0] : null;
					const normalizedUrl =
						typeof matchText === "string"
							? normalizeTwitterUrl(matchText)
							: null;

					return normalizedUrl ? { src: normalizedUrl } : {};
				},
			}),
		];
	},

	renderHTML({ HTMLAttributes }) {
		return ["div", mergeAttributes({ "data-twitter": "" }, HTMLAttributes)];
	},
});
