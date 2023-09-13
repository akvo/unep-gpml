import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { isEmpty } from 'lodash'
import { Button } from 'antd'
import localFont from 'next/font/local'
import { DM_Sans } from 'next/font/google'
import Image from 'next/image'
import Footer from '../components/footer/footer'
import Login from '../modules/login/view'

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
  const [loginVisible, setLoginVisible] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  return (
    <>
      <style jsx global>{`
        :root {
          --font-dm-sans: ${dmSans.style.fontFamily};
          --font-archia: ${archia.style.fontFamily};
        }
      `}</style>
      <Login visible={loginVisible} close={() => setLoginVisible(false)} />
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
            <nav>
              {isAuthenticated ? (
                <Button
                  type="primary"
                  size="small"
                  className="noicon"
                  onClick={() => {
                    auth0Client.logout({ returnTo: window.location.origin })
                  }}
                >
                  Logout
                </Button>
              ) : (
                <Button
                  type="primary"
                  size="small"
                  className="noicon"
                  onClick={() => setLoginVisible(true)}
                >
                  Join Now
                </Button>
              )}
            </nav>
          </div>
        </div>
        {children}
        <Footer />
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
