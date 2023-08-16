import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { isEmpty } from 'lodash'
import Footer from '../footer'
import Login from '../modules/login/view'
import MenuBar from '../modules/landing/menu-bar'

const MainLayout = ({
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
      <Login visible={loginVisible} close={() => setLoginVisible(false)} />
      {isIndexPage ? (
        <MenuBar
          setLoginVisible={setLoginVisible}
          setShowMenu={setShowMenu}
          showMenu={showMenu}
          isAuthenticated={isAuthenticated}
          auth0Client={auth0Client}
          profile={profile}
        />
      ) : (
        <MenuBar
          setLoginVisible={setLoginVisible}
          setShowMenu={setShowMenu}
          showMenu={showMenu}
          isAuthenticated={isAuthenticated}
          auth0Client={auth0Client}
          profile={profile}
        />
      )}
      {children}
      <Footer />
    </>
  )
}

export const withLayout = (Component) => {
  const WithLayoutComponent = (props) => {
    const router = useRouter()
    const isIndexPage = router.pathname === '/'
    const {
      isAuthenticated,
      auth0Client,
      profile,
      setLoginVisible,
      ...rest
    } = props

    return (
      <MainLayout
        isIndexPage={isIndexPage}
        isAuthenticated={isAuthenticated}
        setLoginVisible={setLoginVisible}
        auth0Client={auth0Client}
        profile={profile}
      >
        <Component {...props} />
      </MainLayout>
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

export default MainLayout
