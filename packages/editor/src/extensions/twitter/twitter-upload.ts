import { createUploadNode } from "../shared/create-upload-node";
import { TwitterUploadView } from "./twitter-view";

/**
 * Twitter Upload Node Extension
 * Creates a placeholder node that renders the Twitter upload component
 * When a URL is submitted, it replaces itself with an actual Twitter embed
 */
export const TwitterUpload = createUploadNode({
  name: "twitterUpload",
  dataType: "twitter-upload",
  view: TwitterUploadView,
});
