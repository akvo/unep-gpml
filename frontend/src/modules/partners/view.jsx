import React from "react";
import { Row, Col } from "antd";

function Partners() {
  return (
    <div id="partners">
      <Row type="flex" className="body-wrapper">
        <Col lg={24} xs={24} order={2}>
          <iframe
            scrolling="auto"
            frameborder="0"
            title="Partners"
            style={{ height: "1300px", width: "100%", marginTop: 20 }}
            allow="geolocation https://experience.arcgis.com"
            src="https://experience.arcgis.com/experience/b5602e1dc3eb4cfd8157320f9c8c098f/"
          ></iframe>
        </Col>
      </Row>
    </div>
  );
}

export default Partners;
