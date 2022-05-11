import React from "react";
import { Row, Col } from "antd";

import "./styles.scss";
import Header from "./header";
import LeftSidebar from "../../components/left-sidebar/left-sidebar";
import ActionPlan from "./action-plan";

// Icons
import { ReactComponent as IconHome } from "../../images/workspace/home-icon.svg";
import { ReactComponent as IconAdmin } from "../../images/workspace/admin-icon.svg";
import DownloadPdf from "../../images/workspace/download-pdf.svg";

const Workspace = ({ profile }) => {
  const userName =
    profile?.firstName !== undefined &&
    profile?.lastName !== undefined &&
    `${profile.firstName} ${profile.lastName}`;

  const sidebar = [
    { id: 1, title: "Home", url: "/workspace", icon: <IconHome /> },
    {
      id: 4,
      title: "Admin",
      url: profile.role !== "USER" ? "/profile/admin-section" : "",
      icon: <IconAdmin />,
    },
  ];

  return (
    <div id="workspace">
      <Header userName={userName} />
      <Row type="flex">
        <LeftSidebar profile={profile} sidebar={sidebar}>
          <Col lg={24} md={24} xs={24} order={2}>
            <Row>
              <Col span={24} style={{ position: "relative" }}>
                <div className="section-download text-white">
                  <div className="card">
                    <article className="content">
                      <h3 className="download-guidance text-white">
                        Download the Action Plan Workflow Guidance
                      </h3>
                      <p className="paragraph">
                        This one-pager document outlines how the functionality
                        of the Global Partnership on Marine Litter (GPML)
                        Digital Platform supports the development of national
                        marine litter and plastic pollution action plans, within
                        the different phases of the Action Plan Creation
                        Workflow.
                      </p>
                    </article>
                    <a
                      href="https://wedocs.unep.org/bitstream/handle/20.500.11822/37900/Action%20Plan%20Guidance%20document%20.pdf?sequence=1&isAllowed=y"
                      target="_blank"
                      className="download-link"
                    >
                      <img src={DownloadPdf} alt="download-pdf-document" />
                      <span className="download-text text-white">Download</span>
                    </a>
                  </div>
                </div>
              </Col>
              <ActionPlan />
            </Row>
          </Col>
        </LeftSidebar>
      </Row>
    </div>
  );
};

export default Workspace;
