import React, { useEffect, useState } from "react";
import "./style.scss";
import { Redirect, Switch, Route } from "react-router-dom";
import api from "../../utils/api";
import Overview from "./overview";
import ResourceView from "./resource-view";
import { useQuery } from "../../utils/misc";
import { UIStore } from "../../store";
import { useHistory, useLocation } from "react-router-dom";
import bodyScrollLock from "../details-page/scroll-utils";
import DetailModal from "../details-page/modal";

const popularTags = [
  "plastics",
  "waste management",
  "marine litter",
  "product by design",
  "source to sea",
];

function Library({ setLoginVisible, isAuthenticated }) {
  const history = useHistory();
  const { pathname, search } = useLocation();
  const query = useQuery();
  const box = document.getElementsByClassName("knowledge-lib");
  const [loading, setLoading] = useState(true);
  const [countData, setCountData] = useState([]);
  const [data, setData] = useState([]);
  const [params, setParams] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const { landing } = UIStore.useState((s) => ({
    landing: s.landing,
  }));

  useEffect(() => {
    if (!modalVisible) {
      const previousHref = `${history?.location?.pathname}${history?.location?.search}`;
      window.history.pushState(
        { urlPath: `/${previousHref}` },
        "",
        `${previousHref}`
      );
    }
  }, [modalVisible]);

  const showModal = ({ e, type, id }) => {
    e.preventDefault();
    if (type && id) {
      const detailUrl = `/${type}/${id}`;
      e.preventDefault();
      setParams({ type, id });
      window.history.pushState(
        { urlPath: `/${detailUrl}` },
        "",
        `${detailUrl}`
      );
      setModalVisible(true);
      bodyScrollLock.enable();
    }
  };

  const fetchData = () => {
    setLoading(true);
    const url = `/browse?incCountsForTags=${popularTags}`;

    api
      .get(url)
      .then((resp) => {
        setLoading(false);
        setData(resp?.data);
        setCountData(resp?.data?.counts);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (pathname === "/knowledge/library/overview") fetchData();
  }, [pathname]);

  useEffect(() => {
    api.get(`/landing?entityGroup=topic`).then((resp) => {
      UIStore.update((e) => {
        e.landing = resp.data;
      });
    });
  }, []);

  return (
    <div id="knowledge-lib">
      <Switch>
        <Route exact path="/knowledge/library">
          <Redirect to="/knowledge/library/overview" exact={true} />
        </Route>
        <Route
          path="/knowledge/library/overview"
          render={(props) => (
            <Overview
              {...props}
              summaryData={landing?.summary}
              {...{
                box,
                query,
                countData,
                landing,
                data,
                loading,
                history,
                showModal,
                isAuthenticated,
                setLoginVisible,
              }}
            />
          )}
        />
        <Route
          path="/knowledge/library/resource/:view?/:type?"
          render={(props) => (
            <ResourceView
              {...{ box, history, popularTags, landing, showModal }}
            />
          )}
        />
      </Switch>
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
