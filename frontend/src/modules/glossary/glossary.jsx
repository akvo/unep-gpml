import React, { useState } from "react";
import { Row, Col, Card, Image, Button, Input } from "antd";
import { withRouter } from "react-router-dom";
import { SearchOutlined } from "@ant-design/icons";

import "./styles.scss";
import { span } from "prelude-ls";

const alphabet = [..."abcdefghijklmnopqrstuvwxyz"];
const Glossary = () => {
  console.log(alphabet);
  return (
    <div id="glossary">
      <div className="glossary-banner">
        <div className="ui container section-container">
          <h2 className="text-green">GPML Glossary</h2>
          <Search />
          <div className="row-alphabet">
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
          <p className="body-text">
            You can view the full glossary of the GPML Digital Platform (v 07
            July 2021) via{" "}
            <a
              href="https://docs.google.com/spreadsheets/d/1-z-UB-S5RQBSwQsxNi535-AxcQTvU19f-LxINmyYXt0/edit#gid=1921541772"
              target="_blank"
              rel="noreferrer"
            >
              this link
            </a>
          </p>
        </div>
      </div>
    </div>
  );
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
