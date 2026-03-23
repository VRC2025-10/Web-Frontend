import type { Variants } from "framer-motion";

export const springSnappy = {
  type: "spring" as const,
  stiffness: 400,
  damping: 15,
};

export const springGentle = {
  type: "spring" as const,
  stiffness: 200,
  damping: 20,
};

export const springSoft = {
  type: "spring" as const,
  stiffness: 300,
  damping: 25,
};

export const springBounce = {
  type: "spring" as const,
  stiffness: 500,
  damping: 10,
};

export const easeOut = {
  duration: 0.4,
  ease: [0, 0, 0.2, 1] as const,
};

export const easeInOut = {
  duration: 0.25,
  ease: [0.4, 0, 0.2, 1] as const,
};

export const duration = {
  instant: 0.1,
  fast: 0.15,
  normal: 0.25,
  slow: 0.4,
  slower: 0.6,
} as const;

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.4, ease: "easeOut" } },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};
