import React from "react";
import { PageHeader, Row, Col } from "antd";
import "./styles.scss";
import ActionPlan from "./ActionPlan";
import LeftSidebar from "./LeftSidebar";
import DownloadPdf from "../../images/workspace/download-pdf.svg";


const Workspace = () => {
  return (
    <div id="workspace">
      <Row type="flex" className="bg-dark-primary header-container">
        <Col>
          <PageHeader
            title={
              <span className="header-text text-white">
                Welcome back, <b className="user-name">John Morizot</b>
              </span>
            }
          />
        </Col>
      </Row>
      <Row type="flex">
        <LeftSidebar />
        <Col lg={21} md={21} xs={24} order={2}>
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
