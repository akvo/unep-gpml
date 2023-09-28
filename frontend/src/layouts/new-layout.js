import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { isEmpty } from 'lodash'
import { Button } from 'antd'
import localFont from 'next/font/local'
import { DM_Sans } from 'next/font/google'
import { UIStore } from '../store'
import Image from 'next/image'
import classNames from 'classnames'
import Footer from '../footer'
import Login from '../modules/login/view'
import { DownArrow } from '../components/icons'
import Link from 'next/link'
import { motion, AnimatePresence, useCycle } from 'framer-motion'
import { useDeviceSize } from '../modules/landing/landing'

import { MenuToggle, NavMobile, NavDesktop } from '../components/nav'
import GpmlCircle from '../components/gpml-circle'

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

const NewLayout = ({
  children,
  isIndexPage,
  isAuthenticated,
  auth0Client,
  profile,
}) => {
  const { menuList } = UIStore.useState((s) => ({
    menuList: s.menuList,
  }))
  const [loginVisible, setLoginVisible] = useState(false)
  const [openedItemKey, setOpenedItemKey] = useState(null)
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
        <div
          className={classNames('top-bar', { opened: openedItemKey != null })}
          style={{
            zIndex: isOpen ? 9 : 99,
          }}
        >
          <div className="container">
            <div className="logo-container">
              <div className="circle">
                <GpmlCircle />
              </div>
              <h5>
                Global Partnership
                <br />
                on Plastic Pollution1
                <br />
                and Marine Litter
              </h5>
              {/* <Image
                className="gpml-white"
                src="/GPML-White-logo.svg"
                alt="GPML Digital Platform"
                width={244}
                height={74}
              /> */}
            </div>
            {width >= 768 && (
              <ul className="ant-menu">
                {menuList.map((item) => (
                  <li
                    key={item.key}
                    onClick={() => {
                      if (item.key === openedItemKey) {
                        setOpenedItemKey(null)
                        setShowMenu(false)
                      } else {
                        setOpenedItemKey(item.key)
                        setShowMenu(true)
                      }
                    }}
                    className={`${
                      openedItemKey === item.key ? 'selected' : ''
                    }`}
                  >
                    <a>
                      <span>{item.key}</span>
                      <DownArrow />
                    </a>
                  </li>
                ))}
              </ul>
            )}
            <nav>
              <Button
                type="primary"
                size="small"
                className="noicon hide-mobile"
              >
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
        <div className="navigation">
          <NavMobile {...{ isOpen, toggleOpen }} />

          <NavDesktop
            isOpen={showMenu}
            contentKey={openedItemKey}
            toggle={() => {
              setShowMenu(!showMenu)
              setOpenedItemKey(null)
            }}
          />
        </div>
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
