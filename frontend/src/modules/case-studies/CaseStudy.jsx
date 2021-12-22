import React from "react";
import { sample } from "lodash";
import { Row, Col, Typography, Tooltip, Button, Avatar } from "antd";
import iconGlobe from "../../images/case-studies/globe-outline.svg";

const { Title, Paragraph, Text } = Typography;

const CaseStudy = ({
  name,
  challenge_and_solution,
  geo_coverage,
  tags,
  stakeholders_involved,
  platform_links,
  external_url,
}) => {
  const bgImage = sample([
    {
      image:
        "https://ik.imagekit.io/8bnvluby33xpi/image_174_hwzBFxgH3.png?updatedAt=1640774260036&tr=w-1080,h-1080,fo-auto",
      color: "rgba(26, 109, 141, 0.94)",
    },
    {
      image:
        "https://ik.imagekit.io/8bnvluby33xpi/image_197_2iX7wzNv7.png?updatedAt=1640774277606&tr=w-1080,h-1080,fo-auto",
      color: "rgba(131, 77, 52, 1)",
    },
    {
      image:
        "https://ik.imagekit.io/8bnvluby33xpi/kecilin_image_205_n2Z31FNhx.png?updatedAt=1640779952315&tr=w-1080,h-1080,fo-auto",
      color: "rgba(110, 115, 129, 1)",
    },
    {
      image:
        "https://ik.imagekit.io/8bnvluby33xpi/kecilin_image_209_IkhxOhYwA.png?updatedAt=1640779899519&tr=w-1080,h-1080,fo-auto",
      color: "rgba(126, 143, 103, 1)",
    },
  ]);
  const stakeholders =
    typeof stakeholders_involved === "string"
      ? stakeholders_involved.split(",")
      : stakeholders_involved;
  return (
    <Row className="case-studies">
      <Col
        lg={14}
        sm={24}
        style={{
          backgroundImage: `url(${bgImage.image})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          display: "flex",
          minHeight: "100vh",
        }}
      >
        <div className="p-4">
          <Title level={2}>{name}</Title>
        </div>
      </Col>
      <Col
        lg={10}
        sm={24}
        style={{
          backgroundColor: bgImage.color,
        }}
      >
        <div className="p-4 content-text">
          <Row type="flex" justify="start" align="middle" gutter={[16, 16]}>
            <Col span={24}>
              <h4 className="title">Challenge & Solution</h4>
              <Paragraph ellipsis={{ rows: 20 }}>
                {challenge_and_solution || ""}
              </Paragraph>
            </Col>
            <Col span={3}>
              <img src={iconGlobe} style={{ width: "100%" }} />
            </Col>
            <Col span={21} style={{ padding: 0 }}>
              <Text>{geo_coverage}</Text>
            </Col>
            <Col span={24}>
              <h4 className="title">Tags</h4>
              <ul className="tags">
                {Object?.values(tags)?.map((t, tx) => (
                  <li className="tag-item" key={tx}>
                    {t}
                  </li>
                ))}
              </ul>
            </Col>
            <Col span={24}>
              <h4 className="title">Connections</h4>
              <div className="avatars">
                {stakeholders.length > 4 && (
                  <div className="avatar green-border">
                    {stakeholders.length - 4}+
                  </div>
                )}
                {Object?.values(stakeholders)
                  ?.filter((sk, sx) => sx < 4)
                  ?.map((sk, sx) => {
                    const avatar = sample([
                      "https://ik.imagekit.io/8bnvluby33xpi/avatar-placeholder?updatedAt=1640774297572&tr=w-1080,h-1080,fo-auto",
                      "https://ik.imagekit.io/8bnvluby33xpi/image_64_iWwgh-iQU.png?updatedAt=1640774243901&tr=w-1080,h-1080,fo-auto",
                    ]);
                    return (
                      <Tooltip className="avatar" title={sk} key={sx}>
                        <Avatar src={avatar} />
                      </Tooltip>
                    );
                  })}
              </div>
            </Col>
            <Col span={24}>
              <Button
                type="link"
                href={platform_links}
                shape="round"
                className="green-border"
                target="_blank"
                rel="noopener noreferrer"
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
