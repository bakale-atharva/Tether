# Tether development plan

## Summary and branch naming

Build a polished development MVP of Tether with social posting, threaded conversations, discovery, Clerk Billing, and subscription-gated AI.

**Branch naming must identify the agent:**

- **ChatGPT agents:** start every branch with `codex/`.
- **Claude agents:** start every branch with `claude/`.
- Use the current checkout with **no worktrees**.

## Delivery workflow and Linear

- Before application changes, create `/00-foundation` from the current checkout and commit existing uncommitted work as the baseline. Preserve the existing Clerk work; exclude secrets and ignored environment files.
- Create a Linear project named **Tether** under **Dev**.
- Project description: “Build a polished social platform with public conversations, personalized discovery, private bookmarks, and subscription-gated AI assistance using Next.js, Clerk, Convex, and OpenRouter.”
- Create **nine milestones with six issues each: 54 issues total**. Include dependencies, acceptance criteria, verification steps, and branch/PR links.
- Update issues throughout execution. Completed implementation enters **In Review**; mark issues Done and milestones complete after approval and merge.
- Use Superpowers for specifications, planning, implementation, debugging, testing, review, and verification wherever applicable. Do not use its worktree workflow.
- Develop each phase locally, then push its completed branch to create a GitHub PR.
- **Stop after opening each PR. Merge only after your explicit approval, then start the next phase from updated `main`.**
- Every phase completes its related frontend and backend together and reuses components from earlier phases.

## Phases and Linear issues

Each numbered item becomes one Linear issue, including relevant implementation and tests.

### Phase 0 — Foundation
Branch: Only this phase should be done directly on the main branch.

1. Commit the existing baseline and preserve authentication work.
2. Create the Linear project, milestones, issues, and dependencies.
3. Record specifications, current documentation, and verification tooling.
4. Complete Clerk–Convex authentication integration.
5. Implement persistent identity and unique-handle onboarding.
6. Build and verify the branded responsive application shell.

**Outcome:** Users can sign in, finish onboarding, and navigate Tether.

### Phase 1 — Profiles and posts
Branch: `/01-posts-profiles`

1. Build public profiles and owner editing.
2. Implement authenticated image uploads, validation, and cleanup.
3. Implement post creation and its composer.
4. Build the paginated chronological public feed.
5. Build post details and owner deletion.
6. Verify profile/post journeys, responsive layouts, and accessibility.

**Outcome:** Users can customize profiles and publish, read, and delete image posts.

### Phase 2 — Conversations
Branch: `02-conversations`

1. Implement reply relationships and backend validation.
2. Build reply composers at every conversation level.
3. Render paginated nested conversations.
4. Add reply counts, permalinks, and ancestor navigation.
5. Implement reply deletion and deleted-content placeholders.
6. Verify nesting, concurrency, ownership, and mobile interaction.

**Outcome:** Users can hold complete threaded discussions.

### Phase 3 — Likes and bookmarks
Branch: `/03-likes-bookmarks`

1. Implement idempotent likes for posts and replies.
2. Build reactive counts and optimistic interaction states.
3. Implement private bookmark storage and authorization.
4. Build bookmark controls and paginated saved posts.
5. Handle deleted content and failed interaction recovery.
6. Verify privacy, concurrency, persistence, and keyboard access.

**Outcome:** Users can like messages and privately save posts.

### Phase 4 — Following
Branch: `/04-following`

1. Implement follow/unfollow relationships.
2. Build profile follow controls.
3. Implement follower/following counts and paginated lists.
4. Build the chronological Following feed.
5. Integrate feed switching and useful empty states.
6. Verify relationship changes, feed membership, pagination, and authorization.

**Outcome:** Users can follow accounts and browse their posts.

### Phase 5 — Search
Branch: `/05-search`

1. Define the top-level-post search index.
2. Implement relevance-ranked paginated search.
3. Build the submitted search form and URL state.
4. Render results using existing post components.
5. Handle empty queries, no results, errors, and browser navigation.
6. Verify relevance, pagination, deletion exclusion, and submit-only execution.

**Outcome:** Enter or Search submits a shareable results URL; typing never triggers searches.

### Phase 6 — Billing
Branch: `/06-billing`

1. Configure individual Free and Pro development plans.
2. Build pricing and Clerk checkout.
3. Build subscription management and plan display.
4. Implement verified billing-event synchronization.
5. Implement authoritative server-side agent entitlements.
6. Verify purchase, cancellation, expiry, failed payments, and event replay.

**Outcome:** Users can manage test subscriptions, with backend-enforced Pro access.

### Phase 7 — Private agent
Branch: `/07-agent-chat`

1. Configure Convex Agent and OpenRouter.
2. Implement owner-scoped conversations and history.
3. Build persistent streamed private chat.
4. Implement shared quotas and concurrency controls.
5. Build upgrade, cancellation, retry, and provider-error states.
6. Verify privacy, Pro enforcement, reload recovery, and real-provider integration.

