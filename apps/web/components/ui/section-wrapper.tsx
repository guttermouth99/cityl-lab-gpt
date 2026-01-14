"use client";

import { cn } from "@baito/ui/lib/utils";
import { motion } from "motion/react";
import type React from "react";

interface SectionWrapperProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export const SectionWrapper = ({
  children,
  className,
  id,
}: SectionWrapperProps) => {
  return (
    <section className={cn("relative py-24", className)} id={id}>
      <motion.div
        className="container relative z-10 mx-auto px-4 md:px-6"
        initial={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, margin: "-100px" }}
        whileInView={{ opacity: 1 }}
      >
        {children}
      </motion.div>
    </section>
  );
};
