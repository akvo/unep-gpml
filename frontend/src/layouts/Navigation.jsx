import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MenuItem } from './MenuItem'

const menuVariants = {
  open: {
    transition: { staggerChildren: 0.07, delayChildren: 0.2 },
  },
  closed: {
    transition: { staggerChildren: 0.05, staggerDirection: -1 },
  },
}

const contentVariants = {
  enter: {
    x: '100%',
    opacity: 1,
  },
  center: {
    x: 0,
    opacity: 1,
    transition: {
      x: { type: 'tween', duration: 0.3 },
      opacity: { duration: 0.3 },
    },
  },
  exit: {
    x: '100%',
    opacity: 1,
    transition: {
      x: { type: 'tween', duration: 0.3 },
      opacity: { duration: 0.3 },
    },
  },
}

export const Navigation = ({ isOpen }) => {
  const [selectedMenuItem, setSelectedMenuItem] = React.useState(null)

  const handleMenuItemClick = (item) => {
    setSelectedMenuItem(item)
  }

  const renderContent = () => {
    if (selectedMenuItem) {
      return (
        <motion.div
          key="screenKey"
          initial="enter"
          animate="center"
          exit="exit"
          variants={contentVariants}
        >
          <h1>{selectedMenuItem} Content</h1>
          <button onClick={() => setSelectedMenuItem(null)}>Back</button>
        </motion.div>
      )
    } else if (isOpen) {
      return (
        <motion.ul
          key="menuList"
          variants={menuVariants}
          initial="closed"
          animate="open"
          exit="closed"
        >
          {itemIds.map((i) => (
            <MenuItem i={i} key={i} onClick={handleMenuItemClick} />
          ))}
        </motion.ul>
      )
    }
  }

  return <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>
}

const itemIds = ['Plastic', 'Tools', 'Countries', 'About Us']
