import { notFound } from "next/navigation";

import ProjectDetails from "@/components/ProjectDetails";
import ProjectModal from "@/components/ProjectModal";
import { NAV_PROJECTS, slugify } from "@/components/ring/projects";

// The `(.)` intercepts client-side navigation to /projects/[slug] from
// anywhere at this same level — which is everywhere, since @modal sits at
// the app root right alongside app/projects itself. A typed URL, a refresh,
// or a shared link skips this entirely and hits the real page instead; only
// a click from within the running app lands here. See @modal/default.js and
// @modal/page.js for how this slot clears once the modal should be gone.
export default async function InterceptedProjectPage({ params }) {
  const { slug } = await params;
  const index = NAV_PROJECTS.findIndex((p) => slugify(p.name) === slug);
  if (index === -1) notFound();

  const project = NAV_PROJECTS[index];
  const count = NAV_PROJECTS.length;
  const prev = NAV_PROJECTS[(index - 1 + count) % count];
  const next = NAV_PROJECTS[(index + 1) % count];

  return (
    <ProjectModal>
      <ProjectDetails
        project={project}
        prevHref={`/projects/${slugify(prev.name)}`}
        prevName={prev.name}
        nextHref={`/projects/${slugify(next.name)}`}
        nextName={next.name}
      />
    </ProjectModal>
  );
}
