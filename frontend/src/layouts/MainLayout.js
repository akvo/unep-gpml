import React, { useState } from "react";
import Footer from "../footer";
import Login from "../modules/login/view";
import MenuBar from "../modules/landing/menu-bar";

const MainLayout = ({ children, isIndexPage }) => {
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
        />
      ) : (
        <MenuBar
          setLoginVisible={setLoginVisible}
          setShowMenu={setShowMenu}
          showMenu={showMenu}
        />
      )}
      {children}
      <Footer />
    </>
  );
};

export default MainLayout;
