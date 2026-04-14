"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { Quote } from "lucide-react";

import "swiper/css";
import "swiper/css/pagination";

interface Testimonial {
  quote: string;
  name: string;
  descriptor: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "The interaction checks flagged a supplement that would've clashed with my levothyroxine. My GP confirmed NutriGenius caught something I'd have missed on my own.",
    name: "Sarah M.",
    descriptor: "Managing hypothyroidism",
  },
  {
    quote:
      "As a vegan, I was always guessing at B12 and omega-3. The algorithm picked the exact forms and doses I needed — and pointed me to algae DHA I didn't know existed.",
    name: "David K.",
    descriptor: "Plant-based diet",
  },
  {
    quote:
      "I uploaded my recent bloodwork and got a protocol tuned to my actual ferritin and vitamin D numbers. It felt like a real consultation, not a generic quiz.",
    name: "Priya R.",
    descriptor: "Perimenopause support",
  },
  {
    quote:
      "Between training cycles my recovery stalled. The magnesium form and creatine timing NutriGenius suggested shifted things within three weeks.",
    name: "Marcus T.",
    descriptor: "High-performance athlete",
  },
  {
    quote:
      "I was overwhelmed by conflicting advice online. The personalized protocol cut through the noise and gave me a simple, safe routine I actually stick to.",
    name: "Elena V.",
    descriptor: "First-time supplement user",
  },
  {
    quote:
      "The evidence ratings on every recommendation helped me explain my stack to my cardiologist. She appreciated that nothing was pseudoscience — all cited trials.",
    name: "James O.",
    descriptor: "Post-cardiac rehab",
  },
];

export function TestimonialsCarousel() {
  return (
    <div className="testimonials-swiper-wrapper">
      <Swiper
        modules={[Autoplay, Pagination]}
        slidesPerView={1}
        spaceBetween={20}
        loop
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        pagination={{ clickable: true }}
        breakpoints={{
          640: { slidesPerView: 2, spaceBetween: 24 },
          1024: { slidesPerView: 3, spaceBetween: 24 },
        }}
        className="!pb-12"
      >
        {TESTIMONIALS.map((t) => (
          <SwiperSlide key={t.name} className="h-auto">
            <figure
              className="flex flex-col h-full bg-white ring-1 ring-[#e5ddd1] rounded-2xl p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-black/[0.06]"
              style={{ boxShadow: "0 1px 2px rgba(44, 36, 32, 0.04)" }}
            >
              <Quote
                className="w-5 h-5 text-[#bfa785] mb-4 flex-shrink-0"
                aria-hidden="true"
              />
              <blockquote className="flex-1 text-[#2c2420] text-[0.95rem] leading-relaxed mb-5">
                {t.quote}
              </blockquote>
              <figcaption className="pt-4 border-t border-[#f0ebe2]">
                <p className="font-heading text-sm font-bold text-[#2c2420]">
                  {t.name}
                </p>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#00685f] mt-1">
                  {t.descriptor}
                </p>
              </figcaption>
            </figure>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Brand-aligned pagination dots */}
      <style jsx global>{`
        .testimonials-swiper-wrapper .swiper-pagination {
          bottom: 0 !important;
        }
        .testimonials-swiper-wrapper .swiper-pagination-bullet {
          width: 8px;
          height: 8px;
          background: #bfa785;
          opacity: 0.35;
          transition: opacity 0.2s, transform 0.2s;
        }
        .testimonials-swiper-wrapper .swiper-pagination-bullet-active {
          background: #00685f;
          opacity: 1;
          transform: scale(1.2);
        }
      `}</style>
    </div>
  );
}
