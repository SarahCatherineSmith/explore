// Ring order, not filename order. Art is dealt straight down this list, so
// entry n sits one slot along from n-1 and the column can count 01..18 as the
// carousel turns. Reordering these rows moves the ring, the column and the
// numbering together; nothing else needs touching.
//
// TODO: every `type` and `year` is placeholder. Names marked (*) are guesses
// at the subject — the artwork carries no wordmark to read them off.
export const PROJECTS = [
  { file: "10.webp", name: "Agentic Email", type: "Motion", year: "2025" },
  { file: "12.webp", name: "SMS Campaigns", type: "Art Direction", year: "2023" },
  { file: "14.webp", name: "AI Education", type: "Branding", year: "2024" },
  { file: "16.webp", name: "SQSP Courses", type: "Product Design", year: "2026" },
  { file: "18.webp", name: "System of Landings", type: "Photography", year: "2026" },
  { file: "2.webp", name: "App Ecosystem", type: "Web Design", year: "2025" },
  { file: "4.webp", name: "Vertical Toolkit", type: "Identity", year: "2023" },
  { file: "6.webp", name: "Multilingual", type: "Web Design", year: "2024" },
  { file: "8.webp", name: "The Washington Post", type: "Branding", year: "2026" },
  { file: "9.webp", name: "Data Engineering", type: "Editorial", year: "2024" },
  { file: "7.webp", name: "About", type: "Photography", year: "2023" },

  // Only 11 real projects — these seven repeat the set above (same file,
  // name, type and year as their match) purely to keep the ring at 18 cards
  // and hold the spacing/gap that count was tuned for. Swap in real work
  // here whenever there is more of it; nothing else needs touching.
  { file: "10.webp", name: "Agentic Email", type: "Motion", year: "2025" },
  { file: "12.webp", name: "SMS Campaigns", type: "Art Direction", year: "2023" },
  { file: "14.webp", name: "AI Education", type: "Branding", year: "2024" },
  { file: "16.webp", name: "SQSP Courses", type: "Product Design", year: "2026" },
  { file: "18.webp", name: "System of Landings", type: "Photography", year: "2026" },
  { file: "2.webp", name: "App Ecosystem", type: "Web Design", year: "2025" },
  { file: "4.webp", name: "Vertical Toolkit", type: "Identity", year: "2023" },
];

export const IMAGE_FILES = PROJECTS.map((p) => p.file);

// Turns a project's name into the slug its detail page lives at
// (/projects/[slug]). Derived on demand rather than stored per row: name is
// the single source of truth, so two rows sharing a name — the repeats above
// — resolve to the same slug and the same page, which is what you want when
// a project is standing in for itself twice around the ring.
export const slugify = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// The ring can carry more cards than there are unique projects (see the
// repeats above) purely to hold its tuned spacing. The nav column shouldn't
// list the same name twice, so it walks PROJECTS once and keeps only the
// first sighting of each file — while these two maps keep it able to talk to
// the ring, which still addresses cards by their full PROJECTS index.
//
//   NAV_PROJECTS[navIndex]        -> { file, name, type, year }
//   NAV_TO_CELL[navIndex]         -> that project's first PROJECTS index
//   CELL_TO_NAV[projectsIndex]    -> which nav row a given card belongs to
export const NAV_PROJECTS = [];
export const NAV_TO_CELL = [];
export const CELL_TO_NAV = PROJECTS.map((p, cell) => {
  const seen = NAV_PROJECTS.findIndex((n) => n.file === p.file);
  if (seen !== -1) return seen;
  NAV_PROJECTS.push(p);
  NAV_TO_CELL.push(cell);
  return NAV_PROJECTS.length - 1;
});
