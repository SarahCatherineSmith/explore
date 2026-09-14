import Link from "next/link";
import { notFound } from "next/navigation";

import ProjectDetails from "@/components/ProjectDetails";
import ScrollUnlock from "@/components/ScrollUnlock";
import { NAV_PROJECTS, slugify } from "@/components/ring/projects";

// The shareable, refreshable version of a project. Reached directly (typed
// URL, refresh, share link) — client-side navigation from the carousel gets
// intercepted into the modal at app/@modal/(.)projects/[slug]/page.js
// instead; see that file's comment for how the two stay in sync.
export function generateStaticParams() {
  return NAV_PROJECTS.map((p) => ({ slug: slugify(p.name) }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const project = NAV_PROJECTS.find((p) => slugify(p.name) === slug);
  if (!project) return {};
  return {
    title: `${project.name} — Viscose`,
    description: `${project.type}, ${project.year}.`,
  };
}

export default async function ProjectPage({ params }) {
  const { slug } = await params;
  const index = NAV_PROJECTS.findIndex((p) => slugify(p.name) === slug);
  if (index === -1) notFound();

  const project = NAV_PROJECTS[index];
  const count = NAV_PROJECTS.length;
  const prev = NAV_PROJECTS[(index - 1 + count) % count];
  const next = NAV_PROJECTS[(index + 1) % count];

  return (
    <>
      <ScrollUnlock />
      <main className="min-h-screen bg-[#fafafa] text-[#0a0a0a]">
        <div className="mx-auto max-w-5xl px-6 py-10 sm:px-10">
          <Link
            href="/"
            className="inline-block text-sm tracking-[0.01em] opacity-60 transition-opacity hover:opacity-100"
            style={{
              fontFamily: '"Geist", ui-sans-serif, system-ui, sans-serif',
            }}
          >
            ← All projects
          </Link>

          <div className="mt-10">
            <ProjectDetails
              project={project}
              prevHref={`/projects/${slugify(prev.name)}`}
              prevName={prev.name}
              nextHref={`/projects/${slugify(next.name)}`}
              nextName={next.name}
            />
          </div>
        </div>
      </main>
    </>
  );
}
