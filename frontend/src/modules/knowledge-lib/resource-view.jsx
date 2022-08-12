import React, { Fragment, useEffect, useState } from "react";
import classNames from "classnames";
import { CSSTransition } from "react-transition-group";
import api from "../../utils/api";
import FilterBar from "./filter-bar";
import FilterModal from "./filter-modal";
import ResourceCards, {
  ResourceCard,
} from "../../components/resource-cards/resource-cards";
import { LoadingOutlined, DownOutlined } from "@ant-design/icons";
import { ReactComponent as SortIcon } from "../../images/knowledge-library/sort-icon.svg";
import { ReactComponent as GlobeIcon } from "../../images/transnational.svg";
import { ReactComponent as TopicIcon } from "../../images/topic-view.svg";
import { ReactComponent as GridIcon } from "../../images/grid-view.svg";
import { ReactComponent as GraphIcon } from "../../images/graph-view.svg";
import { ReactComponent as SearchIcon } from "../../images/search-icon.svg";
import { Button } from "antd";
import Maps from "../map/map";
import { UIStore } from "../../store";
import { isEmpty } from "lodash";
import { Link, useHistory } from "react-router-dom";
import { useQuery, topicNames } from "../../utils/misc";
import TopicView from "./topic-view";
import Overview from "./overview";
import { useParams } from "react-router-dom";

const topic = [
  "action_plan",
  "project",
  "policy",
  "technical_resource",
  "technology",
  "event",
  "financing_resource",
];

function ResourceView({
  summaryData,
  setView,
  box,
  query,
  countData,
  landing,
  data,
  loading,
  history,
  gridItems,
}) {
  const limit = 30;
  const totalItems = topic.reduce(
    (acc, topic) =>
      acc + (countData?.find((it) => it.topic === topic)?.count || 0),
    0
  );
  const params = useParams();

  return (
    <div>
      <FilterBar {...{ history, params }} />
      <div className="list-content">
        <div className="list-toolbar">
          <div className="quick-search">
            <div className="count">
              {`Showing ${!loading ? data?.results?.length : ""}`}
            </div>
            <div className="search-icon">
              <SearchIcon />
            </div>
          </div>
          <ViewSwitch {...{ setView, params, history }} />
          <button className="sort-by-button">
            <SortIcon
            // style={{
            //   transform:
            //     !isAscending || isAscending === null
            //       ? "initial"
            //       : "rotate(180deg)",
            // }}
            />
            <div className="sort-button-text">
              <span>Sort by:</span>
              {/* <b>{!isAscending ? `A>Z` : "Z>A"}</b> */}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

const ViewSwitch = ({ setView, params, history }) => {
  const viewOptions = ["map", "topic", "grid", "category"];
  const [visible, setVisible] = useState(false);
  const handleChangeView = (viewOption) => () => {
    setView(viewOption);
    setVisible(false);
  };

  return (
    <div className="view-switch-container">
      <div
        className={classNames("switch-btn", { active: visible })}
        onClick={() => {
          setVisible(!visible);
        }}
      >
        <DownOutlined />
        {params?.view} view
      </div>
      <CSSTransition
        in={visible}
        timeout={200}
        unmountOnExit
        classNames="view-switch"
      >
        <div className="view-switch-dropdown">
          <ul>
            {viewOptions
              .filter((opt) => params?.view !== opt)
              .map((viewOption) => (
                <li
                  key={viewOption}
                  onClick={() =>
                    history.push(
                      `/knowledge/lib/resource/${params?.type}/${viewOption}`
                    )
                  }
                >
                  {viewOption} view
                </li>
              ))}
          </ul>
        </div>
      </CSSTransition>
    </div>
  );
};

export default ResourceView;
