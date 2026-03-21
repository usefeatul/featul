import { createUploadNode } from "../shared/create-upload-node";
import { YouTubeUploadView } from "./youtube-view";

/**
 * YouTube Upload Node Extension
 * Creates a placeholder node that renders the YouTube upload component
 * When a URL is submitted, it replaces itself with an actual YouTube embed
 */
export const YouTubeUpload = createUploadNode({
  name: "youtubeUpload",
  dataType: "youtube-upload",
  view: YouTubeUploadView,
});
