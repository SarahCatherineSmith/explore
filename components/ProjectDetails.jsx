import Image from "next/image";
import Link from "next/link";

const GEIST = '"Geist", ui-sans-serif, system-ui, sans-serif';
const SATOSHI = '"Satoshi", ui-sans-serif, system-ui, sans-serif';

// The hero, title/meta and prev-next nav shared by the full page
// (app/projects/[slug]/page.js) and the modal that intercepts it
// (app/@modal/(.)projects/[slug]/page.js). Only the chrome around this
// differs between the two.
export default function ProjectDetails({
  project,
  prevHref,
  prevName,
  nextHref,
  nextName,
  allHref = "/",
}) {
  return (
    <>
      <div className="relative aspect-[3/2] w-full overflow-hidden rounded-md sm:aspect-[16/9]">
        <Image
          src={`/${project.file}`}
          alt={project.name}
          fill
          priority
          sizes="(min-width: 1024px) 960px, 100vw"
          className="object-cover"
        />
      </div>

      <div className="mt-8 flex flex-wrap items-baseline justify-between gap-4">
        <h1
          className="text-4xl sm:text-5xl"
          style={{ fontFamily: SATOSHI, fontWeight: 500 }}
        >
          {project.name}
        </h1>
        <div
          className="flex gap-6 text-sm tracking-[0.01em] opacity-60"
          style={{ fontFamily: GEIST }}
        >
          <span>{project.type}</span>
          <span>{project.year}</span>
        </div>
      </div>

      <nav
        className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-black/10 pt-6 text-sm tracking-[0.01em]"
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
    </>
  );
}
