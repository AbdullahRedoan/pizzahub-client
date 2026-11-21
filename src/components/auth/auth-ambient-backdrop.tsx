"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState, type ReactNode } from "react";

const ASSET_WIDTH = 480;
const ASSET_HEIGHT = 262;

type AmbientImageProps = {
  src: string;
  fallback: ReactNode;
  className: string;
};

function AmbientImage({ src, fallback, className }: AmbientImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) return <>{fallback}</>;

  return (
    <Image
      src={src}
      alt=""
      width={ASSET_WIDTH}
      height={ASSET_HEIGHT}
      draggable={false}
      onError={() => setFailed(true)}
      className={className}
    />
  );
}

function PizzaSliceFallback() {
  return (
    <svg
      viewBox="0 0 480 262"
      fill="none"
      aria-hidden="true"
      className="h-auto w-full text-accent"
    >
      <path
        d="M70 52h340L240 226 70 52Z"
        fill="currentColor"
        fillOpacity="0.1"
        stroke="currentColor"
        strokeOpacity="0.5"
        strokeWidth="3"
      />
      <path
        d="M70 52c70-34 270-34 340 0"
        stroke="currentColor"
        strokeOpacity="0.45"
        strokeWidth="14"
        strokeLinecap="round"
      />
      <circle cx="180" cy="106" r="17" fill="currentColor" fillOpacity="0.4" />
      <circle cx="264" cy="94" r="14" fill="currentColor" fillOpacity="0.4" />
      <circle cx="224" cy="158" r="16" fill="currentColor" fillOpacity="0.4" />
    </svg>
  );
}

function TruffleSliceFallback() {
  return (
    <svg
      viewBox="0 0 480 262"
      fill="none"
      aria-hidden="true"
      className="h-auto w-full text-accent"
    >
      <path
        d="M70 52h340L240 226 70 52Z"
        fill="currentColor"
        fillOpacity="0.08"
        stroke="currentColor"
        strokeOpacity="0.45"
        strokeWidth="3"
      />
      <path
        d="M70 52c70-34 270-34 340 0"
        stroke="currentColor"
        strokeOpacity="0.4"
        strokeWidth="14"
        strokeLinecap="round"
      />
      <g fill="currentColor" fillOpacity="0.35">
        <path d="M146 100c10-18 40-19 50-2 3 8-5 14-13 13l-28-1c-9-1-13-5-9-10Z" />
        <path d="M244 84c10-18 40-19 50-2 3 8-5 14-13 13l-28-1c-9-1-13-5-9-10Z" />
        <path d="M202 154c10-18 40-19 50-2 3 8-5 14-13 13l-28-1c-9-1-13-5-9-10Z" />
      </g>
    </svg>
  );
}

function WholePieFallback() {
  return (
    <svg
      viewBox="0 0 480 262"
      fill="none"
      aria-hidden="true"
      className="h-auto w-full text-primary"
    >
      <circle
        cx="240"
        cy="131"
        r="108"
        fill="currentColor"
        fillOpacity="0.08"
        stroke="currentColor"
        strokeOpacity="0.45"
        strokeWidth="14"
      />
      <circle
        cx="240"
        cy="131"
        r="86"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="2"
      />
      <g fill="currentColor" fillOpacity="0.3">
        <circle cx="205" cy="102" r="11" />
        <circle cx="272" cy="112" r="9" />
        <circle cx="238" cy="164" r="10" />
        <circle cx="292" cy="158" r="7" />
      </g>
    </svg>
  );
}

