"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import gsap from "gsap";

import { hasDirection, markDirection } from "./projectTransition";

// Half the panel's own max-w-6xl (72rem), so a ghost's offset from centre can
// be measured from the panel's actual edge rather than guessed.
const PANEL_HALF_PX = 576;
const GHOST_WIDTH_PX = 160;
const GHOST_WIDTH_HOVER_PX = 200;
// Visible space between the panel's edge and the ghost's near edge. Large on
// purpose — this is a hint that another page exists, not a stack of cards
// crowding the one in focus.
const GHOST_GAP_PX = 72;

// Flat, no art — just enough to read as another sheet sitting behind this
// one. A hint that there's a next/previous page, not a preview of it.
// Positioned fixed and off the panel's own layout, at a set distance from
// screen centre: on the reference-ish widths this project is built around
// that distance is more than half the viewport, so the far edge runs past
// the browser edge rather than floating clear of it — the same "another
// page sits just off-screen" read the ring's own edges never get to fake at
// full width in the modal.
//
// Hover swells it toward the cursor — a width grow, plus a lean toward
// wherever on the edge the pointer is — the same idea as a card leaning
// toward the pointer in the ring. There was a cursor-riding name tag here
// too (glass, matching ring/tag.js); pulled for now, not the hover itself.
function Ghost({ href, label, name, side }) {
  const offset = PANEL_HALF_PX + GHOST_GAP_PX + GHOST_WIDTH_PX;
  const wrapRef = useRef(null);
  const surfaceRef = useRef(null);

  const onEnter = () => {
    gsap.to(wrapRef.current, {
      width: GHOST_WIDTH_HOVER_PX,
      duration: 0.5,
      ease: "power3.out",
    });
  };

  const onMove = (e) => {
    // Leans the sliver toward wherever the cursor is along the edge — the
    // same idea as a card leaning toward the pointer in the carousel, just
    // on one axis since this is a vertical strip.
    const rect = wrapRef.current.getBoundingClientRect();
    const rel = (e.clientY - rect.top) / rect.height - 0.5;
    gsap.to(surfaceRef.current, {
      y: rel * -28,
      duration: 0.5,
      ease: "power3.out",
    });
  };

  const onLeave = () => {
    gsap.to(wrapRef.current, {
      width: GHOST_WIDTH_PX,
      duration: 0.4,
      ease: "power3.inOut",
    });
    gsap.to(surfaceRef.current, { y: 0, duration: 0.6, ease: "power3.out" });
  };

  return (
    <Link
      ref={wrapRef}
      href={href}
      scroll={false}
      replace
      aria-label={label ?? name}
      // No exit tween on the ghost itself — this whole tree unmounts on
      // navigation anyway. It just leaves the direction behind for
      // ProjectDetails' entrance tween on the other side, same as its own
      // prev/next links do. replace, not push — see ProjectDetails' own
      // comment on why: otherwise closing has to step back through every
      // ghost you clicked instead of leaving the modal in one go.
      onClick={() => markDirection(side === "left" ? "prev" : "next")}
      onMouseEnter={onEnter}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="fixed top-1/2 z-40 hidden h-[88vh] -translate-y-1/2 overflow-hidden rounded-xl bg-[#dcdcdc] xl:block"
      style={{ [side]: `calc(50% - ${offset}px)`, width: GHOST_WIDTH_PX }}
    >
      <div
        ref={surfaceRef}
        className="h-full w-full bg-gradient-to-b from-[#e8e8e8] via-[#dcdcdc] to-[#cfcfcf] opacity-70"
      />
    </Link>
  );
}

// Wraps whatever's intercepted into app/@modal — currently just the project
// page. router.back() rather than push("/"): the interception only added a
// history entry, it never actually left "/", so going back is what closes
// it and un-masks the URL in one step (forward/back both keep working too).
export default function ProjectModal({
  children,
  prevHref,
  prevName,
  nextHref,
  nextName,
}) {
  const router = useRouter();
  const close = () => router.back();
  const panelRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // close() only reads router.back(), which next/navigation guarantees is
    // referentially stable — nothing is gained by re-subscribing on it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If a Prev/Next move left a direction behind, this mount isn't really a
  // fresh "open" — it's this same modal continuing to show a different
  // project (see the App Router's own remount behaviour, which we can't
  // rely on either way — this guards it regardless). Playing the pop-in
  // again here would scale/fade the panel back in on top of ProjectDetails'
  // own slide. Stripped before paint so it never gets a chance to start.
  // Left as a non-destructive read (hasDirection, not consumeDirection) —
  // ProjectDetails still needs the flag itself to know which way to slide.
  useLayoutEffect(() => {
    if (!hasDirection()) return;
    if (panelRef.current) panelRef.current.style.animation = "none";
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={close}
        className="absolute inset-0 bg-[#0a0a0a]/50 backdrop-blur-sm"
      />

      {/* Fixed rather than flex siblings of the panel: their offset is
          measured from screen centre independently of it, which is what
          lets them run past the browser edge instead of being squeezed
          inward whenever the row as a whole doesn't fit. */}
      {prevHref && (
        <Ghost
          side="left"
          href={prevHref}
          name={prevName}
          label={`Previous project: ${prevName}`}
        />
      )}
      {nextHref && (
        <Ghost
          side="right"
          href={nextHref}
          name={nextName}
          label={`Next project: ${nextName}`}
        />
      )}

      {/* A fixed height, not a cap: with one short column of text and one
          image this used to size to content and end up nowhere near as
          tall as it could be. Fixed also gives ProjectDetails a real height
          to split between its two independently scrolling columns — see
          its own comment. */}
      <div
        ref={panelRef}
        className="modal-panel relative flex h-[88vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl bg-[#fafafa] shadow-2xl"
      >
        <button
          type="button"
          aria-label="Close"
          onClick={close}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-[#0a0a0a] text-base leading-none text-[#fafafa] opacity-90 transition-opacity hover:opacity-100 sm:right-6 sm:top-6"
        >
          ×
        </button>
        <div className="min-h-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
