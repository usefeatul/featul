export type DemoStatus =
  | "planned"
  | "progress"
  | "review"
  | "completed"
  | "pending"
  | "closed";

export type DemoView = "requests" | "roadmap" | "changelog";

export type DemoRole = "admin" | "member" | "viewer";

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
  isPinned?: boolean;
  isFeatured?: boolean;
  isOwner?: boolean;
  role?: DemoRole;
};

export const DEMO_STATUS_LABELS: Record<DemoStatus, string> = {
  planned: "Planned",
  progress: "Progress",
  review: "Review",
  completed: "Completed",
  pending: "Pending",
  closed: "Closed",
};

export const DEMO_WORKSPACE = {
  name: "convex",
  plan: "Starter",
  slug: "convex",
};

const DEMO_POSTS_BY_STATUS: DemoPost[] = [
  // Progress (6)
  {
    id: "p1",
    title: "Flexible Dashboard Fix for Better User Experience",
    status: "progress",
    upvotes: 196,
    hasVoted: true,
    comments: 12,
    date: "Sep 24",
    author: "Maya Chen",
    board: "Features",
    excerpt:
      "Tighten spacing and hierarchy on the workspace dashboard so teams scan feedback faster.",
    isPinned: true,
    role: "admin",
  },
  {
    id: "p2",
    title: "Secure API Validation on Mobile Devices",
    status: "progress",
    upvotes: 148,
    comments: 9,
    date: "Sep 23",
    author: "Leo Park",
    board: "Features",
    excerpt:
      "Validate request payloads on mobile clients before they hit the public API.",
    role: "member",
  },
  {
    id: "p3",
    title: "Slack notifications for new feedback",
    status: "progress",
    upvotes: 126,
    hasVoted: true,
    comments: 9,
    date: "Sep 22",
    author: "Ana Sousa",
    board: "Features",
    excerpt:
      "Send a message to a Slack channel whenever a new post is created.",
    isFeatured: true,
    isOwner: true,
  },
  {
    id: "p4",
    title: "Widget is slow to open on mobile Safari",
    status: "progress",
    upvotes: 96,
    comments: 6,
    date: "Sep 20",
    author: "Tom Ellis",
    board: "Bugs",
    excerpt:
      "The embedded widget takes a couple of seconds to open on iOS.",
  },
  {
    id: "p5",
    title: "Bulk status updates from the request list",
    status: "progress",
    upvotes: 87,
    comments: 5,
    date: "Sep 18",
    author: "Jean Daly",
    board: "Features",
    excerpt:
      "Select multiple requests and move them to a new status in one action.",
    role: "admin",
  },
  {
    id: "p6",
    title: "Realtime vote counters without page refresh",
    status: "progress",
    upvotes: 74,
    comments: 4,
    date: "Sep 16",
    author: "Priya Nair",
    board: "Features",
    excerpt:
      "Keep upvote totals live for everyone viewing the same board.",
  },

  // Planned (5)
  {
    id: "p7",
    title: "Dark mode for the public board",
    status: "planned",
    upvotes: 168,
    hasVoted: true,
    comments: 11,
    date: "Sep 23",
    author: "Leo Park",
    board: "Features",
    excerpt:
      "Respect the visitor's system theme on the public feedback board and widget.",
    isPinned: true,
  },
  {
    id: "p8",
    title: "Weekly digest email for admins",
    status: "planned",
    upvotes: 112,
    comments: 5,
    date: "Sep 19",
    author: "Tom Ellis",
    board: "Features",
    excerpt:
      "A short weekly summary of top posts, new comments and status changes.",
    role: "member",
  },
  {
    id: "p9",
    title: "Custom domain SSL auto-renewal",
    status: "planned",
    upvotes: 91,
    comments: 3,
    date: "Sep 15",
    author: "Maya Chen",
    board: "Features",
    excerpt:
      "Renew certificates automatically so branded boards never show certificate warnings.",
  },
  {
    id: "p10",
    title: "Keyboard shortcuts for triage actions",
    status: "planned",
    upvotes: 78,
    comments: 7,
    date: "Sep 12",
    author: "Ana Sousa",
    board: "Features",
    excerpt:
      "Jump statuses, assign owners and archive posts without leaving the keyboard.",
    isFeatured: true,
  },
  {
    id: "p11",
    title: "Embeddable roadmap with live filters",
    status: "planned",
    upvotes: 65,
    comments: 2,
    date: "Sep 09",
    author: "Chris Wong",
    board: "Features",
    excerpt:
      "Drop a filtered roadmap view into docs sites with a single script tag.",
  },

  // Review (6)
  {
    id: "p12",
    title: "Vote counts are wrong after merging posts",
    status: "review",
    upvotes: 134,
    hasVoted: true,
    comments: 9,
    date: "Sep 23",
    author: "Ana Sousa",
    board: "Bugs",
    excerpt:
      "When two posts are merged the vote totals from the duplicate are not carried over.",
    role: "admin",
  },
  {
    id: "p13",
    title: "Public API for posts and votes",
    status: "review",
    upvotes: 101,
    comments: 8,
    date: "Sep 17",
    author: "Leo Park",
    board: "Features",
    excerpt:
      "Read and create posts programmatically so teams can build their own automations.",
    isOwner: true,
  },
  {
    id: "p14",
    title: "Mentions fail for users with special characters",
    status: "review",
    upvotes: 72,
    comments: 4,
    date: "Sep 14",
    author: "Priya Nair",
    board: "Bugs",
    excerpt:
      "Comment mentions break when display names include accents or punctuation.",
  },
  {
    id: "p15",
    title: "Board cover image cropping on retina displays",
    status: "review",
    upvotes: 58,
    comments: 3,
    date: "Sep 11",
    author: "Jean Daly",
    board: "Bugs",
    excerpt:
      "Uploaded board covers look soft on high-DPI screens after resize.",
  },
  {
    id: "p16",
    title: "Export roadmap as CSV for stakeholders",
    status: "review",
    upvotes: 49,
    comments: 2,
    date: "Sep 08",
    author: "Tom Ellis",
    board: "Features",
    excerpt:
      "Download the current roadmap columns as a spreadsheet for offline reviews.",
    role: "viewer",
  },
  {
    id: "p17",
    title: "Duplicate tags appear after renaming",
    status: "review",
    upvotes: 41,
    comments: 5,
    date: "Sep 06",
    author: "Chris Wong",
    board: "Bugs",
    excerpt:
      "Renaming a tag sometimes leaves the old label attached to posts.",
  },

  // Completed (4)
  {
    id: "p18",
    title: "Import feedback from CSV",
    status: "completed",
    upvotes: 143,
    hasVoted: true,
    comments: 10,
    date: "Sep 18",
    author: "Jean Daly",
    board: "Features",
    excerpt:
      "Bring existing feedback from other tools by uploading a CSV with titles and votes.",
    isFeatured: true,
    isOwner: true,
  },
  {
    id: "p19",
    title: "Changelog RSS feed",
    status: "completed",
    upvotes: 88,
    comments: 4,
    date: "Sep 10",
    author: "Tom Ellis",
    board: "Features",
    excerpt: "Expose published changelog entries as an RSS feed for subscribers.",
  },
  {
    id: "p20",
    title: "Passkey sign-in for workspace admins",
    status: "completed",
    upvotes: 76,
    comments: 6,
    date: "Sep 05",
    author: "Maya Chen",
    board: "Features",
    excerpt:
      "Allow admins to authenticate with passkeys instead of passwords.",
    role: "admin",
  },
  {
    id: "p21",
    title: "Fix truncated titles on the public widget",
    status: "completed",
    upvotes: 54,
    comments: 2,
    date: "Aug 29",
    author: "Leo Park",
    board: "Bugs",
    excerpt:
      "Long request titles no longer clip mid-word inside the embed.",
  },

  // Pending (7)
  {
    id: "p22",
    title: "Custom statuses per board",
    status: "pending",
    upvotes: 97,
    comments: 7,
    date: "Sep 21",
    author: "Ana Sousa",
    board: "Features",
    excerpt:
      "Let each board define its own workflow statuses instead of the global set.",
  },
  {
    id: "p23",
    title: "Zapier trigger when a post is completed",
    status: "pending",
    upvotes: 83,
    comments: 3,
    date: "Sep 17",
    author: "Chris Wong",
    board: "Features",
    excerpt:
      "Fire a Zapier event so teams can sync completed work to Linear or Notion.",
  },
  {
    id: "p24",
    title: "Anonymous voting on public boards",
    status: "pending",
    upvotes: 69,
    hasVoted: true,
    comments: 8,
    date: "Sep 13",
    author: "Priya Nair",
    board: "Features",
    excerpt:
      "Let visitors upvote without creating an account while still rate-limiting abuse.",
  },
  {
    id: "p25",
    title: "Multi-language board labels",
    status: "pending",
    upvotes: 57,
    comments: 2,
    date: "Sep 10",
    author: "Tom Ellis",
    board: "Features",
    excerpt:
      "Translate status and board names for international product teams.",
  },
  {
    id: "p26",
    title: "GitHub issue sync for linked posts",
    status: "pending",
    upvotes: 51,
    comments: 4,
    date: "Sep 07",
    author: "Jean Daly",
    board: "Features",
    excerpt:
      "Keep Featul statuses in sync when linked GitHub issues close.",
    role: "member",
  },
  {
    id: "p27",
    title: "Smarter spam detection on new submissions",
    status: "pending",
    upvotes: 44,
    comments: 1,
    date: "Sep 03",
    author: "Maya Chen",
    board: "Features",
    excerpt:
      "Flag low-quality or repeated submissions before they hit the board.",
  },
  {
    id: "p28",
    title: "Assign multiple owners to a single request",
    status: "pending",
    upvotes: 36,
    comments: 3,
    date: "Aug 31",
    author: "Leo Park",
    board: "Features",
    excerpt:
      "Support co-owners so design and engineering can share responsibility.",
  },

  // Closed (7)
  {
    id: "p29",
    title: "Duplicate posts when submitting twice",
    status: "closed",
    upvotes: 62,
    comments: 5,
    date: "Sep 04",
    author: "Jean Daly",
    board: "Bugs",
    excerpt:
      "Double-clicking the submit button creates the same post twice on slow connections.",
  },
  {
    id: "p30",
    title: "Native desktop notifications for mentions",
    status: "closed",
    upvotes: 47,
    comments: 2,
    date: "Aug 28",
    author: "Ana Sousa",
    board: "Features",
    excerpt:
      "Push OS notifications when someone is mentioned in a comment thread.",
  },
  {
    id: "p31",
    title: "Legacy IE11 support for the embed",
    status: "closed",
    upvotes: 19,
    comments: 1,
    date: "Aug 22",
    author: "Chris Wong",
    board: "Features",
    excerpt: "Dropping support for obsolete browsers in favor of modern embeds.",
  },
  {
    id: "p32",
    title: "SMS alerts for critical status changes",
    status: "closed",
    upvotes: 28,
    comments: 3,
    date: "Aug 19",
    author: "Priya Nair",
    board: "Features",
    excerpt:
      "Text message alerts were deferred in favor of email and Slack digests.",
  },
  {
    id: "p33",
    title: "Auto-close inactive requests after 90 days",
    status: "closed",
    upvotes: 33,
    comments: 4,
    date: "Aug 15",
    author: "Tom Ellis",
    board: "Features",
    excerpt:
      "Closed after feedback that teams prefer manual archival control.",
  },
  {
    id: "p34",
    title: "Forum-style nested comment threads",
    status: "closed",
    upvotes: 41,
    comments: 6,
    date: "Aug 11",
    author: "Maya Chen",
    board: "Features",
    excerpt:
      "Nested replies conflicted with the current mention and moderation model.",
  },
  {
    id: "p35",
    title: "Printable PDF export of the changelog",
    status: "closed",
    upvotes: 22,
    comments: 1,
    date: "Aug 07",
    author: "Leo Park",
    board: "Features",
    excerpt:
      "PDF export was superseded by the public changelog page and RSS feed.",
  },
];

