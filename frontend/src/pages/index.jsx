import React from 'react'
import Landing from '../modules/landing/landing'

function HomePage({ isAuthenticated, setLoginVisible }) {
  return (
    <Landing
      isAuthenticated={isAuthenticated}
      setLoginVisible={setLoginVisible}
    />
  )
}

export default HomePage
