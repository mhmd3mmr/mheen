"use client";

import { motion } from "framer-motion";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
};

type Props = {
  children: React.ReactNode;
  delay?: number;
  className?: string;
};

/**
 * Client-only fade-up animation wrapper. Use in server pages to avoid motion on server.
 */
export function FadeUp({ children, delay = 0, className }: Props) {
  return (
    <motion.div
      initial={fadeUp.initial}
      animate={fadeUp.animate}
      transition={{ ...fadeUp.transition, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
