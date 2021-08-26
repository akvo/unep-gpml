import React, { useState } from "react";
import { Button, Input, Row, Col } from "antd";
import { withRouter } from "react-router-dom";
import { SearchOutlined } from "@ant-design/icons";

import "./styles.scss";

const alphabet = [..."abcdefghijklmnopqrstuvwxyz"];
const staticGlossary = [
  {
    group: "a",
    data: [
      {
        title: "Action Plans",
        description: null,
      },
    ],
  },
  {
    group: "e",
    data: [
      {
        title: "Event",
        description: null,
      },
    ],
  },
  {
    group: "f",
    data: [
      {
        title: "Financial Resource",
        description: null,
      },
    ],
  },
  {
    group: "i",
    data: [
      {
        title: "Initiative",
        description: null,
      },
    ],
  },
  {
    group: "t",
    data: [
      {
        title: "Technical Resource",
        description: null,
      },
      {
        title: "Technology",
        description: null,
      },
    ],
  },
];

const Glossary = () => {
  return (
    <div id="glossary">
      {/* Will be removed after */}
      <div className="ui container section-container">
        <h2 className="text-blue">GPML Glossary</h2>
        <p className="body-text" style={{ fontSize: "1.125rem" }}>
          You can view the full glossary of the GPML Digital Platform (v 07 July
          2021) via{" "}
          <a
            href="https://docs.google.com/spreadsheets/d/1-z-UB-S5RQBSwQsxNi535-AxcQTvU19f-LxINmyYXt0/edit#gid=1921541772"
            target="_blank"
            rel="noreferrer"
          >
            this link
          </a>
          .
        </p>
      </div>

      {/* Commented for future design */}
      {/* <div className="glossary-banner">
        <div className="ui container section-container">
          <h2 className="text-green">GPML Glossary</h2>
          <Search />
          <div className="alphabet-row">
            {alphabet.map((x, i) => (
              <span key={`${x}-${i}`} className="item-alphabet">
                {x}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="glossary-body">
        <div className="ui container section-container">
          {renderGlossary()}
        </div>
      </div> */}
    </div>
  );
};

const renderGlossary = () => {
  return staticGlossary.map((x, i) => {
    const { group, data } = x;
    return (
      <Row key={`${group}-${i}`} className="glossary-row">
        <Col sm={2} md={2} lg={2}>
          <h2 className="text-blue">{group}</h2>
        </Col>
        <Col sm={22} md={22} lg={22}>
          <Row className className="glossary-item-body" gutter={[20, 20]}>
            {data.map((d, idx) => {
              const { title, description } = d;
              return (
                <Col
                  key={`${title}-${idx}`}
                  className="glossary-item-wrapper"
                  sm={24}
                  md={6}
                  lg={6}
                >
                  <h4 className="text-blue">{title}</h4>
                  <p className="body-text text-blue">
                    {description ||
                      "At nos hinc posthac, sitientis piros Afros. Inmensae subtilitatis, obscuris et malesuada fames. Magna pars studiorum, prodita quaerimus. Quid securi etiam tamquam eu fugiat nulla pariatur. Ab illo tempore, ab est sed immemorabili."}
                  </p>
                </Col>
              );
            })}
          </Row>
        </Col>
      </Row>
    );
  });
};

const Search = withRouter(({ history }) => {
  const [search, setSearch] = useState("");
  const handleSearch = (src) => {
    if (src) {
      window.alert("Search is under construction!!!");
      return;
    }
  };

  return (
    <div className="src">
      <Input
        className="input-src"
        placeholder="Search"
        suffix={
          <Button
            onClick={() => handleSearch(search)}
            type="primary"
            shape="circle"
            size="small"
            icon={<SearchOutlined />}
          />
        }
        onPressEnter={(e) => handleSearch(e.target.value)}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
  );
});

export default Glossary;
