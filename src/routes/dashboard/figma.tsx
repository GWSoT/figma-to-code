import { createFileRoute } from "@tanstack/react-router";
import { FigmaTeamsProjects } from "~/components/FigmaTeamsProjects";

export const Route = createFileRoute("/dashboard/figma")({
  component: FigmaPage,
});

function FigmaPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <FigmaTeamsProjects />
    </div>
  );
}
