// Exact match for "/". On a *soft* navigation, an unmatched slot keeps
// whatever it was last showing rather than clearing — so a <Link href="/">
// clicked from inside the modal (the "All projects" link) needs this to
// actually close it, the same way router.back() does by leaving the history
// entry the interception added.
export default function Page() {
  return null;
}
