import {
  LoadingOutlined,
  RightOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Button, Tag, Image, Divider, Dropdown, Checkbox } from "antd";
import React, { Fragment, useState } from "react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import {
  topicNames,
  resourceTypeToTopicType,
  relationsByTopicType,
} from "../../utils/misc";
import { useAuth0 } from "@auth0/auth0-react";
// import { languages, countries } from "countries-list";
import { languages } from "countries-list";
import ModalWarningUser from "../../utils/modal-warning-user";
// import countries3to2 from "countries-list/dist/countries3to2.json";
import capitalize from "lodash/capitalize";
import some from "lodash/some";
import "./styles.scss";
import {
  typeOfActionKeys,
  detailMaps,
  infoMaps,
  descriptionMaps,
} from "./mapping";
import values from "lodash/values";
import moment from "moment";
import imageNotFound from "../../images/image-not-found.png";
import logoNotFound from "../../images/logo-not-found.png";
import uniqBy from "lodash/uniqBy";
import find from "lodash/find";

const renderItemValues = (params, mapping, data, profile, countries) => {
  return (
    mapping &&
    mapping.map((item, index) => {
      const { key, name, value, type, customValue } = item;
      return (
        <Fragment key={`${params.type}-${name}`}>
          {(data[key] ||
            data[key] === 0 ||
            (value === "countries" && data.geoCoverageType) ||
            key === null) && (
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
                {value === key && type === "currency" && "USD " + data[value]}
                {value === key && type === "link" && (
                  <a
                    target="_blank"
                    rel="noreferrer"
                    href={data[value]}
                    style={{ wordBreak: "break-word" }}
                  >
                    {data[value]}
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
                  // countries[countries3to2[data[key]]].name
                  find(countries, (it) => it.isoCode === data[key]).name}
                {value === "custom" &&
                  type === "object" &&
                  data[key][customValue]}
                {value === "custom" &&
                  type === "date" &&
                  moment(data[customValue[0]]).format("DD MMM YYYY") +
                    " / " +
                    moment(data[customValue[1]]).format("DD MMM YYYY")}
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

                {/* Country details */}
                {value === "countries" &&
                  (data[key] === null || data[key][0] === "***") &&
                  data.geoCoverageType === "global" && (
                    <div className="scrollable">
                      {
                        // values(countries)
                        //   .map((c) => c.name)
                        //   .join(", ")
                        countries.map((it) => it.name).join(", ")
                      }
                    </div>
                  )}
                {value === "countries" &&
                  data[key] !== null &&
                  data.geoCoverageType === "regional" &&
                  data[key].join(", ")}
                {value === "countries" &&
                  data[key] !== null &&
                  data.geoCoverageType === "global" && (
                    <div className="scrollable">
                      {
                        // data[key]
                        //   .map((x) => countries[countries3to2[x]].name)
                        //   .join(", ")
                        data[key]
                          .map((x) => {
                            return find(countries, (it) => it.isoCode === x)
                              .name;
                          })
                          .join(", ")
                      }
                    </div>
                  )}
                {value === "countries" &&
                  data[key] !== null &&
                  data.geoCoverageType === "transnational" && (
                    <div className="scrollable">
                      {
                        // data[key]
                        //   .map((x) => countries[countries3to2[x]].name)
                        //   .join(", ")
                        data[key]
                          .map((x) => {
                            return find(countries, (it) => it.isoCode === x)
                              .name;
                          })
                          .join(", ")
                      }
                    </div>
                  )}
                {value === "countries" &&
                  data[key] !== null &&
                  (data.geoCoverageType === "national" ||
                    data.geoCoverageType === "sub-national") &&
                  // data[key]
                  //   .map((x) => countries[countries3to2[x]].name)
                  //   .join(", ")
                  data[key]
                    .map((x) => {
                      return find(countries, (it) => it.isoCode === x).name;
                    })
                    .join(", ")}
                {/* EOF Country details */}

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
                    {" "}
                    {data[key].map((x, i) => (
                      <li key={x.name || x}>
                        <a
                          target="_blank"
                          rel="noreferrer"
                          href={x.name || x}
                          style={{ wordBreak: "break-word" }}
                        >
                          {x.name || x}
                        </a>
                      </li>
                    ))}{" "}
                  </ul>
                )}

                {value === "custom" &&
                  type === "currency" &&
                  `${data[customValue[0]] && data[customValue[0]]} ${
                    data[customValue[1]] && data[customValue[1]]
                  } - ${data[customValue[2]] && data[customValue[2]]}`}

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
          {(data[key] ||
            data[key] === 0 ||
            (value === "countries" && data.geoCoverageType)) &&
            index !== mapping.length - 1 && (
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

  if (!keyAvailable || params.type !== "project") {
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
                            return (
                              <li className="value" key={name + index}>
                                {name} : {data[key][value]}
                              </li>
                            );
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

const renderDetails = (params, data, profile, countries) => {
  const details = detailMaps[params.type];
  if (!details) {
    return;
  }
  return (
    <div key={"details"} className="card">
      <h3>{topicNames(params.type)} Detail</h3>
      <div className="table">
        {renderItemValues(params, details, data, profile, countries)}
      </div>
    </div>
  );
};

const renderInfo = (params, data, profile, countries) => {
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
      <div className="table">
        {renderItemValues(params, info, data, profile, countries)}
      </div>
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

const DetailsView = ({ match: { params }, ...props }) => {
  const { profile, setSignupModalVisible, countries } = props;
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
    api.get(`/detail/${params.type}/${params.id}`).then((d) => {
      setData(d.data);
    });
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      setTimeout(() => {
        api.get("/favorite").then((resp) => {
          setRelations(resp.data);
        });
      }, 100);
    }
  }, [isAuthenticated]);

  const handleRelationChange = (relation) => {
    api
      .post("/favorite", relation)
      .then((res) => {
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
      })
      .catch((err) => {
        if (isAuthenticated) {
          if (Object.keys(profile).length === 0) {
            setSignupModalVisible(true);
          } else {
            setWarningVisible(true);
          }
        } else {
          loginWithPopup();
        }
      });
  };

  useEffect(() => {
    props.updateDisclaimer(null);
  }, []);

  if (!data)
    return (
      <div className="details-view">
        <div className="loading">
          <LoadingOutlined spin />
          <i>Loading...</i>
        </div>
      </div>
    );

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
          <div key="left" className="content-column">
            <Image
              key="desc-image"
              style={{ marginBottom: "20px" }}
              width="100%"
              src={data.image || data.picture || imageNotFound}
            />
            {renderDescription(params, data)}
            {renderTypeOfActions(params, data)}
          </div>

          {/* Right */}
          <div key="right" className="content-column">
            {renderDetails(params, data, profile, countries)}
            {renderInfo(params, data, profile, countries)}
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
    if (checked) association = [...association, relationType];
    else association = association.filter((it) => it !== relationType);
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
