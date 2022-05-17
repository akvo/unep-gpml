import React from "react";
import { Row, Col, Card } from "antd";
import classNames from "classnames";

import { titleCase } from "../../utils/string";

export const CapacityCard = ({ category_id, image, title }) => (
  <Row gutter={[8, 8]}>
    <Col className={category_id === "events" ? "events-col" : "resource-col"}>
      <div className="thumbnail">
        <img src={image} alt={title} />
      </div>
    </Col>
    <Col
      className={
        category_id === "events"
          ? "events-col-fullwidth"
          : "resource-col-fullwidth"
      }
    >
      <Card
        className={`card bg-color ${category_id}`}
        bordered={false}
        hoverable
      >
        <span
          className={classNames("title", {
            small: title.length > 100,
          })}
        >
          {titleCase(title).replace(/(.{40})..+/, "$1....")}
        </span>
        <span className="see-more">See more &gt;</span>
      </Card>
    </Col>
  </Row>
);
