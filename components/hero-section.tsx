"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

export function HeroSection() {
  const titleVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: custom * 0.2,
        duration: 0.8,
        ease: "easeOut",
      },
    }),
  };

  const scrollIndicatorVariants = {
    animate: {
      y: [0, 10, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-wine-700 to-black">
      <div className="container mx-auto px-4 text-center z-10">
        <motion.h1
          className="font-cinzel text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 tracking-wider"
          initial="hidden"
          animate="visible"
          custom={0}
          variants={titleVariants}
        >
          ALTDEUTSCHE
        </motion.h1>
        <motion.h2
          className="font-cinzel text-4xl md:text-6xl lg:text-7xl font-semibold text-gold-500 mb-8 tracking-widest"
          initial="hidden"
          animate="visible"
          custom={1}
          variants={titleVariants}
        >
          WEINSTUBE
        </motion.h2>
        <motion.p
          className="font-cormorant text-xl md:text-2xl text-gray-200 mb-12 max-w-2xl mx-auto"
          initial="hidden"
          animate="visible"
          custom={2}
          variants={titleVariants}
        >
          Erlesene deutsche Weine mit Tradition und Leidenschaft seit 1887
        </motion.p>
        <motion.div
          initial="hidden"
          animate="visible"
          custom={3}
          variants={titleVariants}
        >
          <a
            href="#features"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gold-500 text-black font-cinzel font-semibold rounded-full hover:bg-gold-500/90 hover:scale-105 transition-all duration-300 focus-visible-ring"
          >
            Entdecken Sie unsere Auswahl
          </a>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60"
        variants={scrollIndicatorVariants}
        animate="animate"
        aria-hidden="true"
      >
        <ChevronDown className="w-8 h-8" />
      </motion.div>

      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gold-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-wine-700 rounded-full blur-3xl"></div>
      </div>
    </section>
  );
}
