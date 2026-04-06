"use client";

import { useRef, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Clock } from "lucide-react";

const ARTICLES = [
  {
    slug: "the-complete-guide-to-magnesium",
    category: "Evidence Review",
    tagClass: "bg-teal-50 text-teal-700 border-teal-200",
    accentClass: "bg-teal-500",
    title: "The Complete Guide to Magnesium: Forms, Doses, and What the Science Actually Says",
    excerpt:
      "Not all magnesium is created equal. From glycinate to threonate, here's what 47 clinical trials reveal about choosing the right form.",
    readTime: "8 min read",
  },
  {
    slug: "5-supplement-myths-your-doctor-didnt-learn",
    category: "Myth Busting",
    tagClass: "bg-orange-50 text-orange-700 border-orange-200",
    accentClass: "bg-orange-400",
    title: "5 Supplement Myths Your Doctor Didn't Learn in Medical School",
    excerpt:
      "Medical education covers pharmacology extensively but nutrition science? Often just a few hours. Let's separate fact from fiction.",
    readTime: "6 min read",
  },
  {
    slug: "supplements-that-dont-mix-critical-interactions",
    category: "Safety Alert",
    tagClass: "bg-red-50 text-red-700 border-red-200",
    accentClass: "bg-red-500",
    title: "Supplements That Don't Mix: Critical Interactions You Need to Know",
    excerpt:
      "That fish oil you take with your blood thinner? It could be dangerous. A pharmacology expert breaks down the interactions that matter.",
    readTime: "7 min read",
  },
  {
    slug: "the-pcos-supplement-protocol",
    category: "Condition Guide",
    tagClass: "bg-purple-50 text-purple-700 border-purple-200",
    accentClass: "bg-purple-500",
    title: "The PCOS Supplement Protocol: What the Evidence Supports",
    excerpt:
      "Inositol, berberine, vitamin D — which supplements actually help PCOS? We review the clinical trials so you don't have to.",
    readTime: "9 min read",
  },
  {
    slug: "vitamin-d-why-80-percent-are-deficient",
    category: "Research Update",
    tagClass: "bg-blue-50 text-blue-700 border-blue-200",
    accentClass: "bg-blue-500",
    title: "Vitamin D: Why 80% of People Are Deficient and What to Do About It",
    excerpt:
      "The sunshine vitamin isn't just about bones anymore. New research links low vitamin D to immunity, mood, and metabolic health.",
    readTime: "5 min read",
  },
  {
    slug: "your-gut-brain-connection-probiotics-mental-health",
    category: "Deep Dive",
    tagClass: "bg-amber-50 text-amber-700 border-amber-200",
    accentClass: "bg-amber-500",
    title: "Your Gut-Brain Connection: How Probiotics Influence Mental Health",
    excerpt:
      "The gut-brain axis is revolutionising how we think about anxiety and depression. Here's what the latest psychobiotic research shows.",
    readTime: "10 min read",
  },
];

const CARD_GAP = 20; // gap-5 = 20px

export function BlogCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Track drag state
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  const scrollBy = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    // Get actual rendered card width from first card
    const firstCard = el.querySelector("[data-card]") as HTMLElement | null;
    const cardW = (firstCard?.offsetWidth ?? 320) + CARD_GAP;
    el.scrollBy({ left: direction === "left" ? -cardW : cardW, behavior: "smooth" });
  };

  // Mouse drag handlers
  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.pageX - (scrollRef.current?.offsetLeft ?? 0);
    scrollLeft.current = scrollRef.current?.scrollLeft ?? 0;
    if (scrollRef.current) scrollRef.current.style.cursor = "grabbing";
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - (scrollRef.current.offsetLeft ?? 0);
    const walk = (x - startX.current) * 1.2;
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const onMouseUp = () => {
    isDragging.current = false;
    if (scrollRef.current) scrollRef.current.style.cursor = "grab";
  };

  return (
    <div className="relative">
      {/* Left arrow */}
      <button
        onClick={() => scrollBy("left")}
        aria-label="Scroll left"
        className={`hidden lg:flex absolute -left-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-md shadow-black/10 items-center justify-center text-[#5A6578] hover:text-[#00685f] hover:shadow-lg transition-all duration-200 ${
          canScrollLeft ? "opacity-100" : "opacity-30 pointer-events-none"
        }`}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Scroll container */}
      <div
        ref={scrollRef}
        onScroll={updateArrows}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        className="flex gap-5 overflow-x-auto pb-4 select-none no-scrollbar"
        style={{
          scrollSnapType: "x mandatory",
          cursor: "grab",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {ARTICLES.map((article) => (
          <Link
            key={article.title}
            href={`/blog/${article.slug}`}
            data-card
            className="flex-shrink-0 flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm shadow-black/5 ring-1 ring-black/[0.04] hover:shadow-lg hover:ring-0 hover:shadow-black/8 transition-all duration-300 hover:-translate-y-0.5 group
              w-[80vw] sm:w-80 lg:w-[340px]"
            style={{ scrollSnapAlign: "start" }}
          >
            {/* Accent bar */}
            <div className={`h-1.5 w-full ${article.accentClass} flex-shrink-0`} />

            <div className="p-4 sm:p-5 flex flex-col flex-1">
              {/* Category tag */}
              <span className={`self-start inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full border mb-3 ${article.tagClass}`}>
                {article.category}
              </span>

              {/* Title */}
              <h3 className="font-heading text-[15px] font-bold text-[#1A2332] leading-snug mb-3 group-hover:text-[#00685f] transition-colors duration-200 line-clamp-3 flex-1">
                {article.title}
              </h3>

              {/* Excerpt */}
              <p className="text-sm text-[#5A6578] leading-relaxed line-clamp-2 mb-4">
                {article.excerpt}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 mt-auto">
                <div className="flex items-center gap-1.5 text-xs text-[#8896A8]">
                  <Clock className="w-3.5 h-3.5" />
                  {article.readTime}
                </div>
                <span className="text-xs font-semibold text-[#00685f] group-hover:text-[#005249] flex items-center gap-1 transition-colors">
                  Read more
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </Link>
        ))}

        {/* Trailing spacer so last card snaps nicely */}
        <div className="flex-shrink-0 w-1" aria-hidden="true" />
      </div>

      {/* Right arrow */}
      <button
        onClick={() => scrollBy("right")}
        aria-label="Scroll right"
        className={`hidden lg:flex absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-md shadow-black/10 items-center justify-center text-[#5A6578] hover:text-[#00685f] hover:shadow-lg transition-all duration-200 ${
          canScrollRight ? "opacity-100" : "opacity-30 pointer-events-none"
        }`}
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
