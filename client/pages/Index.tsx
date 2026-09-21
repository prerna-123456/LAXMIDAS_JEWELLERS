import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  ChevronDown,
  Camera,
  Menu,
  Minus,
  Phone,
  X,
} from "lucide-react";

const imageBase = "https://shreelaxmidasjewellers.com/wp-content/uploads/2024/04/";

const collections = [
  { name: "Gold Jewellery", image: `${imageBase}collection1.png`, index: "01" },
  { name: "Diamond Jewellery", image: `${imageBase}collection2.png`, index: "02" },
  { name: "Uncut Diamonds", image: `${imageBase}collection3.png`, index: "03" },
  { name: "Gemstone Jewellery", image: `${imageBase}collection4.png`, index: "04" },
  { name: "Platinum", image: `${imageBase}collection5.png`, index: "05" },
];

const gallery = [
  "Frame-160881.png",
  "Frame-160882.png",
  "Frame-160883.png",
  "Frame-160884.png",
  "Frame-160885.png",
  "Frame-10.png",
];

const signatureVideos = [1, 2, 3, 4, 5, 6, 7].map((n) => `/videos/signature-${n}.mp4`).slice(0, 5);
// Videos start with dark WhatsApp intro frames — park every tile's poster a little deeper in
const POSTER_TIME = 6;

const navItems = [
  ["About", "about"],
  ["Collections", "collections"],
  ["Craftsmanship", "craftsmanship"],
  ["Testimonials", "testimonials"],
  ["Instagram", "instagram"],
  ["Contact", "contact"],
];

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="eyebrow flex items-center gap-3 text-gold">
      <span className="h-px w-7 bg-gold" />
      {children}
    </p>
  );
}

/* =========================================================
   FEATURED EDITORIAL VIDEO SECTION
   Paste this ABOVE: export default function Index()
========================================================= */

/* =========================================================
   FEATURED / SIGNATURE VIDEO SHOWCASE
========================================================= */

const wedgeVideos = [
  {
    src: "/videos/signature-1.mp4",
    category: "necklace" as const,
  },
  {
    src: "/videos/signature-2.mp4",
    category: "earrings" as const,
  },
  {
    src: "/videos/signature-3.mp4",
    category: "necklace" as const,
  },
  {
    src: "/videos/signature-4.mp4",
    category: "bangles" as const,
  },
  {
    src: "/videos/signature-5.mp4",
    category: "necklace" as const,
  },
];


/* =========================================================
   LEFT CONTENT
========================================================= */

const categoryContent = {
  necklace: {
    number: "01",
    label: "Shree Laxmidas Collection",
    titleTop: "Timeless",
    titleEm: "Forms",

    description:
      "A curated selection of gold temple-work necklaces — each one an exploration of intricate detail, rich texture, and traditional form. Jewellery as heirloom.",

    linkLabel: "Explore The Necklace Edit",
  },

  earrings: {
    number: "02",
    label: "Shree Laxmidas Collection",
    titleTop: "Ornate",
    titleEm: "Drops",

    description:
      "Gold jhumka earrings shaped with intricate filigree and traditional temple motifs — statement pieces that catch the light with every turn.",

    linkLabel: "Explore The Earring Edit",
  },

  bangles: {
    number: "03",
    label: "Shree Laxmidas Collection",
    titleTop: "Stacked",
    titleEm: "Legacy",

    description:
      "Gold temple-work bangles made to be layered and stacked — each band carrying the weight of tradition and the shine of fine craftsmanship.",

    linkLabel: "Explore The Bangle Edit",
  },
} as const;


type EditorialCategory =
  keyof typeof categoryContent;


/* =========================================================
   SEMICIRCLE SETTINGS
========================================================= */

const R_OUTER = 480;

const R_INNER = 190;

const CX = 0;

const CY = R_OUTER;

const VIEW_HEIGHT =
  R_OUTER * 2;

const WEDGE_COUNT =
  wedgeVideos.length;

const SWEEP =
  180 / WEDGE_COUNT;


/* =========================================================
   POLAR POSITION
========================================================= */

function editorialPolar(
  angleDeg: number,
  radius: number
) {
  const rad =
    (angleDeg * Math.PI) / 180;

  return {
    x:
      CX +
      radius *
      Math.cos(rad),

    y:
      CY +
      radius *
      Math.sin(rad),
  };
}


/* =========================================================
   CREATE WEDGE PATH
========================================================= */

