import Link from "next/link";

import ProjectHero from "./ProjectHero";

const GEIST = '"Geist", ui-sans-serif, system-ui, sans-serif';
const SATOSHI = '"Satoshi", ui-sans-serif, system-ui, sans-serif';

// Two rails, not a hero-then-text stack: a narrow left column (title,
// description, credits, prev/next) that stays put, and a wider right column
// that's just images — the card's own art is the first of those, not a
// separate banner above everything. Shared by the full page
// (app/projects/[slug]/page.js) and the modal that intercepts it
// (app/@modal/(.)projects/[slug]/page.js).
export default function ProjectDetails({
  project,
  prevHref,
  prevName,
  nextHref,
  nextName,
  allHref = "/",
}) {
  return (
    <div className="grid gap-10 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] sm:gap-12">
      <div className="sm:sticky sm:top-0 sm:self-start">
        <h1
          className="text-3xl leading-[1.05] sm:text-4xl"
          style={{ fontFamily: SATOSHI, fontWeight: 500 }}
        >
          {project.name}
        </h1>

        {project.description && (
          <p
            className="mt-4 max-w-sm text-sm leading-relaxed opacity-70 sm:text-base"
            style={{ fontFamily: GEIST }}
          >
            {project.description}
          </p>
        )}

        <div
          className="mt-5 flex flex-wrap gap-2 text-xs tracking-[0.02em]"
          style={{ fontFamily: GEIST }}
        >
          <span className="rounded-full bg-black/[0.06] px-3 py-1 uppercase opacity-70">
            {project.type}
          </span>
          <span className="rounded-full bg-black/[0.06] px-3 py-1 opacity-70">
            {project.year}
          </span>
        </div>

        <nav
          className="mt-10 flex flex-col gap-2 border-t border-black/10 pt-6 text-sm tracking-[0.01em]"
          style={{ fontFamily: GEIST }}
        >
          <Link
            href={prevHref}
            scroll={false}
            className="opacity-60 transition-opacity hover:opacity-100"
          >
            ← {prevName}
          </Link>
          <Link
            href={allHref}
            className="opacity-60 transition-opacity hover:opacity-100"
          >
            All projects
          </Link>
          <Link
            href={nextHref}
            scroll={false}
            className="opacity-60 transition-opacity hover:opacity-100"
          >
            {nextName} →
          </Link>
        </nav>
      </div>

      <div>
        <ProjectHero project={project} className="aspect-[4/3] w-full rounded-lg" />
      </div>
    </div>
  );
}
