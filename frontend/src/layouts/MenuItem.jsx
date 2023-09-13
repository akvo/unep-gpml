import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CirclePointer } from '../components/icons'
import { Item } from './new-layout'

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

export const MenuItem = ({ i, item, onClick, collapseMenu }) => {
  const [isContentVisible, setContentVisible] = useState(false)
  const handleItemClick = () => {
    if (onClick) {
      onClick(i)
    } else {
      setContentVisible((prev) => !prev)
    }
  }
  const hoverAnimations = collapseMenu
    ? {}
    : { whileHover: { scale: 1.1 }, whileTap: { scale: 0.95 } }

  return (
    <motion.li
      className={isContentVisible ? 'open' : ''}
      variants={variants}
      {...hoverAnimations}
      onClick={handleItemClick}
    >
      <div className="sub-menu">
        <div className="header">
          <p className="p-s">{i}</p>
          <motion.div
            animate={{ rotate: isContentVisible ? 90 : 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className={isContentVisible ? 'header-icon open' : 'header-icon'}
          >
            <CirclePointer />
          </motion.div>
        </div>
        <AnimatePresence>
          {isContentVisible && (
            <motion.div
              key="content"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <ul className="collapse-list">
                {item?.children?.map((nav) => (
                  <li className="sub-menu-item">
                    <Item {...nav} />
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.li>
  )
}
