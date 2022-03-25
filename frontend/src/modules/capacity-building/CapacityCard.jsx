import React from "react";
import { Row, Col, Card } from "antd";
import classNames from "classnames";

import { titleCase } from "../../utils/string";

export const CapacityCard = ({ category_id, image, title }) => (
  <Row gutter={[8, 8]}>
    <Col
      xl={category_id === "events" ? 10 : 8}
      xs={category_id === "events" ? 12 : 10}
    >
      <div className="thumbnail">
        <img src={image} alt={title} />
      </div>
    </Col>
    <Col
      xl={category_id === "events" ? 14 : 16}
      xs={category_id === "events" ? 12 : 14}
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
        <span className="see-more">See more</span>
      </Card>
    </Col>
  </Row>
);
