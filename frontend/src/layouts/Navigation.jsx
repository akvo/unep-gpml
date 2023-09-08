import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MenuItem } from './MenuItem'
import { MenuToggle } from './MenuToggle'
import {
  CirclePointer,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
} from '../components/icons'
import { Button } from 'antd'

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

const socialLinksVariants = {
  open: {
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.5,
      duration: 0.4,
    },
  },
  closed: {
    opacity: 0,
    y: 50,
  },
}

export const Navigation = ({ isOpen, toggleOpen }) => {
  const [selectedMenuItem, setSelectedMenuItem] = useState(null)

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
          <div className="toggle-button">
            {selectedMenuItem && (
              <Button onClick={() => setSelectedMenuItem(null)}>
                <CirclePointer />
                Back
              </Button>
            )}

            <MenuToggle
              toggle={() => {
                toggleOpen()
                setSelectedMenuItem(null)
              }}
              isOpen={isOpen}
            />
          </div>
          <div className="navigation-container">
            <h2>{selectedMenuItem} </h2>
            <motion.ul
              key="menuList"
              variants={menuVariants}
              initial="closed"
              animate="open"
              exit="closed"
            >
              {itemIds
                .find((item) => selectedMenuItem === item.key)
                .children.map((i) => (
                  <MenuItem
                    i={i.key}
                    key={i.key}
                    onClick={handleMenuItemClick}
                  />
                ))}
            </motion.ul>
          </div>
        </motion.div>
      )
    } else if (isOpen) {
      return (
        <>
          <div className="toggle-button" style={{ justifyContent: 'flex-end' }}>
            <MenuToggle
              toggle={() => {
                toggleOpen()
                setSelectedMenuItem(null)
              }}
              isOpen={isOpen}
            />
          </div>
          <div className="navigation-container">
            <motion.ul
              key="menuList"
              variants={menuVariants}
              initial="closed"
              animate="open"
              exit="closed"
            >
              {itemIds.map((i) => (
                <MenuItem i={i.key} key={i.key} onClick={handleMenuItemClick} />
              ))}
            </motion.ul>
            <motion.div
              className="social-links-container"
              variants={socialLinksVariants}
              initial="closed"
              animate="open"
              exit="closed"
            >
              <h6>Follow Us</h6>
              <ul className="social-links">
                <li>
                  <a
                    href="https://facebook.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FacebookIcon />
                  </a>
                </li>
                <li>
                  <a
                    href="http://twitter.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <TwitterIcon />
                  </a>
                </li>
                <li>
                  <a
                    href="https://linkedin.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <LinkedinIcon />
                  </a>
                </li>
              </ul>
            </motion.div>
          </div>
        </>
      )
    }
  }

  return (
    <>
      {/* <div className="toggle-button">
        {selectedMenuItem && (
          <Button onClick={() => setSelectedMenuItem(null)}>
            <CirclePointer />
            Back
          </Button>
        )}

        <MenuToggle
          toggle={() => {
            toggleOpen()
            setSelectedMenuItem(null)
          }}
          isOpen={isOpen}
        />
      </div> */}
      <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>
    </>
  )
}

const itemIds = [
  {
    key: 'Plastic',
    children: [
      {
        key: 'Topics',
      },
      {
        key: 'Basics',
      },
    ],
  },
  {
    key: 'Tools',
    children: [
      {
        key: 'Information',
      },
      {
        key: 'Community',
      },
      {
        key: 'Data hub',
      },
    ],
  },
  {
    key: 'Countries',
    children: [
      {
        key: 'Information',
      },
    ],
  },
  {
    key: 'About Us',
    children: [
      {
        key: 'The platform',
      },
      {
        key: 'Our Netwrok',
      },
      {
        key: 'Partnership',
      },
      {
        key: 'Contact us',
      },
    ],
  },
]