function editorialWedgePath(
  startAngle: number,
  endAngle: number
) {
  const outerStart =
    editorialPolar(
      startAngle,
      R_OUTER
    );

  const outerEnd =
    editorialPolar(
      endAngle,
      R_OUTER
    );

  const innerStart =
    editorialPolar(
      startAngle,
      R_INNER
    );

  const innerEnd =
    editorialPolar(
      endAngle,
      R_INNER
    );


  return `
    M ${innerStart.x} ${innerStart.y}

    L ${outerStart.x} ${outerStart.y}

    A ${R_OUTER} ${R_OUTER}
    0 0 1
    ${outerEnd.x} ${outerEnd.y}

    L ${innerEnd.x} ${innerEnd.y}

    A ${R_INNER} ${R_INNER}
    0 0 0
    ${innerStart.x} ${innerStart.y}

    Z
  `;
}


/* =========================================================
   WEDGE BOUNDING BOX
========================================================= */

function editorialWedgeBBox(
  startAngle: number,
  endAngle: number
) {
  const points = [
    editorialPolar(
      startAngle,
      R_INNER
    ),

    editorialPolar(
      endAngle,
      R_INNER
    ),

    editorialPolar(
      startAngle,
      R_OUTER
    ),

    editorialPolar(
      endAngle,
      R_OUTER
    ),

    editorialPolar(
      (startAngle + endAngle) / 2,
      R_OUTER
    ),
  ];


  const xs =
    points.map(
      (point) => point.x
    );

  const ys =
    points.map(
      (point) => point.y
    );


  const minX =
    Math.min(...xs);

  const maxX =
    Math.max(...xs);

  const minY =
    Math.min(...ys);

  const maxY =
    Math.max(...ys);


  return {
    x: minX,
    y: minY,

    width:
      maxX - minX,

    height:
      maxY - minY,
  };
}


/* =========================================================
   SIGNATURE SHOWCASE
========================================================= */

