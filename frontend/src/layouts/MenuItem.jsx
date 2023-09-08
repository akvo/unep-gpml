import * as React from 'react'
import { motion } from 'framer-motion'
import { CirclePointer } from '../components/icons'

const variants = {
  open: {
    y: 0,
    opacity: 1,
    transition: {
      y: { stiffness: 1000, velocity: -100 },
    },
  },
  closed: {
    y: 50,
    opacity: 0,
    transition: {
      y: { stiffness: 1000 },
    },
  },
}

export const MenuItem = ({ i, onClick }) => {
  return (
    <motion.li
      variants={variants}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onClick(i)}
    >
      <div className="sub-menu-item">
        <p className="p-s">{i}</p>
        <CirclePointer />
      </div>
    </motion.li>
  )
}
