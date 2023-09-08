import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { isEmpty } from 'lodash'
import { Button, Col, Row } from 'antd'
import localFont from 'next/font/local'
import { DM_Sans } from 'next/font/google'
import Image from 'next/image'
import Footer from '../footer'
import Login from '../modules/login/view'
import { DownArrow, CloseIcon, MenuIcon } from '../components/icons'
import Link from 'next/link'
import { motion, AnimatePresence, useCycle } from 'framer-motion'
import BookIcon from '../images/book-open.svg'
import CaseStudiesSvg from '../images/folder.svg'
import CapacityBuildingSvg from '../images/owl.svg'
import HelpCenterSvg from '../images/help.svg'
import IconCommunity from '../images/community.svg'
import ExpertIcon from '../images/education.svg'
import IconEvent from '../images/calendar.svg'
import IconPartner from '../images/partners.svg'
import IconForum from '../images/engage.svg'
import AnalyticAndStatisticSvg from '../images/statistics.svg'
import DataCatalogueSvg from '../images/archive.svg'
import GlossarySvg from '../images/glossary.svg'
import MapSvg from '../images/map.svg'
import ExploreSvg from '../images/api.svg'
import { useDeviceSize } from '../modules/landing/landing'
import { MenuToggle } from './MenuToggle'
import { Navigation } from './Navigation'

const navVariants = {
  open: { scale: 1, opacity: 1 },
  closed: { scale: 0.95, opacity: 0 },
}

const menuItemVariants = {
  open: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.5 + i * 0.1,
    },
  }),
  closed: { opacity: 0, y: 50 },
}

const pathContent = {
  '/knowledge/library': {
    title: 'Knowledge library',
    subtitle: 'Resources on marine litter and plastic pollution',
    icon: <BookIcon />,
  },
  '/knowledge/case-studies': {
    title: 'Case studies',
    icon: <CaseStudiesSvg />,
    subtitle: 'Compilation of actions around the world',
    iconClass: 'casestudies',
  },
  '/knowledge/capacity-development': {
    title: 'Learning center',
    subtitle: 'Learning and capacity development resources',
    icon: <CapacityBuildingSvg />,
    iconClass: 'learning',
  },
  '/community': {
    title: 'Members',
    iconClass: 'tools-community-icon',
    subtitle: 'Directory of GPML network entities and individuals',
    icon: <IconCommunity />,
  },
  '/experts': {
    title: 'Experts',
    iconClass: 'tools-experts-icon',
    subtitle: "Tool to find an expert and experts' groups",
    icon: <ExpertIcon />,
  },
  '/events': {
    title: 'Events',
    subtitle: 'Global events calendar',
    icon: <IconEvent />,
  },
  '/partners': {
    title: 'Partners',
    iconClass: 'tools-partners-icon',
    subtitle: 'Directory of partners of the GPML Digital Platform',
    icon: <IconPartner />,
  },
  // "/glossary": {
  //   title: "Glossary",
  //   subtitle: "Terminology and definitions",
  //   icon: <GlossarySvg />,
  // },
  '/help-center': {
    title: 'Help Center',
    subtitle: 'Support on GPML Digital Platform',
    icon: <HelpCenterSvg />,
  },
  // "/about-us": {
  //   title: "About GPML",
  //   subtitle: "Find out more about us",
  //   icon: <AboutSvg />,
  // },
}

const Item = ({ title, subtitle, icon, iconClass, to, href, setShowMenu }) => {
  if (to != null) {
    icon = pathContent[to].icon
    title = pathContent[to].title
    subtitle = pathContent[to].subtitle
  }
  return (
    <>
      <div className="icon">{icon}</div>
      <div className="content">
        <b className="p-s">{title}</b>
        <span>{subtitle}</span>
      </div>
    </>
  )
}

