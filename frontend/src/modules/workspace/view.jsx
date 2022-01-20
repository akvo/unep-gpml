import React from "react";
import { Row, Col } from "antd";
import "./styles.scss";
import Header from "./Header";
import LeftSidebar from "./LeftSidebar";
import ActionPlan from "./ActionPlan";

import DownloadPdf from "../../images/workspace/download-pdf.svg";

const Workspace = ({ profile }) => {
  const userName =
    profile?.firstName !== undefined &&
    profile?.lastName !== undefined &&
    `${profile.firstName} ${profile.lastName}`;

  return (
    <div id="workspace">
      <Header userName={userName} />
      <Row type="flex">
        <LeftSidebar />
        <Col lg={22} md={21} xs={24} order={2}>
          <Row>
            <Col span={24} style={{ position: "relative" }}>
              <div className="section-download text-white">
                <div className="card">
                  <article className="content">
                    <h3 className="download-guidance text-white">
                      Download the Action Plan Workflow Guidance
                    </h3>
                    <p className="paragraph">
                      This one-pager document outlines how the functionality of
                      the Global Partnership on Marine Litter (GPML) Digital
                      Platform supports the development of national marine
                      litter and plastic pollution action plans, within the
                      different phases of the Action Plan Creation Workflow.
                    </p>
                  </article>
                  <a href="#" className="download-link">
                    <img src={DownloadPdf} alt="download-pdf-document" />
                    <span className="download-text text-white">Download</span>
                  </a>
                </div>
              </div>
            </Col>
            <ActionPlan />
          </Row>
        </Col>
      </Row>
    </div>
  );
};

export default Workspace;