**Outcome:** Pro users can hold persistent private conversations with Tether.

### Phase 8 — Public agent replies
Branch: `/08-agent-mentions`

1. Detect qualifying `@tether` mentions.
2. Assemble complete discussion context.
3. Implement authorized, idempotent background generation.
4. Publish labeled agent replies beneath mentions.
5. Build author-visible request status and retry controls.
6. Verify context completeness, entitlement changes, duplicate delivery, deletion races, and final integration.

**Outcome:** Pro mentions receive contextual public replies without free-user invocation or duplicate responses.

## Architecture and agreed behavior

**Application and identity**

- Use the existing Next.js, React, Tailwind, Clerk, and Convex stack.
- Create a distinct Tether identity using warm ivory, deep ink, coral accents, restrained borders, and accessible light/dark themes.
- Establish reusable navigation, forms, message components, and interaction states early.
- Clerk owns authentication and billing; Convex owns application data and public profiles.
- Profiles support a case-insensitive unique handle, display name, bio, avatar, and banner. Reserve `tether` for the agent.
- Visitors can read public feeds, profiles, conversations, and search. Posting, interactions, follows, bookmarks, and private resources require authentication.
- Public profile responses exclude email addresses and billing data.

**Social features and interfaces**

- Use a typed `posts` model for root posts and replies, with parent/root relationships and explicit user-versus-agent authorship.
- Add indexed relationships for follows, likes, and bookmarks. Derive the acting user from verified identity.
- Define validated Convex queries, mutations, and actions. Paginate user-facing collections server-side.
- Public and Following feeds show top-level posts newest first. Following merges indexed author streams rather than scanning the public feed.
- Human posts and replies allow **280 characters**.
- Root posts support **four JPEG, PNG, or WebP images maximum, 5 MB each**, with optional alt text. Replies are text-only.
- Validate upload ownership and metadata server-side; clean up abandoned uploads and deleted attachments.
- Owners can delete content. Remove text and attachments while preserving structural placeholders for existing conversations.
- Likes apply to posts and replies; private bookmarks save top-level posts.
- Search undeleted top-level post text by relevance through `/search?q=…`. Execute only on submission.

**Authentication and billing**

- Keep Clerk integration in `proxy.ts`; protect individual server resources and Convex operations. Do not introduce deprecated `createRouteMatcher()`.
- Configure individual **Free** and **$10 USD/month Pro** plans in development billing, without annual billing or trials.
- Assign the `tether_agent` feature to Pro.
- Use Clerk checkout and subscription-management components.
- Verify webhook signatures and handle duplicate events safely.
- Check authoritative Clerk subscription data before model execution; never trust client flags or editable metadata.
- Cancellation preserves access through the paid period. Expired, ended, incomplete, or past-due subscriptions cannot start generations. Entitlement verification failures deny generation.

**Agent**

- Use Convex Agent for persistent conversations and streaming, with OpenRouter’s AI SDK provider.
- Default to `nvidia/nemotron-3-super-120b-a12b:free`, configurable server-side. Never automatically switch to a paid model.
- Share **50 requests per UTC day** across private chat and mentions, with one active generation per user and a five-second cooldown.
- Internal context summaries do not consume additional user-request units. Retries reuse the original request record.
- Private history is owner-only. Downgraded users can read existing history but cannot generate.
- Detect case-insensitive standalone `@tether` mentions in newly created human replies. Multiple mentions in one reply create one request; agent responses never trigger another request.
- Include the root post and every reply branch existing at mention time, preserving author and parent relationships.
- Collect context in pages and summarize oversized discussions in chunks without silently dropping branches.
- Context is text-only: include attachment presence and supplied alt text without claiming image understanding.
- Publish one labeled response directly beneath the mentioning reply. Everyone can read it; only an entitled mentioning author can trigger it.
- Recheck entitlement before execution. Cancel pending publication if the source reply or root post is deleted.
- Show failures and upgrade prompts privately to the requesting author.
- Isolate private chat history from public discussion context. Treat discussion text as untrusted input and expose no user-data modification tools.

## Verification and boundaries

- Fetch current documentation through **Context7** before implementing each relevant integration. Check installed types, bundled Next.js guides, and Convex guidelines against those docs.
- There should be NO VITEST or E-2-E checks
- Before each PR, pass lint, TypeScript checks, production build, relevant automated tests, and desktop/mobile browser verification.
- Test ownership forgery, cross-user access, concurrent interactions, private-data isolation, invalid uploads, and pagination consistency.
- Test free-user denial without model calls, sibling-branch context, oversized discussions, provider outages, duplicate jobs, subscription changes, and deletion during generation.
- Verify keyboard access, focus handling, loading, empty, and error states.
- Existing integrations and skills are available. Identify any additional unavailable capability explicitly and request needed credentials when its phase requires them.
- This is a development MVP: no live payments, production deployment, reposts, DMs, notifications, content editing, image understanding, or agent web browsing.
- While Plan mode remains active, do not commit, create Linear resources, configure billing, or change application code.