function SignatureShowcase() {

  /* =======================================================
     ACTIVE VIDEO
  ======================================================= */

  const [active, setActive] =
    useState(0);


  /* =======================================================
     VIDEO REFERENCES
  ======================================================= */

  const videoRefs =
    useRef<
      (HTMLVideoElement | null)[]
    >([]);


  /* =======================================================
     CURRENT CATEGORY
  ======================================================= */

  const activeCategory:
    EditorialCategory =
    wedgeVideos[active].category;


  const [
    displayCategory,
    setDisplayCategory,
  ] =
    useState<EditorialCategory>(
      activeCategory
    );


  const [
    contentFading,
    setContentFading,
  ] =
    useState(false);


  const fadeTimeoutRef =
    useRef<
      ReturnType<
        typeof setTimeout
      > | null
    >(null);


  /* =======================================================
     LEFT CONTENT CHANGE
  ======================================================= */

  useEffect(() => {

    if (
      activeCategory ===
      displayCategory
    ) {
      return;
    }


    setContentFading(true);


    if (
      fadeTimeoutRef.current
    ) {
      clearTimeout(
        fadeTimeoutRef.current
      );
    }


    fadeTimeoutRef.current =
      setTimeout(() => {

        setDisplayCategory(
          activeCategory
        );

        setContentFading(false);

      }, 220);


    return () => {

      if (
        fadeTimeoutRef.current
      ) {
        clearTimeout(
          fadeTimeoutRef.current
        );
      }

    };

  }, [
    activeCategory,
    displayCategory,
  ]);


  const content =
    categoryContent[
    displayCategory
    ];


  /* =======================================================
     INITIAL VIDEO SETUP

     First video plays.
     Remaining videos stay paused.

     We seek inactive videos slightly forward once,
     only so the browser paints a visible video frame.
  ======================================================= */

  useEffect(() => {

    const videos =
      videoRefs.current;


    videos.forEach(
      (video, index) => {

        if (!video) return;


        const prepare =
          () => {

            /*
             * FIRST VIDEO
             */

            if (index === 0) {

              try {
                video.currentTime = 0;
              } catch {
                // ignore
              }


              video
                .play()
                .catch(() => { });

            }


            /*
             * OTHER VIDEOS
             */

            else {

              video.pause();


              /*
               * Move only once to a visible frame.
               * After this we DO NOT keep resetting it.
               */

              try {

                if (
                  video.duration &&
                  video.duration > 0.2
                ) {
                  video.currentTime =
                    Math.min(
                      0.5,
                      video.duration / 4
                    );
                }

              } catch {
                // ignore
              }

            }

          };


        if (
          video.readyState >= 2
        ) {

          prepare();

        } else {

          video.addEventListener(
            "loadeddata",
            prepare,
            {
              once: true,
            }
          );

        }

      }
    );


    return () => {

      videos.forEach(
        (video) => {
          video?.pause();
        }
      );

    };

  }, []);


  /* =======================================================
     ACTIVE VIDEO CHANGE

     ACTIVE = PLAY
     OTHERS = PAUSE AT CURRENT FRAME
  ======================================================= */

  useEffect(() => {

    const videos =
      videoRefs.current;


    videos.forEach(
      (video, index) => {

        if (!video) return;


        /* ===============================================
           ACTIVE VIDEO
        =============================================== */

        if (
          index === active
        ) {

          /*
           * Every time a video becomes active,
           * start it from beginning.
           */

          try {

            video.currentTime = 0;

          } catch {
            // ignore
          }


          const playPromise =
            video.play();


          if (
            playPromise !== undefined
          ) {

            playPromise.catch(
              () => {
                /*
                 * muted + playsInline normally
                 * allows autoplay.
                 */
              }
            );

          }

        }


        /* ===============================================
           INACTIVE VIDEOS
        =============================================== */

        else {

          /*
           * IMPORTANT:
           *
           * Pause only.
           *
           * DON'T change currentTime.
           *
           * Therefore the actual MP4 remains visible
           * at its frozen frame.
           */

          video.pause();

        }

      }
    );

  }, [active]);


  /* =======================================================
     VIDEO ENDED

     When current video finishes,
     next wedge becomes active.
  ======================================================= */

  const handleVideoEnded = (
    index: number
  ) => {

    if (
      index !== active
    ) {
      return;
    }


    setActive(
      (current) =>
        (current + 1) %
        WEDGE_COUNT
    );

  };


  /* =======================================================
     MANUAL VIDEO ACTIVATION
  ======================================================= */

  const activateVideo = (
    index: number
  ) => {

    if (
      index === active
    ) {
      return;
    }


    setActive(index);

  };


  /* =======================================================
     RENDER
  ======================================================= */

  return (

    <section
      id="featured"
      className="editorial-featured"
    >

      {/* =================================================
          BACKGROUND
      ================================================= */}

      <div
        className="editorial-featured-glow"
      />


      {/* =================================================
          TOP LINE
      ================================================= */}

      <div
        className="
          editorial-featured-line
          editorial-featured-line-top
        "
      />


      {/* =================================================
          BOTTOM LINE
      ================================================= */}

      <div
        className="
          editorial-featured-line
          editorial-featured-line-bottom
        "
      />


      {/* =================================================
          LEFT CONTENT
      ================================================= */}

      <div
        data-reveal="left"
        className="editorial-featured-copy"
      >

        {/* NUMBER */}

        <p
          className="editorial-number"
          style={{
            opacity:
              contentFading
                ? 0
                : 1,
          }}
        >

          {content.number}

        </p>


        {/* COPY */}

        <div
          className="editorial-content"
          style={{
            opacity:
              contentFading
                ? 0
                : 1,
          }}
        >

          {/* LABEL */}

          <p
            className="editorial-label"
          >

            {content.label}

          </p>


          {/* TITLE */}

          <h2
            className="editorial-title"
          >

            {content.titleTop}

            <br />

            <em>

              {content.titleEm}

            </em>

          </h2>


          {/* LINE */}

          <div
            className="editorial-gold-line"
          />


          {/* DESCRIPTION */}

          <p
            className="editorial-description"
          >

            {content.description}

          </p>


          {/* CTA */}

          <a
            href="#collections"
            className="editorial-link"
          >

            {content.linkLabel}


            <svg
              width="18"
              height="8"
              viewBox="0 0 20 8"
              fill="none"
              aria-hidden="true"
            >

              <line
                x1="0"
                y1="4"
                x2="16"
                y2="4"
                stroke="currentColor"
                strokeWidth="1"
              />


              <polyline
                points="13,1 16,4 13,7"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              />

            </svg>

          </a>

        </div>

      </div>


      {/* =================================================
          RIGHT SEMICIRCLE VIDEO FAN
      ================================================= */}

      <div
        data-reveal="right"
        className="editorial-fan"
      >

        <svg
          viewBox={`0 0 ${R_OUTER} ${VIEW_HEIGHT}`}
          width="100%"
          height="100%"
          className="editorial-fan-svg"
        >

          {/* ===============================================
              WEDGE CLIPPING
          =============================================== */}

          <defs>

            {wedgeVideos.map(
              (_, i) => {

                const start =
                  -90 +
                  i * SWEEP;


                const end =
                  -90 +
                  (i + 1) *
                  SWEEP;


                return (

                  <clipPath
                    key={i}
                    id={`editorial-wedge-${i}`}
                  >

                    <path
                      d={
                        editorialWedgePath(
                          start,
                          end
                        )
                      }
                    />

                  </clipPath>

                );

              }
            )}

          </defs>


          {/* ===============================================
              VIDEO WEDGES
          =============================================== */}

          {wedgeVideos.map(
            (item, i) => {

              const start =
                -90 +
                i * SWEEP;


              const end =
                -90 +
                (i + 1) *
                SWEEP;


              const bbox =
                editorialWedgeBBox(
                  start,
                  end
                );


              const isActive =
                active === i;


              return (

                <g
                  key={item.src}

                  className={
                    isActive
                      ? "editorial-wedge is-active"
                      : "editorial-wedge"
                  }

                  onPointerEnter={() =>
                    activateVideo(i)
                  }

                  onPointerDown={() =>
                    activateVideo(i)
                  }
                >

                  {/* =====================================
                      ACTUAL MP4 VIDEO
                  ===================================== */}

                  <foreignObject
                    x={bbox.x}
                    y={bbox.y}

                    width={
                      bbox.width
                    }

                    height={
                      bbox.height
                    }

                    clipPath={`url(#editorial-wedge-${i})`}
                  >

                    <div
                      className="editorial-video-wrapper"
                    >

                      <video
                        ref={(element) => {

                          videoRefs.current[
                            i
                          ] = element;

                        }}

                        src={item.src}

                        muted

                        playsInline

                        preload="auto"

                        disablePictureInPicture

                        onEnded={() =>
                          handleVideoEnded(
                            i
                          )
                        }

                        className={
                          isActive
                            ? "editorial-wedge-video is-active"
                            : "editorial-wedge-video"
                        }
                      />

                    </div>

                  </foreignObject>


                  {/* =====================================
                      WEDGE GOLD BORDER
                  ===================================== */}

                  <path
                    d={
                      editorialWedgePath(
                        start,
                        end
                      )
                    }

                    fill="none"

                    stroke="#B39656"

                    strokeOpacity={
                      isActive
                        ? 0.95
                        : 0.35
                    }

                    strokeWidth={
                      isActive
                        ? 1.6
                        : 1
                    }

                    className="editorial-wedge-border"
                  />

                </g>

              );

            }
          )}

        </svg>

      </div>

    </section>

  );
}