export function AuthAmbientBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 select-none overflow-hidden"
    >
      {/* 1. Top-left — soft pepperoni slice + wood-fired note */}
      <motion.div
        animate={{ y: [0, -14, 0], rotate: [-12, -7, -12] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-[4%] top-[10%] hidden w-28 md:block lg:left-[8%] lg:w-48"
      >
        <AmbientImage
          src="/images/hero-pepperoni-slice.png"
          fallback={<PizzaSliceFallback />}
          className="h-auto w-full object-contain opacity-45 blur-[2px]"
        />
        <p className="mt-1 font-script text-xl text-accent/70">
          900°F Wood-Fired
        </p>
      </motion.div>

      {/* 2. Mid-left — botanical basil silhouette inside a hairline ring */}
      <motion.div
        animate={{ y: [0, 16, 0], rotate: [0, 3, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-[5%] top-[45%] hidden md:block lg:left-[10%]"
      >
        <div className="relative flex h-40 w-40 items-center justify-center rounded-full border border-border/60">
          <svg
            viewBox="0 0 100 120"
            fill="none"
            aria-hidden="true"
            className="h-24 w-20 text-primary/35"
          >
            <path
              d="M50 6C24 28 12 62 20 92c5 20 20 26 30 26s25-6 30-26C88 62 76 28 50 6Z"
              stroke="currentColor"
              strokeWidth="1.6"
            />
            <path d="M50 14v100" stroke="currentColor" strokeWidth="1.2" />
            <path
              d="M50 40 28 30M50 40l22-10M50 64 26 54M50 64l24-10M50 88l-20-8M50 88l20-8"
              stroke="currentColor"
              strokeWidth="1"
            />
          </svg>
        </div>
      </motion.div>

      {/* 3. Bottom-left — tomato & cracked peppercorn cluster */}
      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[8%] left-[6%] hidden w-28 md:block lg:left-[11%] lg:w-40"
      >
        <svg
          viewBox="0 0 180 140"
          fill="none"
          aria-hidden="true"
          className="h-auto w-full text-accent/50 opacity-40 blur-[3px]"
        >
          <circle cx="62" cy="72" r="38" fill="currentColor" fillOpacity="0.45" />
          <circle cx="120" cy="94" r="29" fill="currentColor" fillOpacity="0.4" />
          <path
            d="M62 34c-8-12-20-10-22-4 8 6 15 8 22 4Zm0 0c8-12 20-10 22-4-8 6-15 8-22 4Z"
            fill="currentColor"
            fillOpacity="0.6"
          />
          <g fill="currentColor" fillOpacity="0.7">
            <circle cx="28" cy="118" r="4" />
            <circle cx="44" cy="126" r="3" />
            <circle cx="96" cy="128" r="4" />
            <circle cx="148" cy="122" r="3" />
            <circle cx="160" cy="60" r="3.5" />
          </g>
        </svg>
      </motion.div>

      {/* 4. Top-right — soft truffle slice + sourdough note */}
      <motion.div
        animate={{ y: [0, 14, 0], rotate: [10, 15, 10] }}
        transition={{ duration: 7.8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-[4%] top-[14%] hidden w-28 md:block lg:right-[8%] lg:w-48"
      >
        <AmbientImage
          src="/images/hero-truffle-slice.png"
          fallback={<TruffleSliceFallback />}
          className="h-auto w-full object-contain opacity-45 blur-[2px]"
        />
        <p className="mt-1 text-right font-script text-xl text-accent/70">
          48h Sourdough
        </p>
      </motion.div>

      {/* 5. Mid-right — roasted garlic & rosemary line art in a soft ring */}
      <motion.div
        animate={{ y: [0, -12, 0], rotate: [0, -4, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-[5%] top-[48%] hidden md:block lg:right-[10%]"
      >
        <div className="relative flex h-40 w-40 items-center justify-center rounded-full border border-border/50">
          <svg
            viewBox="0 0 120 120"
            fill="none"
            aria-hidden="true"
            className="h-24 w-24 text-foreground/20"
          >
            <path
              d="M42 98c-14-4-22-18-22-34 0-19 12-34 28-34s28 15 28 34c0 16-8 30-22 34"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            <path
              d="M48 30V18M48 18c-6-6-14-4-16 2 6 3 11 3 16-2Zm0 0c6-6 14-4 16 2-6 3-11 3-16-2Z"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
            <path d="M36 46c6 6 18 6 24 0M34 62c8 7 20 7 28 0" stroke="currentColor" strokeWidth="1.2" />
            <path
              d="M84 100C86 72 94 48 108 30"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
            <path
              d="M89 82 76 74M92 72 79 62M96 62 85 51M100 52 92 41M104 42 99 33M88 90 74 86"
              stroke="currentColor"
              strokeWidth="1.1"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </motion.div>

      {/* 6. Bottom-right — soft mini Neapolitan pie */}
      <motion.div
        animate={{ y: [0, -10, 0], rotate: [0, 8, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[6%] right-[6%] hidden w-28 md:block lg:right-[11%] lg:w-44"
      >
        <AmbientImage
          src="/images/hero-neapolitan.png"
          fallback={<WholePieFallback />}
          className="h-auto w-full object-contain opacity-35 blur-[3px]"
        />
      </motion.div>
    </div>
  );
}
