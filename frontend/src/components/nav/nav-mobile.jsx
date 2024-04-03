import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MenuToggle } from './menu-toggle'
import {
  Check,
  CirclePointer,
  DownArrow,
  LinkedinIcon,
  World,
  YoutubeIcon,
  flags,
} from '../icons'
import { UIStore } from '../../store'
import { deepTranslate } from '../../utils/misc'
import Button from '../button'
import { Dropdown, Menu } from 'antd'
import { i18n } from '@lingui/core'
import Link from 'next/link'
import { Trans } from '@lingui/macro'
import classNames from 'classnames'
import { useRouter } from 'next/router'

const SOCIAL_LINKS = [
  {
    Icon: LinkedinIcon,
    url: 'https://ke.linkedin.com/company/global-partnership-on-marine-litter',
  },
  {
    Icon: YoutubeIcon,
    url: 'https://www.youtube.com/channel/UCoWXFwDeoD4c9GoXzFdm9Bg',
  },
]

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

const sidebar = {
  open: (height = 1000) => ({
    clipPath: `circle(${height * 2 + 200}px at 100% 0%)`,
    transition: {
      type: 'tween',
      duration: 0.5,
      ease: 'easeInOut',
    },
  }),
  closed: {
    clipPath: 'circle(0px at 100% 0px)',
    transition: {
      type: 'tween',
      duration: 0.5,
      ease: 'easeInOut',
    },
  },
  exit: {
    clipPath: 'circle(0px at 100% 0px)',
    transition: {
      type: 'tween',
      duration: 0.5,
      ease: 'easeInOut',
    },
  },
}

const NavMobile = ({
  isOpen,
  toggleOpen,
  isAuthenticated,
  setLoginVisible,
}) => {
  const router = useRouter()
  const [selectedMenuItem, setSelectedMenuItem] = useState(null)
  const { menuList } = UIStore.useState((s) => ({ menuList: s.menuList }))

  const menu = deepTranslate(menuList)

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial="closed"
          animate={isOpen ? 'open' : 'closed'}
          exit="exit"
          className="animation-container"
        >
          <motion.div className="mobile-menu-background" variants={sidebar} />
          <AnimatePresence mode="wait">
            {isOpen && <MainMenuContent key="main-menu" />}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )

  function MainMenuContent() {
    return (
      <>
        <MenuHeader />
        <div className="navigation-container" style={{ height: '100%' }}>
          <MainMenuItems />

          {!isAuthenticated && (
            <Button
              type="ghost"
              size="small"
              className="noicon login-btn"
              onClick={() => setLoginVisible(true)}
            >
              <Trans>Login</Trans>
            </Button>
          )}
          <Dropdown
            overlayClassName="lang-dropdown-wrapper"
            overlay={
              <Menu className="lang-dropdown">
                {[
                  { key: 'EN', label: 'English' },
                  { key: 'FR', label: 'French' },
                  { key: 'ES', label: 'Spanish' },
                ].map((lang) => (
                  <Menu.Item
                    className={classNames({
                      active: lang.key.toLowerCase() === router.locale,
                    })}
                    key={lang.key}
                    onClick={() => {
                      console.log(
                        lang.key.toLowerCase(),
                        'lang.key.toLowerCase()'
                      )
                      changeLanguage(lang.key.toLowerCase(), router)
                    }}
                  >
                    {flags[lang.key]}
                    {lang.label}
                    {lang.key.toLowerCase() === router.locale && (
                      <div className="check">
                        <Check />
                      </div>
                    )}
                  </Menu.Item>
                ))}
              </Menu>
            }
            trigger={['click']}
            placement="bottomRight"
          >
            <div className="lang-btn">
              <World />
              <span>{router.locale}</span>
              <DownArrow />
            </div>
          </Dropdown>
          <motion.div
            className="social-links-container"
            variants={socialLinksVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            <h6>Follow Us</h6>
            <ul className="social-links">
              {SOCIAL_LINKS.map(({ Icon, url }) => (
                <li key={url}>
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    <Icon />
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </>
    )
  }

  function MenuHeader() {
    return (
      <div
        className="toggle-button"
        style={selectedMenuItem ? {} : { justifyContent: 'flex-end' }}
      >
        {selectedMenuItem && (
          <Button onClick={() => setSelectedMenuItem(null)}>
            <CirclePointer />
            Back
          </Button>
        )}
        <MenuToggle toggle={handleToggle} isOpen={isOpen} />
      </div>
    )
  }

  function MainMenuItems() {
    return (
      <ul className="ant-menu">
        {menu.map((item) => (
          <Dropdown
            overlayClassName="nav-menu-item"
            placement="bottom"
            overlay={
              <Menu>
                {item.children.map((child) => (
                  <Menu.Item key={child.id}>
                    {child.to ? (
                      <Link href={child.to} legacyBehavior>
                        <a>{i18n._(child.key)}</a>
                      </Link>
                    ) : (
                      <a href={child.href}>{i18n._(child.key)}</a>
                    )}
                  </Menu.Item>
                ))}
              </Menu>
            }
          >
            <a
              className="ant-dropdown-link"
              onClick={(e) => e.preventDefault()}
            >
              {i18n._(item.key)} <DownArrow />
            </a>
          </Dropdown>
        ))}
      </ul>
    )
  }

  function handleToggle() {
    toggleOpen()
    setSelectedMenuItem(null)
  }
}

export default NavMobile
