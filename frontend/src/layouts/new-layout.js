import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { isEmpty } from 'lodash'
import { Avatar, Button, Dropdown, Menu } from 'antd'
import localFont from 'next/font/local'
import { DM_Sans } from 'next/font/google'
import { UIStore } from '../store'
import Image from 'next/image'
import classNames from 'classnames'
import Footer from '../footer'
import Login from '../modules/login/view'
import { Check, DownArrow, World, flags } from '../components/icons'
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
  const router = useRouter()
  console.log(router)
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
          <div className={`${isIndexPage ? 'container' : 'container-fluid'}`}>
            <div className="logo-container">
              <Link href={'/landing'}>
                <div className="circle">
                  <GpmlCircle />
                </div>
                <h5>
                  Global Partnership
                  <br />
                  on Plastic Pollution
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
              </Link>
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
                {isAuthenticated && (
                  <li>
                    <Link href="/flexible-forms">
                      <span>Add +</span>
                    </Link>
                  </li>
                )}
              </ul>
            )}
            <nav>
              {!isAuthenticated && (
                <Button
                  type="primary"
                  size="small"
                  className="noicon hide-mobile"
                >
                  Join Now
                </Button>
              )}
              {isAuthenticated && (
                <>
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
                              router.push(router.pathname, router.pathname, {
                                locale: lang.key.toLowerCase(),
                              })
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
                      <DownArrow />
                    </div>
                  </Dropdown>
                  <Link href="/workspace">
                    <Button
                      type="primary"
                      size="small"
                      className="noicon hide-mobile"
                    >
                      Workspace
                    </Button>
                  </Link>
                  <Dropdown
                    overlayClassName="user-btn-dropdown-wrapper"
                    overlay={
                      <Menu className="user-btn-dropdown">
                        <Menu.Item
                          key="profile"
                          onClick={() => {
                            router.push({
                              pathname: `/${
                                isRegistered(profile) ? 'profile' : 'onboarding'
                              }`,
                            })
                          }}
                        >
                          Profile
                        </Menu.Item>
                        <Menu.Item
                          key="logout"
                          onClick={() => {
                            auth0Client.logout({
                              returnTo: window.location.origin,
                            })
                          }}
                        >
                          Logout
                        </Menu.Item>
                      </Menu>
                    }
                    trigger={['click']}
                    placement="bottomRight"
                  >
                    <Avatar size="large">
                      {profile?.firstName?.charAt(0)}
                      {profile?.lastName?.charAt(0)}
                    </Avatar>
                  </Dropdown>
                </>
              )}
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
    const isIndexPage =
      router.pathname === '/' || router.pathname === '/landing'
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
