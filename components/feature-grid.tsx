"use client";

import { motion } from "framer-motion";
import { Wine, Award, MapPin, Heart } from "lucide-react";
import { useInView } from "framer-motion";
import { useRef } from "react";

const features = [
  {
    icon: Wine,
    title: "Erlesene Auswahl",
    description: "Handverlesene Premium-Weine aus den besten deutschen Anbaugebieten",
  },
  {
    icon: Award,
    title: "Prämierte Qualität",
    description: "Ausgezeichnete Weine von renommierten Winzern und Weingütern",
  },
  {
    icon: MapPin,
    title: "Regionale Vielfalt",
    description: "Von der Mosel über den Rheingau bis zur Pfalz - die besten Regionen",
  },
  {
    icon: Heart,
    title: "Mit Leidenschaft",
    description: "Seit 1887 verbinden wir Tradition mit Expertise und Herzblut",
  },
];

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const Icon = feature.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group p-6 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 hover:border-gold-500/50 hover:scale-105 transition-all duration-300 cursor-pointer"
    >
      <div className="mb-4 inline-flex p-3 rounded-full bg-wine-700/20 text-gold-500 group-hover:bg-wine-700/40 transition-colors duration-300">
        <Icon className="w-8 h-8" aria-hidden="true" />
      </div>
      <h3 className="font-cinzel text-xl font-semibold text-white mb-2">
        {feature.title}
      </h3>
      <p className="font-cormorant text-gray-300 leading-relaxed">
        {feature.description}
      </p>
    </motion.div>
  );
}

export function FeatureGrid() {
  return (
    <section id="features" className="py-20 px-4 bg-gradient-to-b from-black to-wine-700/20">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-cinzel text-4xl md:text-5xl font-bold text-white mb-4 tracking-wide">
            Unsere Philosophie
          </h2>
          <p className="font-cormorant text-xl text-gray-300 max-w-2xl mx-auto">
            Was uns zu Ihrem vertrauenswürdigen Partner für deutsche Weine macht
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
