export const cosmicSpring = {
  type: "spring" as const,
  damping: 28,
  stiffness: 180,
  mass: 0.8,
};

export const floatSpring = {
  type: "spring" as const,
  damping: 22,
  stiffness: 220,
};

export const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: cosmicSpring },
};

export const SPRING = cosmicSpring;

export const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

export const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: SPRING },
};
