/** Mock help center copy for scripts/help/seed.ts. Bodies use the small markdown subset that script understands. */

export type SeedCollection = {
  slug: string;
  name: string;
  description: string;
  icon: "book" | "bolt" | "card" | "user" | "settings" | "puzzle" | "shield" | "chat" | "sparkles" | "bulb";
};

export type SeedArticle = {
  slug: string;
  title: string;
  summary: string;
  /** Collection slug; omitted for uncategorized articles. */
  collection?: string;
  views: number;
  /** Days since publishing. */
  age: number;
  draft?: boolean;
  body: string;
};

export const COLLECTIONS: SeedCollection[] = [
  { slug: "getting-started", name: "Getting started", description: "Set up your workspace and collect your first feedback in minutes.", icon: "sparkles" },
  { slug: "feedback-boards", name: "Feedback & boards", description: "Collect, organize and prioritize requests from your users.", icon: "chat" },
  { slug: "roadmap", name: "Roadmap", description: "Turn feedback into a public plan with statuses your users can follow.", icon: "bulb" },
  { slug: "changelog", name: "Changelog", description: "Announce what shipped and close the loop with the people who asked.", icon: "book" },
  { slug: "widget-sdk", name: "Widget & SDK", description: "Embed Featul inside your product and identify signed-in users.", icon: "bolt" },
  { slug: "branding-domains", name: "Branding & domains", description: "Make the portal look like your product and serve it from your domain.", icon: "settings" },
  { slug: "intergration", name: "Integrations", description: "Send new feedback to Slack and Discord.", icon: "puzzle" },
  { slug: "team-permissions", name: "Team & permissions", description: "Invite teammates and control what each role can do.", icon: "user" },
  { slug: "plans-billing", name: "Plans & billing", description: "Compare plans, change your subscription and manage invoices.", icon: "card" },
  { slug: "account-security", name: "Account, security & data", description: "Sign-in methods, two-factor authentication, exports and imports.", icon: "shield" },
];

