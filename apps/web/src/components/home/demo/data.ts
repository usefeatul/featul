export type DemoStatus =
  | "planned"
  | "progress"
  | "review"
  | "completed"
  | "pending"
  | "closed";

export type DemoView = "requests" | "roadmap" | "changelog";

export type DemoPost = {
  id: string;
  title: string;
  status: DemoStatus;
  upvotes: number;
  hasVoted?: boolean;
  comments: number;
  date: string;
  author: string;
  board: "Features" | "Bugs";
  excerpt: string;
};

export const DEMO_STATUS_LABELS: Record<DemoStatus, string> = {
  planned: "Planned",
  progress: "Progress",
  review: "Review",
  completed: "Completed",
  pending: "Pending",
  closed: "Closed",
};

export const DEMO_POSTS: DemoPost[] = [
  {
    id: "p1",
    title: "Slack notifications for new feedback",
    status: "progress",
    upvotes: 196,
    comments: 9,
    date: "Sep 24",
    author: "Maya Chen",
    board: "Features",
    excerpt:
      "Send a message to a Slack channel whenever a new post is created so the team never misses feedback.",
  },
  {
    id: "p2",
    title: "Dark mode for the public board",
    status: "planned",
    upvotes: 148,
    comments: 12,
    date: "Sep 23",
    author: "Leo Park",
    board: "Features",
    excerpt:
      "Respect the visitor's system theme on the public feedback board and widget.",
  },
  {
    id: "p3",
    title: "Vote counts are wrong after merging posts",
    status: "review",
    upvotes: 126,
    comments: 9,
    date: "Sep 23",
    author: "Ana Sousa",
    board: "Bugs",
    excerpt:
      "When two posts are merged the vote totals from the duplicate are not carried over.",
  },
  {
    id: "p4",
    title: "Weekly digest email for admins",
    status: "planned",
    upvotes: 96,
    comments: 5,
    date: "Sep 20",
    author: "Tom Ellis",
    board: "Features",
    excerpt:
      "A short weekly summary of top posts, new comments and status changes for workspace admins.",
  },
  {
    id: "p5",
    title: "Import feedback from CSV",
    status: "completed",
    upvotes: 87,
    comments: 4,
    date: "Sep 18",
    author: "Jean Daly",
    board: "Features",
    excerpt:
      "Bring existing feedback from other tools by uploading a CSV with titles, votes and authors.",
  },
  {
    id: "p6",
    title: "Widget is slow to open on mobile Safari",
    status: "progress",
    upvotes: 74,
    comments: 6,
    date: "Sep 16",
    author: "Maya Chen",
    board: "Bugs",
    excerpt:
      "The embedded widget takes a couple of seconds to open on iOS. Users report a visible delay.",
  },
  {
    id: "p7",
    title: "Public API for posts and votes",
    status: "review",
    upvotes: 61,
    comments: 3,
    date: "Sep 14",
    author: "Leo Park",
    board: "Features",
    excerpt:
      "Read and create posts programmatically so teams can build their own automations.",
  },
  {
    id: "p8",
    title: "Custom statuses per board",
    status: "pending",
    upvotes: 42,
    comments: 2,
    date: "Sep 11",
    author: "Ana Sousa",
    board: "Features",
    excerpt:
      "Let each board define its own workflow statuses instead of the global set.",
  },
  {
    id: "p9",
    title: "Changelog RSS feed",
    status: "completed",
    upvotes: 35,
    comments: 1,
    date: "Sep 08",
    author: "Tom Ellis",
    board: "Features",
    excerpt:
      "Expose published changelog entries as an RSS feed for subscribers.",
  },
  {
    id: "p10",
    title: "Duplicate posts when submitting twice",
    status: "closed",
    upvotes: 18,
    comments: 2,
    date: "Sep 04",
    author: "Jean Daly",
    board: "Bugs",
    excerpt:
      "Double-clicking the submit button creates the same post twice on slow connections.",
  },
];

export function demoStatusCounts(): Record<DemoStatus, number> {
  const counts = {
    planned: 0,
    progress: 0,
    review: 0,
    completed: 0,
    pending: 0,
    closed: 0,
  } as Record<DemoStatus, number>;
  for (const post of DEMO_POSTS) counts[post.status] += 1;
  return counts;
}

export const DEMO_CHANGELOG = {
  title: "Multi-account management and enhanced OAuth",
  tags: ["Security", "UI"],
  date: "September 24",
  intro:
    "This week we focused on auth and account management. Teams can now switch between multiple accounts on the same device without losing session state, and the OAuth flow got a smarter account picker for Google and GitHub.",
  highlights: [
    {
      title: "Multi-account switching",
      body: "Manage several accounts on one device with instant, session-safe switching.",
    },
    {
      title: "Smarter OAuth sign-in",
      body: "Sign-in buttons now show a \u201cLast used\u201d label so returning users pick the right account first time.",
    },
    {
      title: "Rich changelog editor",
      body: "Changelog entries now support markdown formatting with Tiptap marks.",
    },
  ],
};
