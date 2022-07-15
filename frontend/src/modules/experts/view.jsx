import React, { useEffect, useState } from "react";
import { Row } from "antd";
import { AppstoreOutlined, LoadingOutlined } from "@ant-design/icons";
import { useHistory } from "react-router-dom";
import "./style.scss";
import api from "../../utils/api";
import { UIStore } from "../../store";

import { isEmpty } from "lodash";
import { useQuery } from "./common";
import LeftSidebar from "../../components/left-sidebar/left-sidebar";
import { ReactComponent as IconEvent } from "../../images/events/event-icon.svg";
import { ReactComponent as IconForum } from "../../images/events/forum-icon.svg";
import { ReactComponent as IconCommunity } from "../../images/events/community-icon.svg";
import { ReactComponent as IconPartner } from "../../images/stakeholder-overview/partner-icon.svg";
import { ReactComponent as ExpertIcon } from "../../images/stakeholder-overview/expert-icon.svg";
import { ReactComponent as SortIcon } from "../../images/knowledge-library/sort-icon.svg";
import { ReactComponent as GlobeIcon } from "../../images/transnational.svg";

import Maps from "../map/map";
import ExpertCarousel from "./expert-carousel";
import InviteExpertModal from "./invite-expert-modal";

const Experts = () => {
  const { countries, organisations, landing } = UIStore.useState((s) => ({
    countries: s.countries,
    organisations: s.organisations,
    landing: s.landing,
  }));

  const box = document.getElementsByClassName("experts");
  const history = useHistory();
  const query = useQuery();

  const [view, setView] = useState("map");
  const [experts, setExperts] = useState({
    experts: [],
    count: 0,
  });
  const [isAscending, setIsAscending] = useState(null);
  const isLoaded = () => !isEmpty(landing?.map);
  const [loading, setLoading] = useState(true);
  const [filterCountries, setFilterCountries] = useState([]);
  const [isShownModal, setIsShownModal] = useState(false);

  const sidebar = [
    { id: 1, title: "Events", url: "/connect/events", icon: <IconEvent /> },
    {
      id: 2,
      title: "Community",
      url: "/connect/community",
      icon: <IconCommunity />,
    },

    { id: 3, title: "Forums", url: null, icon: <IconForum /> },
    {
      id: 4,
      title: "Partners",
      url: "/connect/partners",
      icon: <IconPartner />,
    },
    {
      id: 5,
      title: "Experts",
      url: "/connect/experts",
      icon: <ExpertIcon />,
    },
  ];

  const getExpert = () => {
    const url = `/stakeholder/expert/list`;
    api
      .get(url)
      .then((resp) => {
        const data = resp?.data;
        setExperts({
          experts: data.experts,
          count: data.count,
        });
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const sortExperts = (ascending) => {
    const sortedExperts = experts?.experts?.sort((a, b) => {
      if (ascending) {
        if (a?.firstName) {
          return a?.firstName?.trim().localeCompare(b?.firstName?.trim());
        } else {
          return a?.name?.trim().localeCompare(b?.name?.trim());
        }
      } else {
        if (b?.firstName) {
          return b?.firstName?.trim().localeCompare(a?.firstName?.trim());
        } else {
          return b?.name?.trim().localeCompare(a?.name?.trim());
        }
      }
    });
    setIsAscending(ascending);
    setExperts({ ...experts, experts: sortedExperts });
  };

  useEffect(() => {
    setLoading(true);
    getExpert();
    setLoading(false);
    api.get(`/landing`).then((resp) => {
      UIStore.update((e) => {
        e.landing = resp.data;
      });
    });
  }, []);

  const updateQuery = (param, value) => {
    const topScroll = window.innerWidth < 640 ? 996 : 207;
    window.scrollTo({
      top: window.pageYOffset < topScroll ? window.pageYOffset : topScroll,
    });
    setLoading(true);
    const newQuery = { ...query };
    newQuery[param] = value;

    // Remove empty query
    const arrayOfQuery = Object.entries(newQuery)?.filter(
      (item) => item[1]?.length !== 0
    );

    const pureQuery = Object.fromEntries(arrayOfQuery);

    const newParams = new URLSearchParams(pureQuery);

    history.push(`/connect/experts?${newParams.toString()}`);

    if (param === "country") {
      setFilterCountries(value);
    }
  };

  const clickCountry = (value) => {
    const val = query["country"];

    let updateVal = [];

    if (isEmpty(val)) {
      updateVal = [value];
    } else if (val.includes(value)) {
      updateVal = val.filter((x) => x !== value);
    } else {
      updateVal = [...val, value];
    }

    updateQuery("country", updateVal);
  };

  return (
    <div id="experts" className="experts">
      <Row type="flex" className="body-wrapper">
        <LeftSidebar active={5} sidebar={sidebar}>
          <div className="expert-list-section">
            <div className="expert-top-tools">
              <div className="page-label">Showing 7 Of {experts?.count}</div>
              <button
                className="view-button"
                shape="round"
                size="large"
                onClick={() => {
                  view === "map" ? setView("grid") : setView("map");
                }}
              >
                <div className="view-button-text ">
                  Switch to {`${view === "map" ? "grid" : "map"}`} view
                </div>
                {view === "map" ? <AppstoreOutlined /> : <GlobeIcon />}
              </button>
              <button
                className="sort-by-button"
                onClick={() => sortExperts(!isAscending)}
              >
                <SortIcon
                  style={{
                    transform:
                      isAscending || isAscending === null
                        ? "initial"
                        : "rotate(180deg)",
                  }}
                />
                <div className="sort-button-text">
                  <span>Sort by:</span>
                  <b>{isAscending ? `A>Z` : "Z>A"}</b>
                </div>
              </button>
            </div>
            {loading ? (
              <h2 className="loading" id="expert-loading">
                <LoadingOutlined spin /> Loading
              </h2>
            ) : (
              <>
                <ExpertCarousel
                  {...{ experts, countries, organisations, setIsShownModal }}
                />
              </>
            )}
          </div>
          <Maps
            box={box}
            query={query}
            clickEvents={clickCountry}
            stakeholderCount={[]}
            listVisible={[]}
            isDisplayedList={[]}
            dataToDisplay={[]}
            isFilteredCountry={filterCountries}
            data={landing?.map || []}
            countryGroupCounts={landing?.countryGroupCounts || []}
            isLoaded={isLoaded}
            multiCountryCountries={[]}
            multiCountries={[]}
            useVerticalLegend
          />
          {isShownModal && (
            <InviteExpertModal {...{ setIsShownModal, isShownModal }} />
          )}
        </LeftSidebar>
      </Row>
    </div>
  );
};

export default Experts;
