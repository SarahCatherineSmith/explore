"use client";

import { useLayoutEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import gsap from "gsap";

import ProjectHero from "./ProjectHero";
import TitleReveal from "./TitleReveal";
import { consumeDirection, markDirection } from "./projectTransition";

const GEIST = '"Geist", ui-sans-serif, system-ui, sans-serif';
const SATOSHI = '"Satoshi", ui-sans-serif, system-ui, sans-serif';

// Same idea as the ring's pick() (see Carousel.jsx / params.pickEase):
// moving to a neighbour is a directed move, not a crossfade. There's no
// shared canvas here to carry a card's motion across a route change though,
// so the illusion is built in two halves that never run in the same tick —
// this component's own root slides out before the navigation is committed,
// then slides in on the next page's mount reading the direction the
// outgoing side left behind in sessionStorage (projectTransition.js),
// since a route change is a full remount and that's the only thing that
// makes the trip. Same ease, and roughly the same speed as pickTime.
//
// router.replace, not .push: the carousel's own click into a project
// (Carousel.jsx) is the one push that opens the modal, and ProjectModal's
// close is router.back(). Prev/Next pushing another entry per click would
// make back() step through every project you'd visited instead of leaving
// the modal — replace keeps the stack at exactly [carousel, current
// project] no matter how many times you've moved, so the backdrop always
// returns to the carousel in one step.
//
// Asymmetric on purpose, not the same tween played backwards: a real push
// has the outgoing side accelerating away (it's been shoved, not fading on
// its own schedule) and the incoming side decelerating into place (it
// arrives and settles). Two tweens sharing one ease read as a pause-then-
// restart at the seam — the "jerky" bit — because both sides are slowest
// exactly where they meet, at zero velocity, either side of the content
// swap. Matching the exit's fast end to the enter's fast start keeps that
// seam moving instead of stalling on it. Distance is generous too: a small
// nudge reads as a flinch, not a page sliding into view.
const SLIDE_PX = 140;
const EXIT_TIME = 0.26;
const EXIT_EASE = "power2.in";
const ENTER_TIME = 0.55;
const ENTER_EASE = "power3.out";

// Two rails, not a hero-then-text stack: a narrow left column (title,
// description, credits, prev/next) and a wider right column that's just
// images — the card's own art first, then a placeholder gallery (see
// below). Shared by the full page (app/projects/[slug]/page.js) and the
// modal that intercepts it (app/@modal/(.)projects/[slug]/page.js), which
// differ in how the two columns scroll:
//
//   variant="page"  (default) — a normal document. The left rail sticks to
//     the *window* as it scrolls past; there's no ceiling on height because
//     the page is exactly as tall as its content.
//   variant="modal" — inside ProjectModal's fixed-height panel, where
//     there's no window scroll to hook a sticky rail to. Each column gets
//     its own independent overflow-y-auto instead, so the gallery scrolls
//     while the title/credits/nav rail stays put — both bounded by the
//     panel's own height rather than the viewport's.
export default function ProjectDetails({
  project,
  prevHref,
  prevName,
  nextHref,
  nextName,
  allHref = "/",
  variant = "page",
}) {
  const isModal = variant === "modal";
  const router = useRouter();
  const rootRef = useRef(null);

  // Runs before paint, not after: reading the flag and setting the starting
  // transform have to land in the same frame the browser first draws this,
  // or there'd be a flash of the settled layout before it jumps to the
  // off-screen start and animates back.
  //
  // Keyed on project.name, not run-once: Prev/Next is a client-side
  // navigation to the same route shape with different params, so the App
  // Router reuses this same ProjectDetails instance rather than remounting
  // it — an empty dependency array would only ever fire this on the very
  // first project a visitor opened. Every navigation after that would leave
  // the DOM sitting wherever the exit tween left it (faded and slid off to
  // one side) with nothing to animate it back, since the new project's
  // content lands in an already-mounted tree instead of a fresh one. That
  // stuck, invisible state was the "flash" — the title alone would still
  // reveal (it remounts on its own key), but everything else in this
  // column would just silently reappear mid-navigation instead of easing
  // in with it.
  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    // A click landing mid-tween (Next pressed again before the last one
    // settled) shouldn't leave two tweens fighting over the same transform.
    gsap.killTweensOf(el);

    const dir = consumeDirection();
    if (!dir) {
      gsap.set(el, { x: 0, opacity: 1, willChange: "auto" });
      return;
    }

    el.style.willChange = "transform, opacity";
    gsap.set(el, { x: dir === "next" ? SLIDE_PX : -SLIDE_PX, opacity: 0 });
    gsap.to(el, {
      x: 0,
      opacity: 1,
      duration: ENTER_TIME,
      ease: ENTER_EASE,
      onComplete: () => {
        el.style.willChange = "auto";
      },
    });
  }, [project.name]);

  // Two explicit handlers rather than one factory returning a closure per
  // link: the ref read has to sit directly in the function that's actually
  // wired up as the handler for the lint rule guarding against reading refs
  // during render to be able to tell it only ever runs after a click.
  const goPrev = (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
      return;
    }
    e.preventDefault();
    markDirection("prev");
    const el = rootRef.current;
    if (!el) {
      router.replace(prevHref);
      return;
    }
    el.style.willChange = "transform, opacity";
    gsap.to(el, {
      x: SLIDE_PX,
      opacity: 0,
      duration: EXIT_TIME,
      ease: EXIT_EASE,
      onComplete: () => router.replace(prevHref),
    });
  };

  const goNext = (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
      return;
    }
    e.preventDefault();
    markDirection("next");
    const el = rootRef.current;
    if (!el) {
      router.replace(nextHref);
      return;
    }
    el.style.willChange = "transform, opacity";
    gsap.to(el, {
      x: -SLIDE_PX,
      opacity: 0,
      duration: EXIT_TIME,
      ease: EXIT_EASE,
      onComplete: () => router.replace(nextHref),
    });
  };

  return (
    <div
      ref={rootRef}
      className={
        isModal
          ? "grid sm:h-full sm:min-h-0 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]"
          : "grid gap-10 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] sm:gap-12"
      }
    >
      <div
        className={
          isModal
            ? "p-6 sm:min-h-0 sm:overflow-y-auto sm:p-10 sm:pr-6"
            : "sm:sticky sm:top-0 sm:self-start"
        }
      >
        <TitleReveal
          key={project.name}
          className="text-3xl leading-[1.05] sm:text-4xl"
          style={{ fontFamily: SATOSHI, fontWeight: 500 }}
        >
          {project.name}
        </TitleReveal>

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
            onClick={goPrev}
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
            onClick={goNext}
            className="opacity-60 transition-opacity hover:opacity-100"
          >
            {nextName} →
          </Link>
        </nav>
      </div>

      <div
        className={
          isModal
            ? "p-6 pt-0 sm:min-h-0 sm:overflow-y-auto sm:p-10 sm:pl-6 sm:pt-10"
            : ""
        }
      >
        <ProjectHero
          project={project}
          className="aspect-[4/3] w-full rounded-lg"
        />

        {/* There's only one photo per project in the data (ring/projects.js)
            — these two repeat it at different crops as a placeholder for the
            additional shots a real case study would have, purely so this
            column has something to scroll. Swap each for a distinct image
            once there is one; nothing else here needs to change. */}
        <ProjectHero
          project={project}
          priority={false}
          className="mt-6 aspect-[3/2] w-full rounded-lg"
        />
        <ProjectHero
          project={project}
          priority={false}
          className="mt-6 aspect-square w-full rounded-lg"
        />
      </div>
    </div>
  );
}
