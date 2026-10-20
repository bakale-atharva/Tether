import { PageHeader } from "@/components/ui/page-header";
import { HomeWelcome } from "./home-welcome";

export default function HomePage() {
  return (
    <>
      <PageHeader title="Home" />
      <HomeWelcome />
    </>
  );
}
