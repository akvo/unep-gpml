import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MenuToggle } from './menu-toggle'
import {
  Check,
  CirclePointer,
  DownArrow,
  LinkedinIcon,
  NotificationIcon,
  World,
  YoutubeIcon,
  flags,
} from '../icons'
import { UIStore } from '../../store'
import { deepTranslate } from '../../utils/misc'
import Button from '../button'
import { Avatar, Dropdown, Menu } from 'antd'
import { i18n } from '@lingui/core'
import Link from 'next/link'
import { Trans } from '@lingui/macro'
import classNames from 'classnames'
import { useRouter } from 'next/router'
import { changeLanguage } from '../../translations/utils'
import NotificationPanel from '../notification-panel'
import { useDeviceSize } from '../../modules/landing/landing'

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
  profile,
  unreadCount,
  handleOnLogout,
  notifications,
  notificationLoading,
  handleViewMore,
  hasMoreNotifications,
  handleNotificationClick,
}) => {
  const [width] = useDeviceSize()
  const router = useRouter()
  const [selectedMenuItem, setSelectedMenuItem] = useState(null)
  const { menuList } = UIStore.useState((s) => ({ menuList: s.menuList }))
  const [dropdownVisible, setDropdownVisible] = useState(false)

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
      <div className="toggle-button" style={selectedMenuItem ? {} : {}}>
        {selectedMenuItem && (
          <Button onClick={() => setSelectedMenuItem(null)}>
            <CirclePointer />
            Back
          </Button>
        )}

        <div className="user-notification-container">
          <div
            className="user-avatar-container"
            style={{
              position: 'relative',
              display: 'inline-block',
            }}
          >
            <Dropdown
              overlayClassName="user-btn-dropdown-wrapper"
              overlay={
                <Menu className="user-btn-dropdown">
                  <Menu.Item key="add-content">
                    <Link href="/add-content">
                      <span>
                        <Trans>Add Content</Trans>
                      </span>
                    </Link>
                  </Menu.Item>
                  <Menu.Item
                    key="profile"
                    onClick={() => router.push({ pathname: `/profile` })}
                  >
                    <Trans>Profile</Trans>
                  </Menu.Item>
                  <Menu.Item
                    key="workspace"
                    onClick={() => router.push({ pathname: `/workspace` })}
                  >
                    <Trans>Workspace</Trans>
                  </Menu.Item>
                  <Menu.Item key="logout" onClick={handleOnLogout}>
                    <Trans>Logout</Trans>
                  </Menu.Item>
                </Menu>
              }
              trigger={['click']}
              placement="bottomRight"
            >
              <div style={{ position: 'relative', cursor: 'pointer' }}>
                <Avatar size="large" src={profile.picture}>
                  {profile?.firstName?.charAt(0)}
                  {profile?.lastName?.charAt(0)}
                </Avatar>
              </div>
            </Dropdown>
          </div>
          {unreadCount > 0 && (
            <Dropdown
              overlayClassName="notification-dropdown-wrapper"
              overlay={
                <NotificationPanel
                  notifications={notifications}
                  onViewMore={handleViewMore}
                  loading={notificationLoading}
                  isMobile={width < 768}
                  onClose={() => setDropdownVisible(false)}
                  hasMoreNotifications={hasMoreNotifications}
                  onNotificationClick={handleNotificationClick}
                />
              }
              trigger={['click']}
              placement="bottomRight"
            >
              <div className="notification-container">
                <NotificationIcon />
                <span className="notification-badge">{unreadCount}</span>
              </div>
            </Dropdown>
          )}
        </div>
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
