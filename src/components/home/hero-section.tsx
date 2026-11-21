"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";

type FloatingAssetProps = {
  src: string;
  className: string;
  width: number;
  height: number;
  baseRotate: number;
  floatDistance?: number;
  rotateSwing?: number;
  duration?: number;
  delay?: number;
  priority?: boolean;
};

function FloatingAsset({
  src,
  className,
  width,
  height,
  baseRotate,
  floatDistance = 16,
  rotateSwing = 3,
  duration = 7,
  delay = 0,
  priority = false,
}: FloatingAssetProps) {
  const [hasError, setHasError] = useState(false);

  // Missing optional artwork should disappear quietly rather than leave a
  // broken-image icon in the hero stage.
  if (hasError) return null;

  return (
    <motion.div
      aria-hidden="true"
      animate={{
        y: [0, -floatDistance, 0],
        rotate: [
          baseRotate - rotateSwing,
          baseRotate + rotateSwing,
          baseRotate - rotateSwing,
        ],
      }}
      transition={{
        y: { duration, delay, repeat: Infinity, ease: "easeInOut" },
        rotate: {
          duration: duration + 1.5,
          delay,
          repeat: Infinity,
          ease: "easeInOut",
        },
      }}
      className={cn("pointer-events-none absolute z-0 select-none", className)}
    >
      <Image
        src={src}
        alt=""
        width={width}
        height={height}
        loading="eager"
        priority={priority}
        draggable={false}
        onError={() => setHasError(true)}
        className="h-auto w-full object-contain drop-shadow-2xl"
      />
    </motion.div>
  );
}

export function HeroSection() {
  return (
    <section className="relative flex min-h-[36rem] flex-col items-center justify-center overflow-hidden rounded-b-[3.5rem] border-b border-border bg-card pb-16 pt-8 lg:min-h-[42rem] lg:rounded-b-[6rem] lg:pb-24 lg:pt-16">
      {/* Top-left: pepperoni cheese-pull slice */}
      <FloatingAsset
        src="/images/hero-pepperoni-slice.png"
        width={480}
        height={262}
        baseRotate={-12}
        floatDistance={14}
        rotateSwing={3}
        duration={7}
        className="-left-16 top-2 w-48 sm:-left-8 sm:w-64 lg:left-2 lg:top-8 lg:w-80"
      />

      {/* Right: main whole Neapolitan — the LCP asset */}
      <FloatingAsset
        src="/images/hero-neapolitan.png"
        width={480}
        height={262}
        baseRotate={8}
        floatDistance={20}
        rotateSwing={2.5}
        duration={8}
        priority
        className="-right-20 top-6 w-56 sm:-right-12 sm:w-72 lg:right-0 lg:top-10 lg:w-[26rem]"
      />

      {/* Bottom-left: gourmet mushroom & truffle slice */}
      <FloatingAsset
        src="/images/hero-truffle-slice.png"
        width={480}
        height={262}
        baseRotate={10}
        floatDistance={16}
        rotateSwing={3}
        duration={7.5}
        className="-bottom-8 left-[2%] w-48 sm:bottom-0 sm:w-64 lg:bottom-4 lg:left-[7%] lg:w-72"
      />

      {/* Small basil and heirloom tomato garnishes */}
      <FloatingAsset
        src="/images/pizza/basil.svg"
        width={120}
        height={120}
        baseRotate={45}
        floatDistance={10}
        rotateSwing={4}
        duration={6}
        delay={0.4}
        className="left-[14%] top-[44%] w-10 lg:left-[22%] lg:w-14"
      />
      <FloatingAsset
        src="/images/pizza/basil.svg"
        width={120}
        height={120}
        baseRotate={-12}
        floatDistance={8}
        rotateSwing={5}
        duration={6.5}
        delay={0.8}
        className="right-[16%] top-[52%] w-8 lg:right-[24%] lg:w-12"
      />
      <FloatingAsset
        src="/images/pizza/tomato.svg"
        width={100}
        height={100}
        baseRotate={0}
        floatDistance={12}
        rotateSwing={6}
        duration={5.5}
        delay={0.2}
        className="right-[28%] top-[26%] w-6 lg:right-[34%] lg:w-8"
      />
      <FloatingAsset
        src="/images/pizza/tomato.svg"
        width={100}
        height={100}
        baseRotate={0}
        floatDistance={9}
        rotateSwing={5}
        duration={6.2}
        delay={0.6}
        className="bottom-[22%] right-[10%] w-5 lg:right-[16%] lg:w-7"
      />

      <div className="pointer-events-none absolute left-[15%] top-[60%] z-0 hidden lg:block">
        <p className="font-script text-2xl text-accent">Wood-fired at 900°F</p>
        <span className="mt-1 block h-px w-28 rotate-[28deg] bg-accent" />
      </div>
      <div className="pointer-events-none absolute bottom-[28%] right-[13%] z-0 hidden lg:block">
        <p className="font-script text-xl text-accent">Slow-fermented daily</p>
        <span className="ml-auto mt-1 block h-px w-20 -rotate-[24deg] bg-accent" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 text-center md:gap-8">
        <p className="font-script text-2xl text-accent md:text-3xl">
          Artisanal hand-stretched sourdough
        </p>

        <h1 className="font-serif text-4xl font-bold italic leading-[1.05] text-foreground sm:text-5xl lg:text-7xl">
          Hot &amp; Fresh Pizza Delivered to Your Door
        </h1>

        <p className="max-w-2xl text-sm leading-relaxed text-foreground/70 sm:text-base">
          Local neighborhood bakeries, wood-fired hearths and a courier who
          knows the way. Every pie is stretched by hand, fired to a blistered
          crust and tracked all the way to your doorstep.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 rounded-full border border-primary bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground"
            >
              Explore Pizza Menu
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
            <Link
              href="/sign-up"
              className="inline-flex items-center rounded-full border border-border px-7 py-3 text-sm font-semibold text-foreground transition-colors hover:text-accent"
            >
              Partner as a Vendor
            </Link>
          </motion.div>
        </div>

        <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-foreground/60">
          <MapPin className="h-3.5 w-3.5 text-accent" />
          Dhanmondi &amp; Gulshan, Dhaka
        </p>
      </div>
    </section>
  );
}
