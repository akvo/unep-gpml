import React from "react";
import { Row, Col, Typography, Tooltip, Button, Avatar } from "antd";

import datastakeholders from "./json/stakeholders.json";
import { titleCase } from "../../utils/string";

const { Title, Paragraph, Text } = Typography;

const CaseStudy = ({
  tags,
  title,
  image,
  platform_link,
  background_color,
  geo_coverage,
  challenge_and_solution,
  stakeholders_involved,
}) => {
  const stakeholders =
    typeof stakeholders_involved === "string"
      ? stakeholders_involved.split(",")
      : stakeholders_involved;
  const tagItems = typeof tags === "string" ? tags.split(",") : tags;
  return (
    <Row className="case-studies-page">
      <Col
        lg={14}
        sm={24}
        style={{
          backgroundImage: `url(${image})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          display: "flex",
          height: "auto",
          borderBottom: "4px solid #18162F",
          borderLeft: "4px solid #18162F",
          borderTop: "4px solid #18162F",
        }}
      >
        <div className="p-4">
          <Title>{title}</Title>
        </div>
      </Col>
      <Col
        lg={10}
        sm={24}
        style={{
          backgroundColor: background_color,
          borderBottom: "4px solid #18162F",
          borderRight: "4px solid #18162F",
          borderLeft: "1px solid #18162F",
          borderTop: "4px solid #18162F",
        }}
      >
        <div className="p-4 content-text">
          <Row gutter={[8, 8]}>
            <Col>
              <h4 className="title">Challenge & Solution</h4>
              <Paragraph>
                <div
                  dangerouslySetInnerHTML={{ __html: challenge_and_solution }}
                />
              </Paragraph>
            </Col>
            <Col>
              <div style={{ display: "flex", gap: 5, minHeight: 32 }}>
                <div style={{ margin: "auto" }}>
                  <img
                    src="/case-studies/globe-outline.svg"
                    style={{ width: 32, height: 32 }}
                  />
                </div>
                <div style={{ margin: "auto" }}>
                  <Text>{geo_coverage}</Text>
                </div>
              </div>
            </Col>
            <Col>
              <h4 className="title">Tags</h4>
              <ul className="tags">
                {Object?.values(tagItems)
                  ?.filter((tag, tx) => tx <= 7)
                  ?.map((tag, tx) => (
                    <li className="tag-item" key={tx}>
                      {tag.length > 5 ? titleCase(tag) : tag}
                    </li>
                  ))}
                {/* {tagItems.length > 7 && tagItems.length - 7 > 1 && (
                  <li className="tag-item">{`${tagItems.length - 7} mores`}</li>
                )} */}
              </ul>
            </Col>
            <Col>
              <h4 className="title">Connections</h4>
              <div className="avatars">
                {stakeholders.length > 4 && (
                  <div className="avatar green-border">
                    + {stakeholders.length - 4}
                  </div>
                )}
                {Object?.values(stakeholders)
                  ?.filter((sk, sx) => sx < 4)
                  ?.map((sk, sx) => {
                    const findSk = datastakeholders.find((ds) =>
                      sk?.toLowerCase()?.includes(ds?.name?.toLowerCase())
                    );
                    const avatar = findSk ? (
                      findSk.image
                    ) : (
                      <Avatar
                        style={{
                          backgroundColor: "#006776",
                          verticalAlign: "middle",
                        }}
                        size={60}
                      >
                        {sk?.substring(0, 2)}
                      </Avatar>
                    );
                    return (
                      <Tooltip className="avatar" title={sk} key={sx}>
                        <Avatar src={avatar} />
                      </Tooltip>
                    );
                  })}
              </div>
            </Col>
          </Row>
          <Row>
            <Col>
              <Button
                href={platform_link || "#"}
                type="link"
                shape="round"
                className="green-border case-study-learn-btn"
                target="_blank"
                rel="noopener noreferrer"
                size="small"
              >
                Learn More
              </Button>
            </Col>
          </Row>
        </div>
      </Col>
    </Row>
  );
};

export default CaseStudy;
