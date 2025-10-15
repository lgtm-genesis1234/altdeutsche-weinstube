"use client";

import { motion } from "framer-motion";
import { ArrowRight, Shield, CheckCircle, Award } from "lucide-react";

const trustBadges = [
  {
    icon: Shield,
    text: "Sichere Zahlung",
  },
  {
    icon: CheckCircle,
    text: "Geprüfte Qualität",
  },
  {
    icon: Award,
    text: "Seit 1887",
  },
];

export function CTASection() {
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-black to-wine-700 relative overflow-hidden">
      {/* Decorative blurs */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-gold-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-wine-700 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <h2 className="font-cinzel text-4xl md:text-5xl font-bold text-white mb-6 tracking-wide">
            Entdecken Sie unsere Weinkarte
          </h2>
          <p className="font-cormorant text-xl text-gray-200 mb-8 leading-relaxed">
            Tauchen Sie ein in die Welt erlesener deutscher Weine. Von kräftigen 
            Rotweinen bis zu eleganten Weißweinen - unsere Auswahl lässt keine Wünsche offen.
          </p>

          <motion.a
            href="/weinkarte"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gold-500 text-black font-cinzel font-semibold rounded-full hover:bg-gold-500/90 group transition-all duration-300 focus-visible-ring"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Zur Weinkarte
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
          </motion.a>

          {/* Trust Badges */}
          <div className="mt-12 flex flex-wrap justify-center gap-8">
            {trustBadges.map((badge) => {
              const Icon = badge.icon;
              return (
                <motion.div
                  key={badge.text}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="flex items-center gap-2 text-gray-300"
                >
                  <Icon className="w-5 h-5 text-gold-500" aria-hidden="true" />
                  <span className="font-cormorant text-sm">{badge.text}</span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
