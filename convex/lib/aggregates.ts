import { TableAggregate } from "@convex-dev/aggregate";
import { components } from "../_generated/api";
import type { DataModel, Id } from "../_generated/dataModel";

// Like counts live in their own B-tree per post rather than on the post
// document, so a like never invalidates feed or thread queries that read the
// post, and never conflicts with replies or deletion on the same post. Every
// insert or delete on `likes` must update this in the same mutation.
export const likeCounts = new TableAggregate<{
  Namespace: Id<"posts">;
  Key: null;
  DataModel: DataModel;
  TableName: "likes";
}>(components.likeCounts, {
  namespace: (like) => like.postId,
  sortKey: () => null,
});
