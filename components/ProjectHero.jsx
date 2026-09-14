import Image from "next/image";

// Just the image, so ProjectDetails' right column can round and frame it
// consistently between the full page and the modal, which differ in outer
// chrome but not in this. Stacks to full width below the sm breakpoint
// (single column) and sits in the wider of two columns above it — sizes
// reflects that, not the viewport, since it's never actually full-bleed here.
export default function ProjectHero({ project, className, priority = true }) {
  return (
    <div className={`relative overflow-hidden bg-black/5 ${className}`}>
      <Image
        src={`/${project.file}`}
        alt={project.name}
        fill
        priority={priority}
        sizes="(min-width: 640px) 60vw, 100vw"
        className="object-cover"
      />
    </div>
  );
}
