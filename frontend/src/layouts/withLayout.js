import React from "react";
import MainLayout from "./MainLayout";
import { useRouter } from "next/router";
import { isEmpty } from "lodash";

const withLayout = (Component) => {
  const WithLayoutComponent = (props) => {
    const router = useRouter();
    const isIndexPage = router.pathname === "/";
    const {
      isAuthenticated,
      auth0Client,
      profile,
      setLoginVisible,
      ...rest
    } = props;

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
    );
  };

  if (!isEmpty(Component.getStaticProps)) {
    WithLayoutComponent.getStaticProps = async (ctx) => {
      const componentStaticProps = await Component.getStaticProps(ctx);
      return {
        props: {
          ...componentStaticProps.props,
        },
      };
    };
  }

  if (Component.getInitialProps) {
    WithLayoutComponent.getInitialProps = Component.getInitialProps;
  }

  return WithLayoutComponent;
};

export default withLayout;
