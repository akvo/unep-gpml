import React, { Fragment, useEffect, useState } from "react";
import "./style.scss";
import { Redirect, Switch, Route } from "react-router-dom";
import api from "../../utils/api";
import Overview from "./overview";
import ResourceView from "./resource-view";
import { useQuery, topicNames } from "../../utils/misc";
import { UIStore } from "../../store";
import { Link, useHistory } from "react-router-dom";

const popularTags = [
  "plastics",
  "waste management",
  "marine litter",
  "capacity building",
  "product by design",
  "source to sea",
];

function Library() {
  const history = useHistory();
  const query = useQuery();
  const box = document.getElementsByClassName("knowledge-lib");
  const [loading, setLoading] = useState(true);
  const [countData, setCountData] = useState([]);
  const [data, setData] = useState([]);
  const [gridItems, setGridItems] = useState([]);

  const { landing } = UIStore.useState((s) => ({
    landing: s.landing,
  }));

  const [view, setView] = useState(
    query.hasOwnProperty("view") ? query.view[0] : "map"
  );

  const fetchData = () => {
    setLoading(true);
    const url = `/browse?incCountsForTags=${popularTags}`;

    api
      .get(url)
      .then((resp) => {
        setLoading(false);
        setData(resp?.data);
        setCountData(resp?.data?.counts);
        setGridItems((prevItems) => {
          return [...new Set([...prevItems, ...resp?.data?.results])];
        });
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

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
        <Route exact path="/knowledge/lib">
          <Redirect to="/knowledge/lib/overview" exact={true} />
        </Route>
        <Route
          path="/knowledge/lib/overview"
          render={(props) => (
            <Overview
              {...props}
              summaryData={landing?.summary}
              {...{
                setView,
                box,
                query,
                countData,
                landing,
                data,
                loading,
                history,
              }}
            />
          )}
        />
        <Route
          path="/knowledge/lib/resource/:type/:view?"
          render={(props) => (
            <ResourceView
              summaryData={landing?.summary}
              {...{
                setView,
                box,
                query,
                countData,
                landing,
                data,
                loading,
                history,
                gridItems,
              }}
            />
          )}
        />
      </Switch>
    </div>
  );
}

export default Library;
