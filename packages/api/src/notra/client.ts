import { Notra } from "@usenotra/sdk";
import {
  ErrorResponse,
  NotraError as NotraSdkError,
} from "@usenotra/sdk/models/errors";
import type {
  ListPostsRequest,
  ListPostsResponse,
} from "@usenotra/sdk/models/operations";

export type NotraPostStatus = "draft" | "published";
export type NotraContentType = "changelog" | "linkedin_post";

export type NotraPost = {
  id: string;
  title: string;
  content: string;
  markdown: string;
  status: NotraPostStatus;
  createdAt: string;
  updatedAt: string;
};

export type NotraListPostsResponse = {
  posts: NotraPost[];
  pagination: {
    nextPage: number | null;
  };
};

export class NotraApiError extends Error {
  status: number;
  retryAfterSeconds: number | null;

  constructor(
    status: number,
    message: string,
    retryAfterSeconds: number | null = null,
  ) {
    super(message);
    this.name = "NotraApiError";
    this.status = status;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

const NOTRA_FETCH_TIMEOUT_MS = 12_000;

type NotraListPostsClient = {
  listPosts(request: ListPostsRequest): Promise<ListPostsResponse>;
};

export type NotraClientFactory = (apiKey: string) => NotraListPostsClient;

export function createNotraClient(apiKey: string): NotraListPostsClient {
  const sdk = new Notra({
    bearerAuth: apiKey,
    timeoutMs: NOTRA_FETCH_TIMEOUT_MS,
  });

  return {
    listPosts(request) {
      return sdk.content.listPosts(request);
    },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function readStatus(value: string): NotraPostStatus {
  return value === "draft" ? "draft" : "published";
}

function readNextPage(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  if (value < 1) return null;
  return Math.floor(value);
}

function parseNotraListPostsResponse(
  payload: ListPostsResponse,
): NotraListPostsResponse {
  const posts: NotraPost[] = payload.posts
    .map((post) => {
      const id = post.id.trim();
      if (!id) return null;
      return {
        id,
        title: post.title.trim() || "Untitled update",
        content: post.content,
        markdown: post.markdown,
        status: readStatus(post.status),
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      };
    })
    .filter((post): post is NotraPost => post !== null);

  return {
    posts,
    pagination: { nextPage: readNextPage(payload.pagination.nextPage) },
  };
}

function parseErrorMessage(body: string): string {
  try {
    const parsed = JSON.parse(body) as unknown;
    if (!isRecord(parsed)) return "";
    const message = readString(parsed.error).trim();
    if (message) return message;
    return readString(parsed.message).trim();
  } catch {
    return "";
  }
}

function parseRetryAfterSeconds(value: string | null): number | null {
  if (!value) return null;
  const parsed = Number.parseInt(value.trim(), 10);
  if (!Number.isFinite(parsed) || parsed < 1) return null;
  return parsed;
}

export function mapNotraError(error: unknown): NotraApiError {
  if (error instanceof ErrorResponse) {
    return new NotraApiError(
      error.statusCode,
      error.error?.trim() || error.message || "Request to Notra failed",
      parseRetryAfterSeconds(error.headers.get("retry-after")),
    );
  }

  if (error instanceof NotraSdkError) {
    const parsedMessage = parseErrorMessage(error.body);
    return new NotraApiError(
      error.statusCode,
      parsedMessage || error.message || "Request to Notra failed",
      parseRetryAfterSeconds(error.headers.get("retry-after")),
    );
  }

  return new NotraApiError(502, "Request to Notra failed");
}

export async function listNotraPostsPage(input: {
  client: NotraListPostsClient;
  organizationId: string;
  page: number;
  limit: number;
  status: NotraPostStatus[];
  contentType?: NotraContentType[];
}): Promise<NotraListPostsResponse> {
  try {
    const response = await input.client.listPosts({
      organizationId: input.organizationId,
      sort: "desc",
      page: input.page,
      limit: input.limit,
      status: input.status,
      contentType: input.contentType ?? ["changelog"],
    });

    return parseNotraListPostsResponse(response);
  } catch (error) {
    throw mapNotraError(error);
  }
}
