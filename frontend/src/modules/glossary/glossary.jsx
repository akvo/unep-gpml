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
        <iframe
          src={"https://dev-gpmlglossary.pantheonsite.io/"}
          title="file"
          width="100%"
          height="600"
          style={{ border: "none" }}
        />
        {/* <h2 className="text-blue">GPML Glossary</h2>
        <p className="body-text" style={{ fontSize: "1.125rem" }}>
          To facilitate data interoperability UNEP has been working closely with
          Ontology Experts to develop the first draft of the Marine Litter and
          Plastic Pollution Ontology and connect it with existing and widely
          used ontologies. Currently, 70 terms with draft definitions
          and relations among terms have been identified and peer reviewed.
          <br />
          <br />
          Experts in the Marine Litter and Plastic Pollution domain are invited
          to review the draft definitions of the Marine Litter and Plastic
          Pollution Ontology. The peer-review process is ongoing to allow
          reviewers to request new content to be added. If you are interested in
          contributing, please contact us at{" "}
          <a href="mailto:unep-gpmarinelitter@un.org">
            unep-gpmarinelitter@un.org
          </a>
          .
          <br />
          <br />
          Additionally, to facilitate discussions and create linkages with terms
          related to the marine litter and plastic pollution domain, a longer
          list of terms has been compiled in a Draft Glossary. Terms that are
          not included in the marine litter and plastic pollution ontology, or
          related ontologies, have either been sourced from official glossaries
          or from vocabulary definitions.
          <br />
          <br />
          The agreed terms and their definitions will support the development of
          GPML Digital Platform functionalities such as knowledge
          graphs creation as well as data, publication and web pages tagging. 
          <br />
          <br />
          <a
            href="https://docs.google.com/spreadsheets/d/1-z-UB-S5RQBSwQsxNi535-AxcQTvU19f-LxINmyYXt0/edit#gid=1921541772"
            target="_blank"
            rel="noreferrer"
          >
            You can access the Draft Glossary here
          </a>
          .
        </p> */}
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
          <Row className="glossary-item-body" gutter={[20, 20]}>
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
