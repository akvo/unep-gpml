import { UIStore } from "../../store";
import {
  LoadingOutlined,
  RightOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Button, Tag, Image, Divider, Dropdown, Checkbox } from "antd";
import React, { Fragment, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import {
  topicNames,
  resourceTypeToTopicType,
  relationsByTopicType,
} from "../../utils/misc";
import { useAuth0 } from "@auth0/auth0-react";
import ModalWarningUser from "../../utils/modal-warning-user";
import capitalize from "lodash/capitalize";
import some from "lodash/some";
import "./styles.scss";
import {
  typeOfActionKeys,
  detailMaps,
  infoMaps,
  descriptionMaps,
} from "./mapping";
import moment from "moment";
import imageNotFound from "../../images/image-not-found.png";
import logoNotFound from "../../images/logo-not-found.png";
import uniqBy from "lodash/uniqBy";

const currencyFormat = (curr) => Intl.NumberFormat().format(curr);

const renderItemValues = (params, mapping, data) => {
  const {
    profile,
    countries,
    languages,
    regionOptions,
    meaOptions,
  } = UIStore.currentState;
  // check if no data
  let noData = false;
  mapping &&
    mapping.every((it) => {
      const { key } = it;
      if (data[key]) {
        noData = false;
        return false;
      }
      if (!data[key]) {
        noData = true;
        return true;
      }
      return true;
    });

  if (noData) {
    return "There is no data to display";
  }

  if (countries.length === 0) {
    return "";
  }

  return (
    mapping &&
    mapping.map((item, index) => {
      const {
        key,
        name,
        value,
        type,
        customValue,
        arrayCustomValue,
        currencyObject,
      } = item;
      // Set to true to display all country list for global
      const showAllCountryList = false;
      const displayEntry =
        data[key] ||
        data[key] === 0 ||
        key === null ||
        (value === "geoCoverage" && data.geoCoverageType);

      // Calculate country info to be displayed, based on geo coverage type
      let dataCountries = null;
      if (value === "geoCoverage") {
        if (data.geoCoverageType === "global") {
          dataCountries = showAllCountryList
            ? countries.map((it) => it.name).join(", ")
            : null;
        } else if (data.geoCoverageType === "regional") {
          dataCountries = data[key]
            ?.map((x) => {
              return regionOptions.find((it) => it.id === x).name;
            })
            .join(", ");
        } else if (
          data.geoCoverageType === "global with elements in specific areas"
        ) {
          dataCountries = dataCountries = data[key]
            ?.map((x) => {
              return meaOptions.find((it) => it.id === x).name;
            })
            .join(", ");
        } else {
          dataCountries = data[key]
            ?.map((x) => {
              return countries.find((it) => it.id === x).name;
            })
            .join(", ");
        }
      }

      // Calculate custom currency value to display
      const [currency, amount, remarks] =
        arrayCustomValue?.map((it) => data[it]) || [];
      const customCurrency =
        value === "custom" &&
        type === "currency" &&
        (remarks
          ? currency
            ? `${currency} ${amount} - ${remarks}`
            : `${amount} - ${remarks}`
          : currency
          ? `${currency} ${amount}`
          : `${amount}`);

      return (
        <Fragment key={`${params.type}-${name}`}>
          {displayEntry && (
            <div key={name + index} className="column">
              <div className="title">{name}</div>
              <div className="value">
                {key === null && type === "static" && value}
                {value === key &&
                  (type === "name" ||
                    type === "string" ||
                    type === "number" ||
                    type === "object") &&
                  (data[value].name || data[value])}
                {value === key && type === "text" && capitalize(data[value])}
                {value === key &&
                  type === "email" &&
                  data?.publicEmail &&
                  data[key]}
                {currencyObject && data[currencyObject.name]
                  ? `${data[currencyObject.name][0].name} `
                  : ""}
                {value === key &&
                  type === "currency" &&
                  currencyFormat(data[value])}
                {value === key && type === "link" && (
                  <a
                    target="_blank"
                    rel="noreferrer"
                    href={data[value] || ""}
                    style={{ wordBreak: "break-word" }}
                  >
                    {data[value] || ""}
                  </a>
                )}
                {value === key &&
                  type === "date" &&
                  moment(data[key]).format("DD MMM YYYY")}
                {value === key &&
                  type === "array" &&
                  data[key].map((x) => x.name).join(", ")}
                {value === key &&
                  type === "country" &&
                  countries.find((it) => it.id === data[key]).name}
                {value === "custom" &&
                  type === "object" &&
                  data[key][customValue]}
                {value === "custom" &&
                  type === "startEndDate" &&
                  moment(data[arrayCustomValue[0]]).format("DD MMM YYYY") +
                    " - " +
                    moment(data[arrayCustomValue[1]]).format("DD MMM YYYY")}
                {data[key] &&
                  value === "isoCode" &&
                  type === "array" &&
                  uniqBy(data[key], "isoCode")
                    .map((x, i) => languages[x.isoCode].name)
                    .join(", ")}
                {params.type === "project" &&
                  data[key] &&
                  value === "join" &&
                  type === "array" &&
                  data[key].map((x) => x.name).join(", ")}
                {params.type !== "project" &&
                  data[key] &&
                  value === "join" &&
                  type === "array" &&
                  data[key].join(", ")}
                {params.type === "project" &&
                  value === "custom" &&
                  type === "array" &&
                  data[key][customValue] &&
                  data[key][customValue].map((x) => x.name).join(", ")}
                {params.type !== "project" &&
                  value === "custom" &&
                  type === "array" &&
                  data[key][customValue] &&
                  data[key][customValue].join(", ")}

                {value === "geoCoverage" && (
                  <>
                    {capitalize(data.geoCoverageType)}
                    {dataCountries && (
                      <div className="scrollable">{dataCountries}</div>
                    )}
                  </>
                )}

                {value === "resource_url" && type === "array" && (
                  <ul>
                    {" "}
                    {data[key].map((x, i) => (
                      <li key={`${x.url}-${i}`}>
                        <a
                          target="_blank"
                          rel="noreferrer"
                          href={x.url}
                          style={{ wordBreak: "break-word" }}
                        >
                          {x.url}
                        </a>
                      </li>
                    ))}{" "}
                  </ul>
                )}

                {value === "link" && type === "array" && (
                  <ul>
                    {data[key].map((x, i) => {
                      const link = typeof x === "string" ? x : x?.name;
                      return (
                        link && (
                          <li key={link}>
                            <a
                              target="_blank"
                              rel="noreferrer"
                              href={link}
                              style={{ wordBreak: "break-word" }}
                            >
                              {link}
                            </a>
                          </li>
                        )
                      );
                    })}{" "}
                  </ul>
                )}

                {customCurrency}

                {value === "custom" &&
                  type === "haveChild" &&
                  customValue === "topLevel" && (
                    <ul>
                      {data[key].map((x, i) => (
                        <li key={x.name}>{x.name}</li>
                      ))}
                    </ul>
                  )}

                {/* Entity Type */}
                {value === "custom" &&
                  type === "haveParent" &&
                  customValue === "options" && (
                    <ul>
                      {data[key].map((x, i) => (
                        <li key={x.name.split("(")[0]}>
                          {x.name.split("(")[0]}
                          <ul className="indent">
                            {x.options &&
                              x.options.length > 0 &&
                              x.options.map((y, i) => (
                                <li key={y.name}>{y.name}</li>
                              ))}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  )}
                {/* EOL Entity Type */}
              </div>
            </div>
          )}
          {displayEntry && index !== mapping.length - 1 && (
            <Divider key={`d${params.type}-${index}`} />
          )}
        </Fragment>
      );
    })
  );
};

const renderTypeOfActions = (params, data) => {
  const keys = typeOfActionKeys.map((x) => x.key);
  const keyAvailable = keys.map((x) => some(data, x)).includes(true);

  if (params.type !== "project") {
    return;
  }

  return (
    <div key="type-of-actions" className="card">
      <h3>Type of Actions</h3>
      <div className="table-actions">
        {typeOfActionKeys &&
          typeOfActionKeys.map((item, index) => {
            const { key, name, value, child } = item;
            return (
              data[key] && (
                <Fragment key={`fragment-actions${index}-${name}`}>
                  <div key={`actions${index}-${name}`} className="column">
                    <div className="title">{name}</div>
                    {value === "children" && (
                      <ul>
                        {data[key].map((value, index) => (
                          <li className="value" key={"key" + index}>
                            {!value ? "-" : value.name}
                          </li>
                        ))}
                      </ul>
                    )}

                    {value === "custom" && (
                      <ul>
                        {child &&
                          child.map((child, index) => {
                            const { key, name, value } = child;
                            if (data?.[key]?.[value]) {
                              return (
                                <li className="value" key={name + index}>
                                  {name} : {data[key][value]}
                                </li>
                              );
                            }
                          })}
                      </ul>
                    )}
                  </div>
                  {index !== typeOfActionKeys.length - 1 && (
                    <Divider key={`dactions${params.type}-${index}`} />
                  )}
                </Fragment>
              )
            );
          })}
      </div>
    </div>
  );
};

const renderDetails = (params, data) => {
  const details = detailMaps[params.type];
  if (!details) {
    return;
  }
  return (
    <div key={"details"} className="card">
      <h3>{topicNames(params.type)} Detail</h3>
      <div className="table">{renderItemValues(params, details, data)}</div>
    </div>
  );
};

const renderInfo = (params, data) => {
  const staticText = (
    <p>
      The{" "}
      <a target="_blank" href="https://unep.tc.akvo.org/" rel="noreferrer">
        interactive dashboard
      </a>{" "}
      aims to visually summarise the Initiatives results to inspire others to
      act and as a way of sharing ideas and innovations. It allows the user to
      visualise key attributes, such as source-to-sea, type of lead
      organisation, and lifecycle phase, and enables comparisons on
      country/region level.
    </p>
  );
  const isNarrative =
    params.type === "project" && data.uuid
      ? data.uuid.split("-")[0] === "999999"
      : false;
  const info = infoMaps[params.type];
  if (!info) {
    return;
  }
  return (
    <div key="info" className="card">
      <h3>Related Info And Contacts</h3>
      <div className="table">{renderItemValues(params, info, data)}</div>
      {params.type === "project" && data.uuid && !isNarrative && (
        <div>
          <Divider key="statictext" /> {staticText}
        </div>
      )}
    </div>
  );
};

const renderDescription = (params, data) => {
  const text = descriptionMaps[params.type];

  if (!text) {
    return;
  }
  return (
    <div key="description" className="card">
      <h3>{text.name}</h3>
      {data[text.key] && <p>{data[text.key]}</p>}
      {!data[text.key] && <p>There is no data to display</p>}
    </div>
  );
};

const renderDetailImage = (params, data) => {
  if (data?.image) {
    return data.image;
  }
  if (params.type !== "stakeholder" && data?.picture) {
    return data.picture;
  }
  if (params.type === "organisation" && data?.logo) {
    return data.logo;
  }
  if (params.type === "stakeholder" && data?.picture) {
    const isInitialPic = data.picture.includes("googleusercontent.com");
    if (!isInitialPic) {
      return data.picture;
    }
    let newSize =
      window.screen.width > 640 ? `s${window.screen.height}-c` : `s640-c`;
    return data.picture.replace(/(s\d+\-c)/g, newSize);
  }
  return imageNotFound;
};

UIStore.update((e) => {
  e.disclaimer = null;
});

const DetailsView = ({ match: { params }, setSignupModalVisible }) => {
  const { profile, countries, loading } = UIStore.currentState;
  const [data, setData] = useState(null);
  const [relations, setRelations] = useState([]);
  const { isAuthenticated, loginWithPopup } = useAuth0();
  const [warningVisible, setWarningVisible] = useState(false);
  const relation = relations.find(
    (it) =>
      it.topicId === parseInt(params.id) &&
      it.topic === resourceTypeToTopicType(params.type)
  );

  const allowBookmark =
    params.type !== "stakeholder" || profile.id !== params.id;

  const contentHeaderStyle =
    params.type === "project"
      ? { header: "content-project", topic: "project-topic " + params.type }
      : {
          header: "content-non-project",
          topic: "non-project-topic " + params.type,
        };

  useEffect(() => {
    !loading &&
      params?.type &&
      params?.id &&
      api.get(`/detail/${params.type}/${params.id}`).then((d) => {
        setData(d.data);
      });
    if (profile.reviewStatus === "APPROVED") {
      setTimeout(() => {
        api.get("/favorite").then((resp) => {
          setRelations(resp.data);
        });
      }, 100);
    }
    window.scrollTo({ top: 0 });
  }, [params, loading, profile]);

  const handleRelationChange = (relation) => {
    if (!isAuthenticated) {
      loginWithPopup();
    }
    if (profile.reviewStatus === "SUBMITTED") {
      setWarningVisible(true);
    }
    if (isAuthenticated && profile.reviewStatus === undefined) {
      setSignupModalVisible(true);
    }
    if (profile.reviewStatus === "APPROVED") {
      api.post("/favorite", relation).then((res) => {
        const relationIndex = relations.findIndex(
          (it) => it.topicId === relation.topicId
        );
        if (relationIndex !== -1) {
          setRelations([
            ...relations.slice(0, relationIndex),
            relation,
            ...relations.slice(relationIndex + 1),
          ]);
        } else {
          setRelations([...relations, relation]);
        }
      });
    }
  };

  if (!data) {
    return (
      <div className="details-view">
        <div className="loading">
          <LoadingOutlined spin />
          <i>Loading...</i>
        </div>
      </div>
    );
  }

  return (
    <div className="details-view">
      <div className="bc">
        <div className="ui container">
          <Link to="/browse">All resources</Link>
          <RightOutlined />
          <Link to={`/browse?topic=${params.type}`}>
            {topicNames(params.type)}
          </Link>
          <RightOutlined />
          <span className="details-active">
            {data.title || data.name} {data.firstName} {data.lastName}
          </span>
        </div>
      </div>

      {/* Header */}
      <div className={contentHeaderStyle.header}>
        <div className="ui container">
          <div className="header-container">
            <div className="title">
              <div className="type-tag">
                <span className={contentHeaderStyle.topic}>
                  {topicNames(params.type)}
                </span>
              </div>
              {params.type === "technology" && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      width: "6%",
                      padding: "15px 0",
                      marginRight: "20px",
                    }}
                  >
                    <Image
                      key="logo"
                      width="100%"
                      src={data.logo || logoNotFound}
                    />
                  </div>
                  <div style={{ width: "90%" }}>
                    <h1>{data.title || data.name}</h1>
                  </div>
                </div>
              )}
              {params.type !== "technology" && (
                <h1>
                  {data.title || data.name} {data.firstName} {data.lastName}
                </h1>
              )}
              {relation?.association?.map((relationType, index) => (
                <Tag color="blue" key={`relation-${index}`}>
                  {relationType}
                </Tag>
              ))}
            </div>
            <div className="bookmark">
              {allowBookmark && (
                <BookmarkBtn
                  topic={params}
                  {...{ handleRelationChange, relation }}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="ui container">
        <div className="content-body">
          {/* Left */}
          <div key="left" className={`content-column ${params.type}-left`}>
            <Image
              key="desc-image"
              style={{ marginBottom: "20px" }}
              width={"100%"}
              src={renderDetailImage(params, data)}
            />
            {renderDescription(params, data)}
            {renderTypeOfActions(params, data)}
          </div>

          {/* Right */}
          <div key="right" className={`content-column ${params.type}-right`}>
            {countries && renderDetails(params, data, profile, countries)}
            {countries && renderInfo(params, data, profile, countries)}
          </div>
        </div>
      </div>
      <ModalWarningUser
        visible={warningVisible}
        close={() => setWarningVisible(false)}
      />
    </div>
  );
};

const BookmarkBtn = ({ topic, relation, handleRelationChange }) => {
  const handleChangeRelation = (relationType) => ({ target: { checked } }) => {
    let association = relation ? [...relation.association] : [];
    if (checked) {
      association = [...association, relationType];
    } else {
      association = association.filter((it) => it !== relationType);
    }
    handleRelationChange({
      topicId: parseInt(topic.id),
      association,
      topic: resourceTypeToTopicType(topic.type),
    });
  };
  return (
    <div className="portfolio-bar" onClick={(e) => e.stopPropagation()}>
      <Dropdown
        overlay={
          <ul className="relations-dropdown">
            {relationsByTopicType[resourceTypeToTopicType(topic.type)].map(
              (relationType) => (
                <li key={`${relationType}`}>
                  <Checkbox
                    checked={
                      relation &&
                      relation.association &&
                      relation.association.indexOf(relationType) !== -1
                    }
                    onChange={handleChangeRelation(relationType)}
                  >
                    {relationType}
                  </Checkbox>
                </li>
              )
            )}
          </ul>
        }
        trigger={["click"]}
      >
        <Button size="large" icon={<PlusOutlined />} shape="circle" />
      </Dropdown>
      <div className="label" style={{ color: "#01ABF1", fontWeight: 500 }}>
        Bookmarks
      </div>
    </div>
  );
};

export default DetailsView;
