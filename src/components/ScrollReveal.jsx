import { motion } from 'framer-motion'

const variants = {
  fadeUp: {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0 }
  },
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  },
  fadeLeft: {
    hidden: { opacity: 0, x: -32 },
    visible: { opacity: 1, x: 0 }
  },
  fadeRight: {
    hidden: { opacity: 0, x: 32 },
    visible: { opacity: 1, x: 0 }
  },
  scale: {
    hidden: { opacity: 0, scale: 0.92 },
    visible: { opacity: 1, scale: 1 }
  }
}

export default function ScrollReveal({
  children,
  variant = 'fadeUp',
  delay = 0,
  duration = 0.7,
  className = '',
  once = true
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '-60px' }}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.4, 0.25, 1]
      }}
      variants={variants[variant] || variants.fadeUp}
      className={className}
    >
      {children}
    </motion.div>
  )
}
