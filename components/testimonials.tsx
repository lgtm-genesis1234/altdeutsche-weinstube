"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";
import { useState, useEffect } from "react";

const testimonials = [
  {
    name: "Maria Schmidt",
    text: "Exzellente Auswahl und erstklassige Beratung. Die Altdeutsche Weinstube ist meine erste Adresse für besondere Anlässe.",
    rating: 5,
  },
  {
    name: "Thomas Weber",
    text: "Eine Weinstube mit Herz und Verstand. Die Expertise und Leidenschaft für deutsche Weine ist in jedem Gespräch spürbar.",
    rating: 5,
  },
  {
    name: "Anna Müller",
    text: "Seit Jahren meine erste Adresse für erlesene Weine. Die Qualität und der Service sind einfach unübertroffen.",
    rating: 5,
  },
];

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-wine-700/20 to-black">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-cinzel text-4xl md:text-5xl font-bold text-white mb-4 tracking-wide">
            Kundenstimmen
          </h2>
          <p className="font-cormorant text-xl text-gray-300 max-w-2xl mx-auto">
            Was unsere Kunden über uns sagen
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto relative min-h-[300px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-8 md:p-12"
            >
              <div className="flex gap-1 mb-6 justify-center" aria-label={`${testimonials[currentIndex].rating} Sterne`}>
                {Array.from({ length: testimonials[currentIndex].rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-gold-500 text-gold-500"
                    aria-hidden="true"
                  />
                ))}
              </div>

              <blockquote className="font-cormorant text-xl md:text-2xl text-white text-center mb-6 italic leading-relaxed">
                &ldquo;{testimonials[currentIndex].text}&rdquo;
              </blockquote>

              <p className="font-cinzel text-gold-500 text-center font-semibold">
                {testimonials[currentIndex].name}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Dot Navigation */}
          <div className="flex gap-2 justify-center mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 focus-visible-ring ${
                  index === currentIndex
                    ? "bg-gold-500 w-8"
                    : "bg-white/30 hover:bg-white/50"
                }`}
                aria-label={`Gehe zu Testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
