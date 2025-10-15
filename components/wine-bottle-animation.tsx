"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Wine } from "lucide-react";

export function WineBottleAnimation() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0.3]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.8]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 15]);

  return (
    <div ref={ref} className="relative h-screen">
      <motion.div
        style={{ y, opacity, scale, rotate, willChange: "transform" }}
        className="fixed top-1/3 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
      >
        <Wine
          className="w-32 h-32 md:w-48 md:h-48 text-wine-700 drop-shadow-2xl"
          aria-hidden="true"
        />
      </motion.div>
    </div>
  );
}
