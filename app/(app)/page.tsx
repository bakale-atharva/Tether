import { PageHeader } from "@/components/shell/app-shell";
import { HomeWelcome } from "./home-welcome";

export default function HomePage() {
  return (
    <>
      <PageHeader title="Home" />
      <HomeWelcome />
    </>
  );
}