export default function Index() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      }),
      { threshold: 0.14 },
    );
    document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  const go = (id: string) => {
    setMenuOpen(false);
    scrollTo(id);
  };

  return (
    <main className="bg-ink text-ivory selection:bg-gold selection:text-ink">
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-700 ${scrolled
          ? "bg-ink/95 shadow-2xl shadow-black/20 backdrop-blur-md header-scrolled"
          : "bg-transparent"
          }`}
      >
        <div className="mx-auto flex h-[82px] max-w-[1440px] items-center justify-between px-6 md:px-10 xl:px-16">

          {/* ================= LOGO ================= */}
          <button
            onClick={() => go("home")}
            className="group flex items-center"
            aria-label="Shree Laxmidas Jewellers home"
          >
            <img
              src="/logo.webp"
              alt="Shree Laxmidas Jewellers"
              className="
          h-[58px]
          w-auto
          object-contain
          transition-transform
          duration-500
          group-hover:scale-105
          md:h-[50px]
        "
            />
          </button>

          {/* ================= DESKTOP NAV ================= */}
          <nav className="nav-entrance hidden items-center gap-7 lg:flex">
            {navItems.map(([label, id]) => (
              <button
                key={id}
                onClick={() => go(id)}
                className="nav-link"
              >
                {label}
              </button>
            ))}
          </nav>

          {/* ================= RIGHT SIDE ================= */}
          <div className="flex items-center gap-3">

            <button
              onClick={() => go("contact")}
              className="
          hidden
          border
          border-gold/70
          px-5
          py-3
          text-[10px]
          font-semibold
          uppercase
          tracking-[0.18em]
          text-gold
          transition
          hover:bg-gold
          hover:text-ink
          sm:block
        "
            >
              Book an Appointment
            </button>

            {/* MOBILE MENU BUTTON */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 text-ivory lg:hidden"
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <X size={22} />
              ) : (
                <Menu size={22} />
              )}
            </button>

          </div>
        </div>

        {/* ================= MOBILE MENU ================= */}
        {menuOpen && (
          <div className="mobile-menu-reveal border-t border-white/10 bg-ink px-6 py-7 lg:hidden">
            <div className="flex flex-col gap-5">

              {navItems.map(([label, id]) => (
                <button
                  key={id}
                  onClick={() => go(id)}
                  className="text-left font-serif text-2xl text-ivory"
                >
                  {label}
                </button>
              ))}

              <button
                onClick={() => go("contact")}
                className="
            mt-3
            w-full
            border
            border-gold
            px-5
            py-4
            text-[10px]
            font-semibold
            uppercase
            tracking-[0.18em]
            text-gold
          "
              >
                Book an Appointment
              </button>

            </div>
          </div>
        )}
      </header>

      <section
        id="home"
        className="relative flex min-h-[760px] items-end overflow-hidden md:min-h-screen"
      >
        {/* =====================================================
      HERO BACKGROUND VIDEO
  ===================================================== */}
        <video
          className="
    hero-image
    absolute
    left-1/2
    top-1/2
    h-[100vw]
    w-[100vh]
    max-w-none
    -translate-x-1/2
    -translate-y-1/2
    -rotate-90
    object-cover
    object-center
  "
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
        >
          <source
            src="/videos/hero-video.mp4"
            type="video/mp4"
          />
        </video>

        {/* =====================================================
      DARK OVERLAYS
  ===================================================== */}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(17,16,14,.94)_0%,rgba(17,16,14,.55)_47%,rgba(17,16,14,.18)_100%)]" />

        <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/25" />

        {/* =====================================================
      HERO CONTENT
  ===================================================== */}
        <div className="relative z-10 mx-auto w-full max-w-[1440px] px-6 pb-24 pt-40 md:px-10 md:pb-28 xl:px-16">
          <div className="max-w-3xl animate-fade-up">
            <Label>
              Shree Laxmidas Jewellers
            </Label>

            <h1 className="mt-7 max-w-3xl font-serif text-[clamp(3.7rem,8vw,8.7rem)] leading-[.84] tracking-[-.055em] text-ivory">
              Elegance,
              <br />

              <em className="font-light text-gold">
                crafted
              </em>{" "}
              for
              <br />

              every story.
            </h1>

            <p className="mt-9 max-w-md text-sm leading-7 text-ivory/70 md:text-base">
              Discover timeless jewellery where heritage
              craftsmanship meets contemporary elegance.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-6">
              <button
                onClick={() => go("collections")}
                className="gold-button"
              >
                Explore Collection

                <ArrowUpRight size={15} />
              </button>

              <button
                onClick={() => go("contact")}
                className="line-button"
              >
                Book an Appointment

                <ArrowUpRight size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* =====================================================
      SCROLL INDICATOR
  ===================================================== */}
        <div className="scroll-indicator absolute bottom-9 right-6 z-10 hidden items-center gap-4 text-[9px] uppercase tracking-[0.28em] text-ivory/60 md:flex">
          <span>
            Scroll to discover
          </span>

          <span className="h-px w-16 bg-gold" />

          <ArrowDown
            size={13}
            className="text-gold"
          />
        </div>

        {/* =====================================================
    BOTTOM FADE
===================================================== */}
        <div
          className="
    pointer-events-none
    absolute
    inset-x-0
    bottom-0
    z-[5]
    h-[80px]
    bg-gradient-to-t
    from-[#050505]
    via-[#050505]/65
    to-transparent
  "
        />
      </section>

      {/* About Us Section */}
      <section
        id="about"
        className="about-luxury relative overflow-hidden bg-[#050505] text-white"
      >

        {/* =====================================================
      TOP SMOOTH FADE
  ===================================================== */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-[5] h-[260px]"
          style={{
            background:
              "linear-gradient(to bottom, #050505 0%, rgba(5,5,5,0.92) 12%, rgba(5,5,5,0.72) 30%, rgba(5,5,5,0.42) 52%, rgba(5,5,5,0.16) 74%, transparent 100%)",
          }}
        />
        {/* =====================================================
      BACKGROUND — SOFT CENTER GLOW
  ===================================================== */}
        <div className="about-background-glow pointer-events-none absolute inset-0" />

        {/* =====================================================
      SUBTLE BORDER
  ===================================================== */}
        <div className="pointer-events-none absolute inset-5 border border-white/[0.05] md:-inset-24" />

        {/* =====================================================
      MAIN CONTENT
  ===================================================== */}
        <div
          className="
      relative
      z-10
      mx-auto
      grid
      min-h-[820px]
      max-w-[1440px]
      items-center
      gap-14
      px-6
      py-0
      md:grid-cols-[0.9fr_1.1fr]
      md:gap-16
      md:px-10
      md:pt-0
      xl:px-16
    "
        >
          {/* ===================================================
        LEFT CONTENT
    =================================================== */}
          <div
            data-reveal="left"
            className="relative z-20 max-w-[590px] lg:-mt-20"
          >
            <Label>Our Story</Label>

            <h2
              className="
          mt-7
          font-serif
          text-[clamp(3.5rem,6vw,6.5rem)]
          leading-[0.9]
          tracking-[-0.045em]
          text-ivory
        "
            >
              Where heritage
              <br />

              <em className="font-light text-gold">
                meets
              </em>{" "}
              modern
              <br />

              elegance.
            </h2>

            {/* GOLD LINE */}
            <div className="mt-8 h-px w-24 bg-gradient-to-r from-gold to-transparent" />

            <p className="mt-8 max-w-lg text-sm leading-7 text-white/55 md:text-[15px]">
              Welcome to Shree Laxmidas Jewellers, where tradition
              meets innovation in every exquisite piece we craft.
              We take immense pride in offering the finest quality
              in every item we create.
            </p>
          </div>

          {/* ===================================================
        RIGHT JEWELLERY SHOWCASE
    =================================================== */}
          <div
            data-reveal="right"
            className="
        about-showcase
        relative
        mx-auto
        flex
        h-[620px]
        w-full
        max-w-[620px]
        items-center
        justify-center
        md:h-[700px]
      "
          >
            {/* =================================================
          SOFT LIGHT FROM TOP
      ================================================= */}
            <div className="about-light-source" />

            {/* =================================================
          MAIN SPOTLIGHT
      ================================================= */}
            <div className="about-spotlight-beam" />

            {/* =================================================
          SOFT INNER LIGHT
      ================================================= */}
            <div className="about-spotlight-soft" />

            {/* =================================================
          INNER CENTRAL GLOW
      ================================================= */}
            <div className="about-inner-glow" />

            {/* =================================================
          JEWELLERY IMAGE
      ================================================= */}
            <img
              src="/about-us1.png"
              alt="Shree Laxmidas jewellery"
              loading="lazy"
              className="about-jewellery-image"
            />

            {/* =================================================
          JEWELLERY BACK GLOW
      ================================================= */}
            <div className="about-jewellery-glow" />

            {/* =================================================
          FLOOR LIGHT
      ================================================= */}
            <div className="about-floor-light" />

            {/* =================================================
          PRODUCT SHADOW
      ================================================= */}
            <div className="about-product-shadow" />
          </div>
        </div>
      </section>

      <section id="collections" className="bg-ink px-6 py-24 md:px-10 md:py-16 xl:px-16">
        <div className="mx-auto max-w-[1440px]"><div data-reveal="up" className="flex flex-col justify-between gap-7 md:flex-row md:items-end"><div><Label>The collection</Label><h2 className="mt-7 max-w-2xl font-serif text-5xl leading-[.94] tracking-[-.04em] md:text-7xl">Explore our<br /><em className="font-light text-gold">collections.</em></h2></div><p className="max-w-xs text-sm leading-6 text-ivory/55">Timeless pieces, crafted to become part of your story.</p></div><div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{collections.map((collection, i) => <button key={collection.name} onClick={() => go("contact")} className={`collection-card group relative overflow-hidden text-left ${i === 0 ? "sm:row-span-2" : ""}`} data-reveal="up" style={{ "--reveal-delay": `${i * 90}ms` } as React.CSSProperties}><div className={`${i === 0 ? "aspect-[.72] sm:h-full" : "aspect-[1.05]"}`}><img src={collection.image} alt={collection.name} loading="lazy" className="h-full w-full object-cover transition duration-1000 ease-out group-hover:scale-105" /></div><div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/15 to-transparent transition duration-500 group-hover:from-ink/95" /><div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6"><div><span className="mb-3 block text-[10px] tracking-[.2em] text-gold">{collection.index}</span><h3 className="font-serif text-2xl text-ivory md:text-3xl">{collection.name}</h3></div><span className="flex h-9 w-9 items-center justify-center border border-white/35 text-gold transition group-hover:bg-gold group-hover:text-ink"><ArrowUpRight size={15} /></span></div></button>)}</div></div>
      </section>

      <SignatureShowcase />

      <section id="craftsmanship" className="bg-ivory px-6 py-24 text-ink md:px-10 md:py-36 xl:px-16"><div className="mx-auto max-w-[1280px]"><div data-reveal="up"><div className="grid items-end gap-8 md:grid-cols-[1fr_.7fr]"><div><Label>The art behind every piece</Label><h2 className="mt-7 max-w-3xl font-serif text-5xl leading-[.94] tracking-[-.04em] md:text-7xl">Crafted with<br /><em className="font-light text-gold">intention.</em></h2></div><p className="max-w-sm text-sm leading-7 text-ink/60">Every piece is meticulously designed and crafted to meet high standards of quality — a quiet expression of heritage, patience and detail.</p></div><div className="mt-16 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5"><div className="col-span-2 row-span-2"><img src={`${imageBase}Frame-160883.png`} alt="Jewellery craft detail" loading="lazy" className="h-full min-h-[380px] w-full object-cover" /></div><img src={`${imageBase}Frame-160882.png`} alt="Gold work detail" loading="lazy" className="aspect-square w-full object-cover" /><div className="flex aspect-square flex-col justify-between bg-ink p-5 text-ivory md:p-7"><span className="text-gold"><Minus /></span><div><p className="font-serif text-2xl">The detail<br />is the story.</p><p className="mt-4 text-[10px] uppercase tracking-[.18em] text-ivory/45">Authentic craftsmanship</p></div></div><img src={`${imageBase}Frame-160884.png`} alt="Jewellery finishing" loading="lazy" className="aspect-square w-full object-cover" /><img src={`${imageBase}Frame-160885.png`} alt="Jewellery polishing detail" loading="lazy" className="aspect-square w-full object-cover" /></div></div></div></section>

      <section className="border-y border-gold/20 bg-ink px-6 py-20 md:px-10 md:py-28 xl:px-16"><div data-reveal="up" className="mx-auto grid max-w-[1280px] grid-cols-2 gap-y-12 md:grid-cols-4 md:gap-8">{[["01", "Exceptional", "Craftsmanship"], ["02", "Authentic", "Quality"], ["03", "Timeless", "Designs"], ["04", "Personalized", "Service"]].map(([num, first, second]) => <div key={num} className="border-l border-gold/40 pl-5 md:pl-7"><span className="text-[10px] tracking-[.2em] text-gold">{num}</span><p className="mt-5 font-serif text-2xl leading-[.95] text-ivory md:text-3xl">{first}<br />{second}</p></div>)}</div></section>

      <section id="testimonials" className="bg-warm px-6 py-24 text-ink md:px-10 md:py-36 xl:px-16"><div data-reveal="up" className="mx-auto max-w-[1280px]"><div className="flex items-end justify-between"><div><Label>Stories from our clients</Label><h2 className="mt-7 font-serif text-5xl leading-[.94] tracking-[-.04em] md:text-7xl">Treasured by<br /><em className="font-light text-gold">many.</em></h2></div><div className="hidden text-gold md:block"><ChevronDown size={30} /></div></div><div className="mt-16 grid gap-px bg-ink/15 md:grid-cols-3">{[["“", "The pieces feel so thoughtfully made — traditional, but never dated. I found something that feels entirely my own.", "Aarushi M.", "Bengaluru"], ["“", "Every detail, from the curation to the way we were welcomed, felt personal. A beautiful experience from start to finish.", "Meera S.", "Bengaluru"], ["“", "Their jewellery carries a sense of occasion. It is the kind of piece you know will stay in your family for years.", "Rhea K.", "Mysuru"]].map(([mark, quote, name, city]) => <article key={name} className="bg-warm p-7 md:p-10"><span className="font-serif text-6xl leading-none text-gold">{mark}</span><p className="mt-4 font-serif text-2xl leading-[1.1]">{quote}</p><div className="mt-9 flex items-center gap-3 text-[10px] uppercase tracking-[.17em]"><span className="h-px w-7 bg-gold" />{name} <span className="text-ink/40">/ {city}</span></div></article>)}</div></div></section>

      <section className="relative overflow-hidden bg-ink px-6 py-24 md:px-10 md:py-36 xl:px-16"><img src={`${imageBase}Frame-7.png`} alt="Shree Laxmidas jewellery" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-20" /><div className="absolute inset-0 bg-ink/75" /><div data-reveal="up" className="relative mx-auto max-w-[1280px]"><Label>Why Shree Laxmidas</Label><div className="mt-8 grid gap-14 md:grid-cols-[1.1fr_.9fr] md:items-end"><h2 className="max-w-3xl font-serif text-5xl leading-[.92] tracking-[-.04em] md:text-8xl">More than an<br /><em className="font-light text-gold">ornament.</em></h2><div><p className="max-w-md text-lg leading-8 text-ivory/70">Jewellery carries memories, emotions and milestones. Ours is made to become part of yours.</p><div className="mt-9 flex flex-wrap gap-x-8 gap-y-3 text-[10px] uppercase tracking-[.2em] text-gold"><span>Heritage</span><span>Authenticity</span><span>Excellence</span></div></div></div></div></section>

      <section id="instagram" className="bg-ivory px-6 py-24 text-ink md:px-10 md:py-36 xl:px-16"><div data-reveal="up" className="mx-auto max-w-[1280px]"><div className="flex flex-col justify-between gap-7 md:flex-row md:items-end"><div><Label>Follow our journey</Label><h2 className="mt-7 font-serif text-5xl leading-[.94] tracking-[-.04em] md:text-7xl">A glimpse into<br /><em className="font-light text-gold">our world.</em></h2></div><a href="https://www.instagram.com/shreelaxmidasjewellers" target="_blank" rel="noreferrer" className="inline-flex items-center gap-3 text-xs tracking-[.1em] text-ink/60 transition hover:text-gold"><Camera size={17} /> @shreelaxmidasjewellers <ArrowUpRight size={14} /></a></div><div className="mt-14 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">{gallery.map((image, i) => <a key={image} href="https://www.instagram.com/shreelaxmidasjewellers" target="_blank" rel="noreferrer" className={`group overflow-hidden ${i === 0 ? "md:row-span-2" : ""}`}><img src={`${imageBase}${image}`} alt="Shree Laxmidas Jewellers Instagram" loading="lazy" className={`h-full w-full object-cover transition duration-700 group-hover:scale-105 ${i === 0 ? "min-h-[380px]" : "aspect-square"}`} /></a>)}</div></div></section>

      <section id="contact" className="bg-charcoal px-6 py-24 md:px-10 md:py-36 xl:px-16"><div data-reveal="up" className="mx-auto max-w-[1280px]"><Label>Visit us</Label><div className="mt-8 grid gap-14 md:grid-cols-[1.2fr_.8fr] md:items-end"><div><h2 className="max-w-3xl font-serif text-5xl leading-[.9] tracking-[-.04em] md:text-8xl">Find something<br /><em className="font-light text-gold">worth cherishing.</em></h2><p className="mt-8 max-w-md text-sm leading-7 text-ivory/60">Visit Shree Laxmidas Jewellers and experience our collection in person. For enquiries and appointments, we would love to hear from you.</p><div className="mt-9 flex flex-wrap gap-5"><a href="tel:+918792266916" className="gold-button">Call us <Phone size={15} /></a><a href="https://www.instagram.com/shreelaxmidasjewellers" target="_blank" rel="noreferrer" className="line-button">Contact us <ArrowUpRight size={15} /></a></div></div><div className="border-t border-gold/30 pt-7 text-sm text-ivory/60"><p className="text-[10px] uppercase tracking-[.2em] text-gold">Appointments & enquiries</p><a href="tel:+918792266916" className="mt-4 block font-serif text-2xl text-ivory transition hover:text-gold">+91 87922 66916</a><p className="mt-8 text-xs leading-6">Connect with us on Instagram for the latest collections, stories and store updates.</p><a href="https://www.instagram.com/shreelaxmidasjewellers" target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-xs text-gold"><Camera size={15} /> @shreelaxmidasjewellers</a></div></div></div></section>

      <footer className="bg-ink px-6 pb-8 pt-20 md:px-10 md:pt-28 xl:px-16"><div className="mx-auto max-w-[1440px]"><div className="flex flex-col justify-between gap-12 border-b border-white/10 pb-16 md:flex-row"><div><p className="font-serif text-3xl tracking-[.08em] text-ivory md:text-4xl">SHREE LAXMIDAS</p><p className="mt-3 text-[9px] tracking-[.52em] text-gold">JEWELLERS</p><p className="mt-8 max-w-xs text-sm leading-6 text-ivory/45">Where every piece tells a story. Tradition, authenticity and modern elegance — thoughtfully crafted.</p></div><div className="grid grid-cols-2 gap-x-16 gap-y-8 text-xs text-ivory/55 sm:grid-cols-3"><div><p className="mb-5 text-[10px] uppercase tracking-[.2em] text-gold">Explore</p><button onClick={() => go("about")} className="footer-link">Our story</button><button onClick={() => go("collections")} className="footer-link">Collections</button><button onClick={() => go("craftsmanship")} className="footer-link">Craftsmanship</button></div><div><p className="mb-5 text-[10px] uppercase tracking-[.2em] text-gold">Connect</p><a href="https://www.instagram.com/shreelaxmidasjewellers" target="_blank" rel="noreferrer" className="footer-link">Instagram</a><a href="https://www.facebook.com/share/yAnKUZHamtgUQsEL/" target="_blank" rel="noreferrer" className="footer-link">Facebook</a><a href="tel:+918792266916" className="footer-link">WhatsApp</a></div><div><p className="mb-5 text-[10px] uppercase tracking-[.2em] text-gold">Contact</p><a href="tel:+918792266916" className="footer-link">+91 87922 66916</a><button onClick={() => go("contact")} className="footer-link">Appointments</button></div></div></div><div className="flex flex-col justify-between gap-4 pt-7 text-[9px] uppercase tracking-[.16em] text-ivory/30 md:flex-row"><span>© 2026 Shree Laxmidas Jewellers</span><span>Crafted with heritage & intention</span></div></div></footer>
    </main>
  );
}
