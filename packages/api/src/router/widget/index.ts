import { j } from "../../jstack";
import { widgetChangelog } from "./changelog";
import { widgetComments, widgetCreateComment } from "./comments";
import { widgetConfig, widgetIdentify, widgetSessionIdentity } from "./config";
import { widgetCreate, widgetPost, widgetPosts, widgetSimilar } from "./posts";
import { widgetRoadmap } from "./roadmap";
import { widgetUploadImage } from "./storage";
import { widgetVote, widgetVoteComment } from "./votes";

export function createWidgetRouter() {
  return j.router({
    config: widgetConfig,
    identify: widgetIdentify,
    sessionIdentity: widgetSessionIdentity,
    posts: widgetPosts,
    post: widgetPost,
    similar: widgetSimilar,
    uploadImage: widgetUploadImage,
    create: widgetCreate,
    vote: widgetVote,
    comments: widgetComments,
    createComment: widgetCreateComment,
    voteComment: widgetVoteComment,
    roadmap: widgetRoadmap,
    changelog: widgetChangelog,
  });
}
