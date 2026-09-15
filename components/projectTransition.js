// A route change is a full remount — nothing in memory survives the trip
// from one project page to the next. sessionStorage is the one thing that
// does, so it's how the outgoing side tells the incoming side which
// direction it left in (see ProjectDetails' entrance tween). Wrapped rather
// than called directly since sessionStorage throws in some locked-down
// contexts (private browsing in a couple of browsers); the transition is a
// nicety, losing it shouldn't break navigation.
const KEY = "project-transition-dir";

export function markDirection(dir) {
  try {
    sessionStorage.setItem(KEY, dir);
  } catch {
    // Ignored — see comment above.
  }
}

export function consumeDirection() {
  try {
    const dir = sessionStorage.getItem(KEY);
    sessionStorage.removeItem(KEY);
    return dir;
  } catch {
    return null;
  }
}

// Non-destructive read: ProjectModal needs to know a Prev/Next move is in
// flight (to skip its own pop-in — see its comment) without eating the flag
// ProjectDetails still has to consume for the actual slide.
export function hasDirection() {
  try {
    return sessionStorage.getItem(KEY) != null;
  } catch {
    return false;
  }
}
