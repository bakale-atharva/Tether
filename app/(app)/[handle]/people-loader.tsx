import type { PeopleListKind } from "@/lib/constants";
import { PeopleList } from "./people-list";

export async function PeopleLoader({ params, kind }: {
  params: Promise<{ handle: string }>;
  kind: PeopleListKind;
}) {
  const { handle } = await params;
  return <PeopleList handle={handle} kind={kind} />;
}