const PlasticMenu = () => {
  return (
    <div className="container sub-menu">
      <Row gutter={[168, 168]}>
        <Col span={8}>
          <p className="p-m">Information</p>
          <ul>
            <motion.li
              key={'0'}
              custom={0}
              variants={menuItemVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="menu-item"
            >
              <Item to="/knowledge/library" />
            </motion.li>
            <motion.li
              key={'1'}
              custom={1}
              variants={menuItemVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="menu-item"
            >
              <Item to="/knowledge/case-studies" />
            </motion.li>
            <motion.li
              key={'2'}
              custom={2}
              variants={menuItemVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="menu-item"
            >
              <Item to="/knowledge/capacity-development" />
            </motion.li>
            <motion.li
              key={'3'}
              custom={3}
              variants={menuItemVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="menu-item"
            >
              <Item to="/help-center" />
            </motion.li>
          </ul>
        </Col>
        <Col span={8}>
          <p className="p-m">Community</p>{' '}
          <ul>
            <motion.li
              key={'0'}
              custom={0}
              variants={menuItemVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="menu-item"
            >
              <Item to="/community" />
            </motion.li>
            <motion.li
              key={'1'}
              custom={1}
              variants={menuItemVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="menu-item"
            >
              <Item to="/experts" />
            </motion.li>
            <motion.li
              key={'2'}
              custom={2}
              variants={menuItemVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="menu-item"
            >
              <Item to="/events" />
            </motion.li>
            <motion.li
              key={'3'}
              custom={3}
              variants={menuItemVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="menu-item"
            >
              <Item to="/partners" />
            </motion.li>
            <motion.li
              key={'4'}
              custom={4}
              variants={menuItemVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="menu-item"
            >
              <Item
                href="https://communities.gpmarinelitter.org"
                title="Engage"
                subtitle="Interactive forum for collaboration"
                icon={<IconForum />}
              />
            </motion.li>
          </ul>
        </Col>
        <Col span={8}>
          <p className="p-m">Data Hub</p>
          <ul>
            <motion.li
              key={'0'}
              custom={0}
              variants={menuItemVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="menu-item"
            >
              <Item
                href="https://datahub.gpmarinelitter.org"
                title="Analytics & statistics"
                subtitle="Metrics to measure progress"
                icon={<AnalyticAndStatisticSvg />}
              />
            </motion.li>
            <motion.li
              key={'1'}
              custom={1}
              variants={menuItemVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="menu-item"
            >
              <Item
                href="https://unepazecosysadlsstorage.z20.web.core.windows.net/"
                title="Data Catalogue"
                subtitle="Datasets on plastic pollution and marine litter"
                icon={<DataCatalogueSvg />}
              />
            </motion.li>
            <motion.li
              key={'2'}
              custom={2}
              variants={menuItemVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="menu-item"
            >
              <Item
                href="https://datahub.gpmarinelitter.org/pages/glossary/"
                title="Glossary"
                subtitle="Terminology and definitions"
                icon=<GlossarySvg />
              />
            </motion.li>
            <motion.li
              key={'3'}
              custom={3}
              variants={menuItemVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="menu-item"
            >
              <Item
                href="https://datahub.gpmarinelitter.org/pages/story_map"
                title="Story Maps"
                subtitle="Storytelling with custom maps"
                icon={<MapSvg />}
              />
            </motion.li>
            <motion.li
              key={'4'}
              custom={4}
              variants={menuItemVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="menu-item"
            >
              <Item
                href="https://datahub.gpmarinelitter.org/pages/api-explore"
                title="API explore"
                subtitle="Web services and APIs"
                icon={<ExploreSvg />}
              />
            </motion.li>
          </ul>
        </Col>
      </Row>
    </div>
  )
}

const ToolsMenu = () => (
  <div className="submenu">
    {/* Content specific to the Tools menu */}
    <p>Tool 1</p>
    <p>Tool 2</p>
    {/* ... */}
  </div>
)

const FullscreenNav = ({ isOpen, toggle, contentKey }) => {
  let ContentComponent

  switch (contentKey) {
    case 'Plastic':
      ContentComponent = PlasticMenu
      break
    case 'Tools':
      ContentComponent = ToolsMenu
      break
    default:
      ContentComponent = () => <div>Select a menu item...</div>
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial="closed"
          animate="open"
          exit="closed"
          variants={navVariants}
          transition={{ duration: 0.5 }}
          className="fullscreen-nav"
        >
          <button onClick={toggle}>
            <CloseIcon />
          </button>
          <ContentComponent />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const archia = localFont({
  src: [
    {
      path: '../../public/fonts/archia-thin-webfont.woff2',
      weight: '200',
    },
    {
      path: '../../public/fonts/archia-light-webfont.woff2',
      weight: '300',
    },
    {
      path: '../../public/fonts/archia-regular-webfont.woff2',
      weight: '400',
    },
    {
      path: '../../public/fonts/archia-medium-webfont.woff2',
      weight: '500',
    },
    {
      path: '../../public/fonts/archia-semibold-webfont.woff2',
      weight: '600',
    },
    {
      path: '../../public/fonts/archia-bold-webfont.woff2',
      weight: '700',
    },
  ],
})
const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['400', '500', '700'],
})

const menuItems = ['Plastic', 'Tools', 'Countries', 'About'].map((key) => ({
  key,
  label: key,
}))

const sidebar = {
  open: (height = 1000) => ({
    clipPath: `circle(${height * 2 + 200}px at 100% 0%)`,
    transition: {
      type: 'spring',
      stiffness: 20,
      restDelta: 2,
    },
  }),
  closed: {
    clipPath: 'circle(0px at 100% 0px)',
    transition: {
      delay: 0.1,
      type: 'spring',
      stiffness: 400,
      damping: 40,
    },
  },
}

const NewLayout = ({
  children,
  isIndexPage,
  isAuthenticated,
  auth0Client,
  profile,
}) => {
  const [loginVisible, setLoginVisible] = useState(false)
  const [hoveredItemKey, setHoveredItemKey] = useState(null)
  const [showMenu, setShowMenu] = useState(false)
  const [width] = useDeviceSize()
  const [isOpen, toggleOpen] = useCycle(false, true)

  return (
    <>
      <style jsx global>{`
        :root {
          --font-dm-sans: ${dmSans.style.fontFamily};
          --font-archia: ${archia.style.fontFamily};
        }
      `}</style>
      <div>
        <div className="top-bar">
          <div className="container">
            <div className="logo-container">
              <Image
                className="gpml-white"
                src="/GPML-White-logo.svg"
                alt="GPML Digital Platform"
                width={244}
                height={74}
              />
            </div>
            {width >= 768 && (
              <ul
                className="ant-menu"
                // onMouseLeave={() => {
                //   setHoveredItemKey(null)
                //   setShowMenu(false)
                // }}
              >
                {menuItems.map((item) => (
                  <li
                    key={item.key}
                    onMouseEnter={() => {
                      setHoveredItemKey(item.label)
                      setShowMenu(true)
                    }}
                  >
                    <Link href={'/'} legacyBehavior>
                      <a>
                        {item.label}
                        <span>
                          <DownArrow />
                        </span>
                      </a>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <nav>
              <Button type="primary" size="small" className="noicon">
                Join Now
              </Button>
              {width <= 768 && (
                <div className="toggle-button">
                  <MenuToggle toggle={() => toggleOpen()} isOpen={isOpen} />
                </div>
              )}
            </nav>
          </div>
        </div>
        <motion.div
          initial="closed"
          animate={isOpen ? 'open' : 'closed'}
          className="animation-container"
          style={{ zIndex: isOpen ? 99 : 0 }}
        >
          <motion.div className="mobile-menu-background" variants={sidebar} />
          <div className="toggle-button">
            <MenuToggle toggle={() => toggleOpen()} isOpen={isOpen} />
          </div>
          <Navigation isOpen={isOpen} />
        </motion.div>
        <FullscreenNav
          isOpen={showMenu}
          contentKey={hoveredItemKey}
          toggle={() => setShowMenu(!showMenu)}
        />
        {children}
      </div>
    </>
  )
}

export const withNewLayout = (Component) => {
  const WithLayoutComponent = (props) => {
    const router = useRouter()
    const isIndexPage = router.pathname === '/'
    const { isAuthenticated, auth0Client, profile, setLoginVisible } = props

    return (
      <NewLayout
        {...{
          isIndexPage,
          isAuthenticated,
          setLoginVisible,
          auth0Client,
          profile,
        }}
      >
        <Component {...props} />
      </NewLayout>
    )
  }

  if (!isEmpty(Component.getStaticProps)) {
    WithLayoutComponent.getStaticProps = async (ctx) => {
      const componentStaticProps = await Component.getStaticProps(ctx)
      return {
        props: {
          ...componentStaticProps.props,
        },
      }
    }
  }

  if (Component.getInitialProps) {
    WithLayoutComponent.getInitialProps = Component.getInitialProps
  }

  return WithLayoutComponent
}

export default NewLayout