/** Mixed status order for the dashboard list (by votes), not grouped by color. */
export const DEMO_POSTS: DemoPost[] = [...DEMO_POSTS_BY_STATUS].sort(
  (a, b) => b.upvotes - a.upvotes || a.id.localeCompare(b.id)
);

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
  tags: ["Security", "UI", "Auth"],
  date: "September 24",
  intro:
    "This week we focused on auth and account management. Teams can now switch between multiple accounts on the same device without losing session state, and the OAuth flow got a smarter account picker for Google and GitHub. We also shipped editor polish, faster board loading, and a handful of fixes that came straight from customer feedback.",
  highlights: [
    {
      title: "Multi-account switching",
      body: "Manage several accounts on one device with instant, session-safe switching. Your last active workspace is restored automatically after each hop.",
    },
    {
      title: "Smarter OAuth sign-in",
      body: "Sign-in buttons now show a \u201cLast used\u201d label so returning users pick the right account first time.",
    },
    {
      title: "Rich changelog editor",
      body: "Changelog entries now support markdown formatting with Tiptap marks, images, and callout blocks.",
    },
    {
      title: "Passkey-ready sessions",
      body: "Admins can register a passkey once and skip password prompts on trusted devices.",
    },
  ],
  improvements: [
    {
      title: "Faster public boards",
      body: "First paint on large boards is about 35% quicker thanks to leaner vote aggregates.",
    },
    {
      title: "Workspace invite links",
      body: "Share a single invite URL with an expiry date instead of emailing members one by one.",
    },
    {
      title: "Keyboard triage",
      body: "Press J / K to move between requests and 1\u20136 to jump statuses without leaving the list.",
    },
    {
      title: "Branding preview",
      body: "Logo and accent color changes now preview live on the public board before you publish.",
    },
  ],
  fixes: [
    {
      title: "Merged vote totals",
      body: "Merging two posts now carries every upvote forward instead of dropping the duplicate count.",
    },
    {
      title: "Mention accents",
      body: "Comment mentions work again for display names with accents or punctuation.",
    },
    {
      title: "Widget open delay",
      body: "The embed no longer stalls for a second on mobile Safari before the sheet appears.",
    },
    {
      title: "Retina board covers",
      body: "Uploaded cover images stay sharp on high-DPI displays after resize.",
    },
  ],
  closing:
    "That is everything for this release. If something still feels off, drop a note on your board or ping us in the in-app chat \u2014 we read every thread.",
};
