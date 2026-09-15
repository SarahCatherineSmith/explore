"use client";

import { useEffect, useId, useRef } from "react";
import gsap from "gsap";

// Same melt the front card's name plays in the ring (see ring/meta.js) —
// same numbers, just run once, forward, on a single word instead of morphing
// between two. There's no second word to weld to here, but the two things
// that sell the "resolving out of ink" look are the same: a per-word blur
// that eases open on a delay curve (opacity climbs far faster than blur
// falls, so there's still a spent blur to fuse when the alpha's already
// mostly there), and an SVG threshold filter over the top that keeps the
// edges crisp-but-blobby instead of a plain gaussian dissolve. Off at rest —
// it's only worth its cost while the blur is still doing something.
const NAME_BLUR = 8.5; // px the word starts smeared by
const NAME_EDGE = 400; // alpha gain — how abruptly the threshold sets
const NAME_CUT = 0.33; // and the alpha it sets at
const NAME_SOFTEN = 0.35; // px of blur after it, standing in for antialiasing
const NAME_MORPH_TIME = 1.1;
const NAME_EASE = "circ.out";

export default function TitleReveal({
  as: Tag = "h1",
  className,
  style,
  children,
}) {
  const rawId = useId();
  const filterId = `title-goo-${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;
  const wordRef = useRef(null);
  const gooRef = useRef(null);
  const cutRef = useRef(null);

  useEffect(() => {
    const word = wordRef.current;
    const goo = gooRef.current;
    if (!word || !goo) return;

    cutRef.current?.setAttribute(
      "values",
      `1 0 0 0 0
       0 1 0 0 0
       0 0 1 0 0
       0 0 0 ${NAME_EDGE} ${-NAME_EDGE * NAME_CUT}`,
    );

    const state = { t: 0 };
    goo.style.willChange = "filter";
    word.style.willChange = "filter, opacity";

    const draw = () => {
      const t = state.t;
      if (t >= 1) {
        word.style.filter = "none";
        word.style.opacity = "1";
        goo.style.filter = "none";
        return;
      }
      goo.style.filter = `url(#${filterId}) blur(${NAME_SOFTEN}px)`;
      if (t <= 0) {
        word.style.filter = "none";
        word.style.opacity = "0";
      } else {
        word.style.filter = `blur(${Math.min(NAME_BLUR / t - NAME_BLUR, 100)}px)`;
        word.style.opacity = `${Math.pow(t, 0.4)}`;
      }
    };

    draw();
    const tween = gsap.to(state, {
      t: 1,
      duration: NAME_MORPH_TIME,
      ease: NAME_EASE,
      onUpdate: draw,
      onComplete: () => {
        word.style.willChange = "auto";
        goo.style.willChange = "auto";
      },
    });

    return () => tween.kill();
  }, [filterId]);

  return (
    <Tag className={className} style={style}>
      <span ref={gooRef} className="inline-block">
        <span ref={wordRef} className="inline-block opacity-0">
          {children}
        </span>
      </span>

      <svg aria-hidden="true" focusable="false" className="absolute h-0 w-0">
        <defs>
          <filter
            id={filterId}
            x="-20%"
            y="-100%"
            width="140%"
            height="300%"
            colorInterpolationFilters="sRGB"
          >
            <feColorMatrix
              ref={cutRef}
              in="SourceGraphic"
              type="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 255 -140"
            />
          </filter>
        </defs>
      </svg>
    </Tag>
  );
}
