import React, { useEffect, useState } from "react";
import styles from "./style.module.scss";
import api from "../../utils/api";
import Overview from "./overview";
import ResourceView from "./resource-view";
import { useQuery } from "../../utils/misc";
import { UIStore } from "../../store";
import { useHistory } from "react-router-dom";
import bodyScrollLock from "../details-page/scroll-utils";
import DetailModal from "../details-page/modal";
import { useRouter } from "next/router";

const popularTags = [
  "plastics",
  "waste management",
  "marine litter",
  "capacity building",
  "product by design",
  "source to sea",
];

function Library({ setLoginVisible, isAuthenticated }) {
  const router = useRouter();

  const box =
    typeof window !== "undefined"
      ? document.getElementsByClassName("knowledge-lib")
      : null;
  const [params, setParams] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const { landing } = UIStore.useState((s) => ({
    landing: s.landing,
  }));

  useEffect(() => {
    if (!modalVisible) {
      const previousHref = router.asPath;
      window.history.pushState(
        { urlPath: `/${previousHref}` },
        "",
        `${previousHref}`
      );
    }
  }, [modalVisible]);

  const showModal = ({ e, type, id }) => {
    console.log("setModalVisible");
    e.preventDefault();
    if (type && id) {
      const detailUrl = `/${type}/${id}`;
      e.preventDefault();
      setParams({ type, id });
      router.push(detailUrl);
      setModalVisible(true);
      bodyScrollLock.enable();
    }
  };

  return (
    <div className={styles.knowledgeLib}>
      <ResourceView
        {...{
          box,
          popularTags,
          landing,
          showModal,
        }}
        history={router}
      />
      <DetailModal
        match={{ params }}
        visible={modalVisible}
        setVisible={setModalVisible}
        {...{
          setLoginVisible,
          isAuthenticated,
        }}
      />
    </div>
  );
}

export default Library;
