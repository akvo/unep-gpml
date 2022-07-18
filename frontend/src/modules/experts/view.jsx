import React, { useEffect, useState } from "react";
import { Row } from "antd";
import { AppstoreOutlined, LoadingOutlined } from "@ant-design/icons";
import { useHistory } from "react-router-dom";
import "./style.scss";
import api from "../../utils/api";
import { UIStore } from "../../store";
import catTags from "../../utils/cat-tags.json";

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
import FilterBar from "./filter-bar";
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
  const [filter, setFilter] = useState([]);
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

  const fetchExperts = (params) => {
    const url = `/stakeholder/expert/list`;
    api
      .get(url, params)
      .then((resp) => {
        const data = resp?.data;
        setExperts({
          experts: data.experts,
          count: data.count,
        });
        setLoading(false)
      })
      .catch((err) => {
        console.error(err);
        setLoading(false)
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
    fetchExperts();
    api.get(`/landing`).then((resp) => {
      UIStore.update((e) => {
        e.landing = resp.data;
      });
    });
  }, []);

 

  const clickCountry = (value) => {
    let updateVal = [];
    if (isEmpty(filterCountries)) {
      updateVal = [value];
    } else if (filterCountries.includes(value)) {
      updateVal = filterCountries.filter((x) => x !== value);
    } else {
      updateVal = [...filterCountries, value];
    }
    setFilterCountries(updateVal)
  };

  useEffect(() => {
    setLoading(true)
    const params = {}
    if(filter.length > 1 && filter[1].length > 0){
      params.tags = filter[1].join(',')
    }
    else if(filter.length === 1 || (filter.length === 2 && filter[1].length === 0)){
      params.tags = catTags[filter[0]].topics.join(',')
    }
    if(filterCountries.length > 0){
      params.countries = filterCountries.join(',')
    }
    fetchExperts(params)
  }, [filter, filterCountries])

  return (
    <div id="experts" className="experts">
      <Row type="flex" className="body-wrapper">
        <LeftSidebar active={5} sidebar={sidebar}>
          <FilterBar {...{ filter, setFilter, filterCountries, setFilterCountries }} />
          <div className="expert-list-section">
            <div className="expert-top-tools">
              <div className="page-label">Total {experts?.count}</div>
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
            {loading &&
              <div className="loading">
                <LoadingOutlined spin />
              </div>
            }
            {(experts.experts.length === 0 && !loading) && <div className="noresults">No matches</div>}
            <ExpertCarousel
                {...{ experts, countries, organisations, setIsShownModal }}
              />
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
            isLoaded={() => true}
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
