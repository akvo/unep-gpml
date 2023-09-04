import React, { useState } from 'react'
import Landing from '../modules/landing/landing'
import Login from '../modules/login/view'

function HomePage({ isAuthenticated }) {
  const [loginVisible, setLoginVisible] = useState(false)
  return (
    <>
      <Login visible={loginVisible} close={() => setLoginVisible(false)} />
      <Landing
        isAuthenticated={isAuthenticated}
        setLoginVisible={setLoginVisible}
      />
    </>
  )
}

export default HomePage
