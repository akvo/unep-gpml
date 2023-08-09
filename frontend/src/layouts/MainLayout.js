import React, { useState } from "react";
import Footer from "../footer";
import Login from "../modules/login/view";
import MenuBar from "../modules/landing/menu-bar";

const MainLayout = ({
  children,
  isIndexPage,
  isAuthenticated,
  auth0Client,
}) => {
  const [loginVisible, setLoginVisible] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
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
        />
      ) : (
        <MenuBar
          setLoginVisible={setLoginVisible}
          setShowMenu={setShowMenu}
          showMenu={showMenu}
          isAuthenticated={isAuthenticated}
          auth0Client={auth0Client}
        />
      )}
      {children}
      <Footer />
    </>
  );
};

export default MainLayout;
