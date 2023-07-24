import React from "react";
import MainLayout from "./MainLayout";
import { useRouter } from "next/router";

const withLayout = (Component) => {
  const WithLayoutComponent = (props) => {
    const router = useRouter();
    const isIndexPage = router.pathname === "/";

    return (
      <MainLayout isIndexPage={isIndexPage}>
        <Component {...props} />
      </MainLayout>
    );
  };

  if (Component.getInitialProps) {
    WithLayoutComponent.getInitialProps = Component.getInitialProps;
  }

  return WithLayoutComponent;
};

export default withLayout;