export const ARTICLES: SeedArticle[] = [
  // Getting started
  {
    slug: "what-is-featul",
    collection: "getting-started",
    title: "What is Featul?",
    summary: "A quick overview of boards, the roadmap, the changelog and the help center, and how they fit together.",
    views: 2140,
    age: 120,
    body: `
Featul is a feedback platform for product teams. It gives your users one place to suggest ideas, vote on what matters to them and see what you are building, and it gives your team the tools to turn that noise into a prioritized plan.

## The four parts of Featul

Every workspace comes with a public **portal** made of four sections:

- **Feedback boards** where users post requests and bug reports, vote and comment.
- A **roadmap** that groups requests by status so people can see what is planned, in progress and done.
- A **changelog** where you announce releases and link them back to the requests they resolve.
- A **help center** like this one, with collections of articles that answer common questions.

Your team works in the **dashboard**, which shows the same data with moderation, filtering and bulk actions.

## How feedback flows through Featul

1. A user submits a request on a board, from the widget inside your product, or you add it on their behalf.
2. Other users find it, vote on it and add context in the comments.
3. Your team reviews it, merges duplicates, tags it and sets a status such as **Planned**.
4. When it ships you publish a changelog entry, link the request, and everyone who voted can see it was delivered.

> **Tip:** Keep the loop short. Users who see their feedback acknowledged are far more likely to keep giving it.

## Where to go next

- [Create your first workspace](/help/articles/create-your-first-workspace)
- [Quick-start checklist](/help/articles/quick-start-checklist)
- [Install the widget](/help/articles/install-the-widget)
`,
  },
  {
    slug: "create-your-first-workspace",
    collection: "getting-started",
    title: "Create your first workspace",
    summary: "Pick a name and URL, choose your boards and invite your team.",
    views: 1580,
    age: 118,
    body: `
A workspace holds everything for one product: its boards, roadmap, changelog, help center, members and billing. Most companies need one workspace per product.

## Step 1: Name your workspace

Sign up at featul.com with Google, GitHub or your email address. The onboarding wizard asks for:

- **Workspace name**, shown in the portal header and in emails.
- **Workspace URL**, the subdomain your portal lives on, for example \`acme.featul.com\`. It can contain lowercase letters, numbers and hyphens.

> Some subdomains are reserved, such as \`www\`, \`app\` and \`staging\`. If the one you want is taken you will be asked to pick another.

## Step 2: Choose your boards

New workspaces start with a **Feature requests** board and a **Bugs** board. You can rename them, add more later, or make some private. See [Create and configure boards](/help/articles/create-and-configure-boards).

## Step 3: Invite your team

Add teammates by email from **Settings → Team**. Each person gets a role that controls what they can change. See [Roles and permissions](/help/articles/roles-and-permissions).

## Step 4: Share the portal

Your portal is live as soon as the workspace exists. Share the link with customers, put it in your app's menu, or embed the widget so people can give feedback without leaving your product.
`,
  },
  {
    slug: "quick-start-checklist",
    collection: "getting-started",
    title: "Quick-start checklist",
    summary: "Ten things to do in your first 30 minutes so your portal is ready for real users.",
    views: 1210,
    age: 110,
    body: `
Use this checklist to go from a blank workspace to a portal you are happy to share.

## Make it yours

1. Upload your logo and set a primary color in **Settings → Branding**.
2. Choose light, dark or system theme to match your product.
3. Optionally connect a custom domain such as \`feedback.acme.com\`.

## Set up your boards

1. Rename the default boards so they match how your users talk.
2. Decide whether each board allows anonymous posts and comments.
3. Create up to five tags, for example **Mobile**, **API** and **Integrations**.

## Seed some content

1. Add three or four requests you already know about so the portal does not look empty.
2. Move one of them to **Planned** so the roadmap has something on it.
3. Publish a short changelog entry about your most recent release.
4. Write a help article for the question your support team answers most.

> **Good to know:** You can import existing feedback from a CSV file on the Starter and Professional plans. See [Export and import data](/help/articles/export-and-import-data).
`,
  },
  {
    slug: "portal-tour",
    collection: "getting-started",
    title: "A tour of your public portal",
    summary: "What visitors see on each page of your portal and how navigation works on desktop and mobile.",
    views: 640,
    age: 95,
    body: `
Your portal is the public face of your workspace. It lives at \`your-workspace.featul.com\` or on your custom domain.

## Navigation

The header shows your logo and workspace name, plus tabs for **Feedback**, **Roadmap**, **Changelog** and **Help**. A tab only appears when it has something to show. For example, the Help tab is hidden until you publish your first article.

On mobile the board list collapses into a menu at the top of the page.

## Feedback

Visitors land on your boards. They can sort by trending, newest or most voted, filter by tag or status, and search. Selecting a request opens its detail page with the description, attachments, comments and vote count.

## Roadmap

The roadmap lists requests grouped by status. Only statuses you choose to show appear here, and only requests from public boards.

## Changelog

Entries appear newest first. Visitors can subscribe by email to hear about future releases.

## Help

The help center home lists your collections and popular articles. Each article has a table of contents, reading time and a "Was this helpful?" prompt at the bottom.
`,
  },

  // Feedback & boards
  {
    slug: "create-and-configure-boards",
    collection: "feedback-boards",
    title: "Create and configure boards",
    summary: "Add boards, control who can see and post to them, and choose what visitors can do.",
    views: 980,
    age: 100,
    body: `
Boards are buckets for feedback. Most teams use one for feature requests and one for bugs, and some add boards per product area or customer segment.

## Create a board

Go to **Settings → Feedback** and select **New board**. Give it a name. The URL slug is generated from the name and can be edited.

## Board settings

| Setting | What it does |
| --- | --- |
| Public | Visible to everyone on your portal. Private boards are only visible to members. |
| Visible | Shows the board in portal navigation. Hidden boards still work through direct links. |
| Allow anonymous | Lets visitors post and vote without signing in. |
| Allow comments | Turns the comment thread on or off for every post on the board. |
| Hide member identity | Shows teammates as your workspace name instead of their personal name. |

## Board limits

| Plan | Boards |
| --- | --- |
| Free | 5 |
| Starter | 10 |
| Professional | Unlimited |

The roadmap and changelog are system boards and do not count toward this limit.

> **Tip:** Fewer boards is usually better. If users are unsure where to post, they post nowhere.
`,
  },
  {
    slug: "submitting-feedback",
    collection: "feedback-boards",
    title: "How users submit feedback",
    summary: "The ways users can post requests, what they can attach, and how anonymous posting works.",
    views: 870,
    age: 98,
    body: `
There are three ways feedback gets into Featul.

## From the portal

Visitors select **New post** on a board, enter a title and description, and optionally attach images. If the board allows anonymous posting they can submit without an account; otherwise they are asked to sign in with Google, GitHub or a one-time email code.

As they type the title, Featul suggests similar existing posts so they can vote instead of creating a duplicate.

## From the widget

The widget lets people submit feedback without leaving your app. When you [identify users](/help/articles/identify-users), their name and email are attached automatically and they never see a sign-in prompt.

## From the dashboard

Teammates can create posts on behalf of a customer, for example after a sales call. The post is attributed to the teammate unless you change the author.

## Attachments

Images can be attached on every plan. Uploads are checked for type and size before they are stored.

> If a post contains personal or sensitive data, a member can edit it or delete it from the post's menu.
`,
  },
  {
    slug: "voting-and-prioritization",
    collection: "feedback-boards",
    title: "Voting and prioritization",
    summary: "How votes are counted, how trending works, and how to use votes without letting them decide for you.",
    views: 1320,
    age: 90,
    body: `
Votes are the fastest signal of demand. Each person can vote once per post and can remove their vote at any time.

## How votes are counted

- Signed-in users and identified widget users vote under their own account.
- On boards that allow anonymous voting, anonymous votes are tied to the visitor's browser.
- Teammates can vote too, so you can record demand you heard elsewhere.

## Sorting

| Sort | Shows first |
| --- | --- |
| Trending | Posts gaining votes and comments recently |
| Top | Posts with the most votes overall |
| Newest | Posts created most recently |

## Prioritizing well

Votes tell you how many people want something, not how much it is worth. Before planning a request, check:

1. **Who voted.** Ten votes from your biggest customers may matter more than a hundred from free trials.
2. **The comments.** The underlying problem is often more useful than the requested solution.
3. **Duplicates.** Merge them so demand is not split across several posts.

> Mark a request **Planned** only when you intend to build it. A roadmap full of maybes erodes trust.
`,
  },
  {
    slug: "tags-and-filters",
    collection: "feedback-boards",
    title: "Organize feedback with tags and filters",
    summary: "Create tags, apply them in bulk and build filtered views of your requests.",
    views: 540,
    age: 85,
    body: `
Tags group requests across boards by theme, such as **Mobile**, **Reporting** or **Enterprise**.

## Creating tags

Create tags in **Settings → Feedback → Tags**. The number of tags depends on your plan:

| Plan | Tags |
| --- | --- |
| Free | 5 |
| Starter | 10 |
| Professional | 20 |

## Applying tags

Open a post and pick tags from the sidebar, or select several posts in the requests list and apply a tag to all of them at once.

## Filtering

The requests view in the dashboard can be filtered by board, status, tag and date. Filters are kept in the URL, so you can bookmark a view or share it with a teammate.

> **Tip:** Make a weekly triage view filtered to **Pending** posts from the last seven days.
`,
  },
  {
    slug: "merging-duplicates",
    collection: "feedback-boards",
    title: "Merge duplicate requests",
    summary: "Combine posts that ask for the same thing so votes and comments stay in one place.",
    views: 610,
    age: 80,
    body: `
Duplicates split demand. When two posts ask for the same thing, merge them so the real number of people who want it is visible.

## How to merge

1. Open the duplicate post.
2. From the post menu, choose **Merge into…**
3. Search for the post you want to keep and confirm.

## What happens when you merge

- Votes move to the post you keep. People who voted on both are counted once.
- The duplicate gets a notice that links to the post you kept, so existing links still lead somewhere useful.
- The duplicate no longer appears in board lists or on the roadmap.

> Merging cannot be undone automatically. If you merge the wrong posts, contact support with both links.
`,
  },
  {
    slug: "comments-mentions-reactions",
    collection: "feedback-boards",
    title: "Comments, mentions and reactions",
    summary: "Discuss requests with users and teammates, mention people and react with emoji.",
    views: 420,
    age: 70,
    body: `
Comments are where requests get their context. Ask follow-up questions there, share workarounds and post updates.

## Mentions

Type \`@\` followed by a name to mention a teammate. They get a notification and can jump straight to the comment.

## Reactions

React to a comment with an emoji to acknowledge it without adding another reply. Reaction counts are visible to everyone.

## Turning comments off

Comments can be turned off per board in **Settings → Board Settings**. Existing comments stay visible but no one can add new ones.
`,
  },
  {
    slug: "moderation-and-reports",
    collection: "feedback-boards",
    title: "Moderation and reported content",
    summary: "Review posts and comments reported by users, and remove spam.",
    views: 260,
    age: 60,
    body: `
Anyone can report a post or comment they think is spam, abusive or off topic. Reports are collected for your team to review.

## Reviewing reports

Reported content is flagged in the dashboard. For each report you can:

- **Dismiss** it if the content is fine.
- **Edit** the content to remove personal data or offensive language.
- **Delete** it entirely.

## Who can moderate

Owners, admins and members can moderate every board. Viewers can read content but cannot change it. See [Roles and permissions](/help/articles/roles-and-permissions).

> **Tip:** If a public board attracts spam, turn off anonymous posting for that board. It stops almost all automated spam.
`,
  },

  // Roadmap
  {
    slug: "post-statuses-explained",
    collection: "roadmap",
    title: "Post statuses explained",
    summary: "What each status means, and which ones appear on the public roadmap.",
    views: 1450,
    age: 88,
    body: `
Every post has a status that tells users where it stands. Featul has six built-in statuses.

| Status | Meaning | On roadmap |
| --- | --- | --- |
| Pending | New and not reviewed yet | No |
| Review | Being evaluated by the team | Optional |
| Planned | Committed, but work has not started | Yes |
| In progress | Currently being built | Yes |
| Completed | Shipped and available | Yes |
| Closed | Will not be built, or no longer relevant | No |

## Changing a status

Open a post and pick a new status from the sidebar, or select several posts in the requests list and change them together. Everyone who voted can see the new status on the post.

## Statuses from other tools

When you import from a CSV file, common status names are mapped automatically. For example, \`backlog\` and \`todo\` become Pending, \`scheduled\` becomes Planned, and \`shipped\` and \`done\` become Completed.
`,
  },
  {
    slug: "publishing-your-roadmap",
    collection: "roadmap",
    title: "Publish your roadmap",
    summary: "Choose which statuses and boards appear on your public roadmap.",
    views: 760,
    age: 75,
    body: `
The roadmap is built from your posts, so there is nothing to maintain separately. When a post's status changes, the roadmap updates.

## Choosing what to show

In **Settings → Board Settings → Roadmap** choose which statuses appear as columns. Most teams show **Planned**, **In progress** and **Completed**.

Only posts from **public** boards appear. Posts on private boards stay internal even when their status is Planned.

## Hiding the roadmap

If you are not ready to share plans, turn the roadmap off. The tab disappears from the portal and the widget, and existing links show a not-found page.

> **Tip:** Keep the Completed column short by closing out older items after each release, ideally with a [changelog entry](/help/articles/writing-changelog-entries).
`,
  },
  {
    slug: "stale-requests",
    collection: "roadmap",
    title: "Stale requests",
    summary: "How Featul flags requests that have gone quiet so nothing is forgotten.",
    views: 310,
    age: 40,
    body: `
A request is marked **stale** when it has had no activity for 30 days and is not Completed or Closed. Activity includes new votes, comments and status changes.

## Why it matters

Stale requests are usually forgotten, not rejected. The flag gives you a regular prompt to decide: plan it, close it, or ask a follow-up question.

## Working through stale requests

1. Filter the requests list to show stale posts.
2. For each one, change the status, leave a comment, or snooze it.
3. Snoozed posts leave the stale list until the snooze ends.

> Completed and Closed posts are never marked stale.
`,
  },

  // Changelog
  {
    slug: "writing-changelog-entries",
    collection: "changelog",
    title: "Write and publish changelog entries",
    summary: "Create entries with rich content, tags and linked requests, then publish when you're ready.",
    views: 890,
    age: 65,
    body: `
The changelog is where you tell users what changed. Good entries are short, specific and link back to the requests they resolve.

## Creating an entry

1. Go to **Changelog** in the dashboard and select **New entry**.
2. Add a title and write the body. The editor supports headings, lists, images, code blocks, tables and embedded videos.
3. Add tags such as **New**, **Improved** or **Fixed**.
4. Link the requests this release resolves.
5. Save as a draft or publish immediately.

## Linking requests

Linked requests appear at the bottom of the entry, and the entry appears on each linked request, so users who voted see that their feedback shipped.

## Limits

| Plan | Entries | Changelog tags |
| --- | --- | --- |
| Free | 10 | 5 |
| Starter | 50 | 10 |
| Professional | Unlimited | 20 |

> **Writing tip:** Lead with the benefit, not the implementation. "Export reports to CSV" is better than "Added CSV serializer".
`,
  },
  {
    slug: "changelog-email-subscriptions",
    collection: "changelog",
    title: "Changelog email subscriptions",
    summary: "Let users subscribe to release emails and see how unsubscribing works.",
    views: 380,
    age: 20,
    body: `
Visitors can subscribe to your changelog from the portal. When you publish a new entry, subscribers receive it by email.

## How subscribing works

Signed-in visitors select **Subscribe** on the changelog page. Subscriptions belong to the workspace, so subscribing to one product's changelog does not subscribe someone to another.

## Unsubscribing

Every email includes a one-click unsubscribe link with a unique token. Selecting it removes the subscription immediately, without signing in.

## What gets sent

Only newly **published** entries are emailed. Saving a draft or editing an entry that is already published does not send anything.
`,
  },
  {
    slug: "ai-changelog-drafts",
    collection: "changelog",
    title: "Draft changelog entries with AI",
    summary: "Generate a first draft from the requests you shipped, then edit it in the conversation.",
    views: 520,
    age: 30,
    body: `
Writing release notes is easy to put off. The AI assistant turns the requests you shipped into a first draft you can edit.

## Generating a draft

1. Open **Changelog → New entry** and choose **Draft with AI**.
2. Select the completed requests this release includes.
3. The assistant writes a title, summary and body based on those requests and their comments.

## Refining it

The draft opens in a conversation. Ask for changes in plain language, for example:

- "Make it shorter and friendlier."
- "Add a section about the API changes."
- "Suggest tags for this entry."

Each change is applied to the draft and you can keep editing by hand at any time.

> The assistant only reads the requests you select. Nothing is published until you publish it yourself.
`,
  },
  {
    slug: "import-changelog-from-notra",
    collection: "changelog",
    title: "Import your changelog from Notra",
    summary: "Connect Notra to bring existing release notes into Featul and keep them in sync.",
    views: 150,
    age: 25,
    body: `
If you already publish release notes in Notra, you can import them instead of copying them by hand.

## Connecting Notra

1. Go to **Settings → Changelog → Import**.
2. Paste your Notra API credentials. They are encrypted before they are stored.
3. Choose which posts to import: published only, or drafts too.

## Import options

| Option | Behavior |
| --- | --- |
| Upsert | Creates new entries and updates entries imported earlier |
| Create only | Creates new entries and leaves existing ones untouched |
| Preserve status | Keeps each post's published or draft state |
| Drafts only | Imports everything as drafts so you can review first |

Imported Markdown is converted to the Featul editor format, including headings, lists, quotes and links.

> Imports are rate limited. If you see a "try again later" message, wait a few minutes and run it again.
`,
  },

  // Widget & SDK
  {
    slug: "install-the-widget",
    collection: "widget-sdk",
    title: "Install the widget",
    summary: "Add one snippet to your site to show feedback, roadmap and changelog inside your product.",
    views: 1730,
    age: 82,
    body: `
The widget brings your boards, roadmap and changelog into your product, so users can give feedback without leaving the page they are on.

## Add the snippet

Copy the snippet from **Settings → Workspace → Embed widget** and paste it before the closing \`</body>\` tag. It already includes your workspace ID.

\`\`\`html
<script>
  window.$featulq = window.$featulq || [];
  window.featul = window.featul || new Proxy({}, {
    get: (_, method) => (...args) => window.$featulq.push([method, ...args])
  });
</script>
<script async src="https://app.featul.com/widget/sdk/v1.js"></script>
<script>
  featul.init("YOUR_WORKSPACE_ID", {
    widget: true,
    theme: "dark",
    position: "right"
  });
</script>
\`\`\`

The first script creates a small queue, so you can call \`featul.*\` methods before the SDK has finished loading.

## Frameworks

In React, Next.js or Vue, add the snippet to your root HTML template, or load it once in a top-level layout. Don't put it in a component that re-renders often.

## Content Security Policy

If your site sends a CSP header, allow:

- \`script-src\` for \`https://app.featul.com\`
- \`frame-src\` for \`https://app.featul.com\`

> The widget uses the same branding and public roadmap and changelog settings as your portal. There is nothing extra to configure.
`,
  },
  {
    slug: "widget-options",
    collection: "widget-sdk",
    title: "Widget configuration options",
    summary: "Every option you can pass to featul.init, with defaults.",
    views: 690,
    age: 78,
    body: `
Pass options as the second argument to \`featul.init\`.

| Option | Values | Default | Description |
| --- | --- | --- | --- |
| \`widget\` | \`true\`, \`false\` | \`true\` | Show the floating launcher button |
| \`theme\` | \`light\`, \`dark\`, \`auto\` | \`auto\` | Color scheme. \`auto\` follows the user's system |
| \`position\` | \`left\`, \`right\` | \`right\` | Which corner the launcher sits in |
| \`trigger\` | \`default\`, \`custom\` | \`default\` | Use \`custom\` to open the widget from your own button |
| \`defaultSection\` | \`home\`, \`feedback\`, \`roadmap\`, \`changelog\` | \`home\` | Section shown when the widget opens |
| \`offset\` | \`{ bottom, left, right }\` | — | Pixel offsets for the launcher |

## Using your own button

\`\`\`js
featul.init("YOUR_WORKSPACE_ID", { trigger: "custom", widget: false });

document.querySelector("#feedback-button").addEventListener("click", () => {
  featul.showWidget({ section: "feedback" });
});
\`\`\`
`,
  },
  {
    slug: "identify-users",
    collection: "widget-sdk",
    title: "Identify signed-in users",
    summary: "Pass your users' identity to the widget with a server-side signature so they never have to sign in twice.",
    views: 1120,
    age: 76,
    body: `
When you identify users, posts, votes and comments made in the widget are attributed to the right person automatically. Identity is signed on your server so nobody can impersonate another user.

## How it works

1. Your server builds the user's identity and signs it with your **widget secret**.
2. Your frontend passes the identity and signature to \`featul.identify\`.
3. Featul checks the signature before trusting the identity.

You can find or rotate the widget secret in **Settings → Workspace → Embed widget**. Treat it like a password and never expose it in client-side code.

## Signing on your server (Node.js)

The signature is an HMAC-SHA256 of a JSON array, hex encoded:

\`\`\`ts
import { createHmac } from "node:crypto";

export function signFeatulIdentity(user: { id: string; email: string; name?: string; avatar?: string }) {
  const expiresAt = Math.floor(Date.now() / 1000) + 5 * 60; // five minutes
  const payload = JSON.stringify([
    1,
    process.env.FEATUL_WORKSPACE_ID,
    user.id,
    user.email.trim().toLowerCase(),
    user.name ?? "",
    user.avatar ?? "",
    expiresAt,
  ]);
  const signature = createHmac("sha256", process.env.FEATUL_WIDGET_SECRET!)
    .update(payload)
    .digest("hex");
  return { ...user, expiresAt, signature };
}
\`\`\`

## Passing it to the widget

\`\`\`js
const identity = await fetch("/api/featul-identity").then((r) => r.json());
featul.identify(identity);
\`\`\`

Call \`featul.identify(null)\` when the user signs out.

> **Important:** \`expiresAt\` is a Unix timestamp in **seconds**. Signatures more than ten minutes in the future or already expired are rejected, so request a fresh identity each time the page loads.
`,
  },
  {
    slug: "widget-javascript-api",
    collection: "widget-sdk",
    title: "Widget JavaScript API",
    summary: "Methods and events for controlling the widget from your own code.",
    views: 470,
    age: 72,
    body: `
After the snippet loads, \`window.featul\` exposes the following methods.

| Method | Description |
| --- | --- |
| \`init(workspaceId, options)\` | Start the widget. Call once per page |
| \`identify(user)\` | Attach a signed user identity, or \`null\` to sign out |
| \`showWidget({ section })\` | Open the widget, optionally on a section |
| \`hideWidget()\` | Close the widget |
| \`on(event, listener)\` | Subscribe to \`ready\`, \`open\` or \`close\` |
| \`off(event, listener)\` | Remove a listener |
| \`destroy()\` | Remove the widget from the page completely |

## Example: track when the widget opens

\`\`\`js
featul.on("open", () => analytics.track("Feedback widget opened"));
\`\`\`

## Single-page apps

The widget survives client-side navigation, so you only need to call \`init\` once. If a route should never show the widget, call \`destroy()\` when entering it and \`init\` again when leaving.
`,
  },

  // Branding & domains
  {
    slug: "branding-your-portal",
    collection: "branding-domains",
    title: "Brand your portal",
    summary: "Set your logo, colors, theme and layout so the portal feels like part of your product.",
    views: 720,
    age: 68,
    body: `
Branding settings apply to the portal, the widget and emails. You'll find them in **Settings → Branding**.

## Options

| Setting | Values |
| --- | --- |
| Logo | PNG, JPG, SVG or WebP |
| Primary color | Any hex color, used for buttons, links and highlights |
| Theme | Light, dark or system |
| Layout density | Compact, comfortable or spacious |
| Sidebar position | Left or right |
| Show workspace name | Show or hide the name next to the logo |
| Hide "Powered by Featul" | Remove the footer badge |

## Plan availability

Custom branding and hiding the "Powered by Featul" badge are available on **Starter** and **Professional**. On the Free plan the portal uses the default Featul look.

> **Tip:** Pick a primary color with enough contrast against both light and dark backgrounds, because visitors using the system theme may see either.
`,
  },
  {
    slug: "custom-domain-setup",
    collection: "branding-domains",
    title: "Set up a custom domain",
    summary: "Serve your portal from a domain like feedback.yourcompany.com using two DNS records.",
    views: 1050,
    age: 66,
    body: `
By default your portal lives at \`your-workspace.featul.com\`. You can serve it from your own subdomain instead, for example \`feedback.acme.com\`.

## Step 1: Add the domain

Go to **Settings → Domain**, enter the full URL including \`https://\` and select **Add domain**. Featul shows two DNS records to create.

## Step 2: Create the DNS records

Add both records at your DNS provider (Cloudflare, Route 53, Namecheap and so on):

| Type | Name | Value |
| --- | --- | --- |
| CNAME | \`feedback\` | \`origin.featul.com\` |
| TXT | \`_acme-challenge.feedback.acme.com\` | The token shown in settings |

The CNAME sends traffic to Featul. The TXT record proves you own the domain.

## Step 3: Verify

Select **Verify**. Featul checks both records and, once they match, connects the domain and issues an SSL certificate automatically. Your portal is then available on both addresses.

> A workspace can have one custom domain at a time. To change it, delete the current one and add the new one.
`,
  },
  {
    slug: "troubleshooting-domain-verification",
    collection: "branding-domains",
    title: "Troubleshoot domain verification",
    summary: "Fix the most common reasons a custom domain stays in Pending.",
    views: 580,
    age: 50,
    body: `
If your domain stays **Pending** after you select Verify, one of the records doesn't match yet.

## Check propagation

DNS changes can take anywhere from a few minutes to a few hours. You can check from your terminal:

\`\`\`bash
dig +short CNAME feedback.acme.com
dig +short TXT _acme-challenge.feedback.acme.com
\`\`\`

The first command should print \`origin.featul.com.\` and the second should print your token.

## Common problems

- **Cloudflare proxy is on.** Set the CNAME to **DNS only** (grey cloud). Proxied records hide the CNAME target.
- **The name was entered twice.** Some providers append your domain automatically, so \`feedback.acme.com\` becomes \`feedback.acme.com.acme.com\`. Enter just \`feedback\`.
- **An old record conflicts.** Remove existing A, AAAA or CNAME records on the same name.
- **The token was copied with spaces or quotes.** Paste only the value.

## Still stuck?

Use the **Ask** button in the help center and include your domain name. We'll check the records for you.
`,
  },

  // Integrations
  {
    slug: "slack-integration",
    collection: "intergration",
    title: "Send new feedback to Slack",
    summary: "Post a message to a Slack channel every time someone submits a request.",
    views: 830,
    age: 58,
    body: `
The Slack integration posts a message to a channel whenever a new request is submitted, so your team sees feedback where they already work.

## Set it up

1. In Slack, create an **Incoming Webhook** for the channel you want to use and copy the webhook URL.
2. In Featul, go to **Settings → Integrations → Slack**.
3. Paste the webhook URL and select **Connect**.
4. Select **Send test** to confirm messages arrive.

## What the message contains

Each message includes the post title linked to the request, the board it was posted on, the author, and the first lines of the description.

## Good to know

- Each workspace can connect one Slack webhook. To change channels, replace the webhook URL.
- You can pause the integration without deleting it.
- Integrations are available on **Starter** and **Professional**.
`,
  },
  {
    slug: "discord-notifications",
    collection: "intergration",
    title: "Send new feedback to Discord",
    summary: "Post new requests to a Discord channel using a channel webhook.",
    views: 610,
    age: 56,
    body: `
Discord notifications work the same way as Slack: every new request is posted to the channel you choose.

## Set it up

1. In Discord, open **Channel settings → Integrations → Webhooks** and create a webhook.
2. Copy its URL.
3. In Featul, go to **Settings → Integrations → Discord**, paste the URL and select **Connect**.
4. Select **Send test** to check it works.

Messages appear as rich embeds with the post title, board, author and a link back to the request.

> If messages stop arriving, the webhook may have been deleted in Discord. Create a new one and paste the new URL into Featul.
`,
  },

  // Team & permissions
  {
    slug: "invite-teammates",
    collection: "team-permissions",
    title: "Invite teammates",
    summary: "Add people to your workspace by email and manage pending invites.",
    views: 690,
    age: 92,
    body: `
Invite the people who triage feedback, plan the roadmap or write release notes.

## Sending an invite

1. Go to **Settings → Team** and select **Invite**.
2. Enter one or more email addresses.
3. Choose a role for them.
4. Select **Send invites**.

Each person receives an email with a link that adds them to the workspace once they sign in or create an account.

## Pending invites

Invites appear as **Pending** until accepted. You can resend or revoke them from the same page.

## Seat limits

| Plan | Members |
| --- | --- |
| Free | 3 |
| Starter | 5 |
| Professional | 10 |

Pending invites count toward the limit, so revoke the ones you no longer need.
`,
  },
  {
    slug: "roles-and-permissions",
    collection: "team-permissions",
    title: "Roles and permissions",
    summary: "What owners, admins, members and viewers can do in a workspace.",
    views: 940,
    age: 90,
    body: `
Every teammate has one role. The person who creates the workspace is its **owner**.

| Permission | Owner | Admin | Member | Viewer |
| --- | --- | --- | --- | --- |
| View feedback, roadmap and changelog | Yes | Yes | Yes | Yes |
| Create and manage boards | Yes | Yes | Yes | No |
| Moderate posts and comments | Yes | Yes | Yes | No |
| Configure branding | Yes | Yes | Yes | No |
| Invite and remove members | Yes | Yes | No | No |
| Manage billing | Yes | Yes | No | No |
| Change workspace settings | Yes | Yes | No | No |
| Delete or transfer the workspace | Yes | No | No | No |

## Changing a role

Owners and admins can change roles from **Settings → Team**. The change takes effect immediately.

> Use the **Viewer** role for stakeholders who want visibility but should not change anything, for example executives or customer success.
`,
  },

  // Plans & billing
  {
    slug: "plans-compared",
    collection: "plans-billing",
    title: "Compare plans",
    summary: "What's included in Free, Starter and Professional.",
    views: 1380,
    age: 84,
    body: `
Every plan includes unlimited posts, votes, comments and portal visitors. Plans differ in team size, customization and limits.

| | Free | Starter | Professional |
| --- | --- | --- | --- |
| Team members | 3 | 5 | 10 |
| Boards | 5 | 10 | Unlimited |
| Tags | 5 | 10 | 20 |
| Changelog entries | 10 | 50 | Unlimited |
| Image attachments | Yes | Yes | Yes |
| Custom branding | No | Yes | Yes |
| Hide "Powered by Featul" | No | Yes | Yes |
| Slack and Discord | No | Yes | Yes |
| CSV import | No | Yes | Yes |

Plans can be billed monthly or yearly. Yearly billing costs less over the year.

## Which plan is right for me?

- **Free** is for trying Featul or for side projects.
- **Starter** suits most small teams that want the portal to look like their product.
- **Professional** is for teams with many boards or a busy release schedule.
`,
  },
  {
    slug: "manage-subscription",
    collection: "plans-billing",
    title: "Upgrade, downgrade or cancel",
    summary: "Change your plan, switch billing interval, download invoices or cancel.",
    views: 560,
    age: 70,
    body: `
Only owners and admins can manage billing. Everything happens in **Settings → Billing**.

## Upgrading

Choose a plan and complete checkout. New limits and features apply immediately, and you're charged a prorated amount for the rest of the current period.

## Downgrading

Downgrades take effect at the end of the current billing period. If you're above the new plan's limits, nothing is deleted, but you can't add more until you're back under them. For example, existing boards stay, but you can't create new ones.

## Cancelling

Cancel from the same page. Your workspace returns to the Free plan at the end of the period and your data is kept.

## Invoices and payment methods

Select **Manage billing** to open the customer portal, where you can update your card, change your billing address and download every invoice.

> If a payment fails we'll email the workspace owner and retry automatically for a few days before the subscription is marked past due.
`,
  },

  // Account, security & data
  {
    slug: "sign-in-methods",
    collection: "account-security",
    title: "Sign-in methods",
    summary: "Sign in with Google, GitHub, a password or a one-time email code.",
    views: 450,
    age: 100,
    body: `
Featul supports several ways to sign in. You can link more than one to the same account.

| Method | Notes |
| --- | --- |
| Google | One click with your Google account |
| GitHub | One click with your GitHub account |
| Email and password | Your email must be verified with a one-time code |
| Passkey | Face ID, Touch ID, Windows Hello or a security key |

## Signing in across workspaces

Your session works across every workspace portal on featul.com subdomains, so visitors who sign in to one portal don't have to sign in again on another.

## Forgot your password?

Select **Forgot password** on the sign-in page and we'll email you a reset code.
`,
  },
  {
    slug: "passkeys-and-two-factor",
    collection: "account-security",
    title: "Passkeys and two-factor authentication",
    summary: "Protect your account with a passkey or an authenticator app.",
    views: 330,
    age: 95,
    body: `
We recommend turning on at least one of these for every account with admin access.

## Passkeys

A passkey replaces your password with your device's biometrics or PIN. Passkeys can't be phished or reused.

1. Go to **Account → Security**.
2. Select **Add passkey** and follow your browser's prompt.
3. Name the passkey so you can recognize it later, for example "MacBook".

## Two-factor authentication

1. Go to **Account → Security** and select **Enable two-factor**.
2. Scan the QR code with an authenticator app such as 1Password, Authy or Google Authenticator.
3. Enter the six-digit code to confirm.
4. Save your backup codes somewhere safe.

> **Lost your device?** Sign in with a backup code, then set up two-factor again on your new device. Each backup code works once.
`,
  },
  {
    slug: "export-and-import-data",
    collection: "account-security",
    title: "Export and import data",
    summary: "Download your feedback as CSV, or import requests from another tool.",
    views: 490,
    age: 62,
    body: `
Your data is yours. You can export it at any time and bring existing feedback in when you switch to Featul.

## Exporting

Go to **Settings → Data** and select **Export**. You'll get a CSV with every post, including title, description, board, status, tags, vote count and dates.

## Importing

CSV import is available on **Starter** and **Professional**.

1. Go to **Settings → Data → Import**.
2. Upload a CSV file. The first row must contain column headers.
3. Featul maps columns automatically by name, for example \`Title\`, \`Description\`, \`Status\` and \`Votes\`.
4. Review the mapping, choose a destination board and start the import.

A minimal file looks like this:

\`\`\`csv
Title,Description,Status,Votes
Dark mode,Please add a dark theme,planned,42
Export to PDF,We need PDF reports for clients,pending,17
\`\`\`

## Import warnings

- Columns that can't be mapped are skipped and listed in a warning.
- If two columns map to the same field, the first one is used.
- Unknown statuses are imported as **Pending**.
`,
  },

  // Uncategorized
  {
    slug: "help-center-basics",
    title: "Publish your own help center",
    summary: "Create collections and articles, and decide when the Help tab appears on your portal.",
    views: 280,
    age: 10,
    body: `
The help center lets you answer common questions before they turn into support tickets.

## Collections and articles

- **Collections** group related articles on the help center home page. Each has a name, description and icon.
- **Articles** are written in the same editor as changelog entries. Headings automatically build the table of contents on the right.

Articles can be saved as drafts and published when they're ready. Drag articles and collections to reorder them.

## When the Help tab appears

The Help tab appears on your portal once at least one article is published. You can hide the whole help center from its settings at any time without deleting anything.

## Measuring usefulness

Every article ends with "Was this helpful?". The counts appear in the dashboard so you can see which articles need work.
`,
  },
  {
    slug: "glossary",
    title: "Glossary",
    summary: "Definitions of the terms used throughout Featul.",
    views: 190,
    age: 15,
    body: `
| Term | Definition |
| --- | --- |
| Workspace | Everything for one product: boards, roadmap, changelog, help center, members and billing |
| Portal | The public site for a workspace, at a featul.com subdomain or a custom domain |
| Board | A collection of posts, such as Feature requests or Bugs |
| Post | A single request or bug report |
| Status | Where a post stands, from Pending to Completed |
| Roadmap | A public view of posts grouped by status |
| Changelog | A list of release announcements |
| Collection | A group of help articles |
| Widget | The embeddable version of the portal for use inside your product |
| Stale | A post with no activity for 30 days that is not yet resolved |
`,
  },
  {
    slug: "public-api-preview",
    title: "Public REST API (preview)",
    summary: "Read and write feedback programmatically. Draft, not yet published.",
    views: 0,
    age: 2,
    draft: true,
    body: `
> This article is a draft and only visible to members.

## Authentication

API keys will be created in **Settings → Data → API keys** and sent as a bearer token.

\`\`\`bash
curl https://app.featul.com/api/v1/posts \\
  -H "Authorization: Bearer ft_live_..."
\`\`\`
`,
  },
];
