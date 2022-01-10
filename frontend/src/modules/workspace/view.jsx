import React, { useState } from "react";
import { PageHeader, Row, Col, Button } from "antd";
import classNames from "classnames";
import "./styles.scss";
import ActionPlan from "./actionPlan";
import DownloadPdf from "../../images/workspace/download-pdf.svg";

import IconHome from "../../images/workspace/home-icon.svg";
import IconBookmark from "../../images/workspace/bookmark-icon.svg";
import IconNetwork from "../../images/workspace/network-icon.svg";
import IconAdmin from "../../images/workspace/admin-icon.svg";

const plans = [
  { id: 0, title: "Create", content: "Create" },
  { id: 1, title: "Implement", content: "Implement" },
  { id: 2, title: "Report", content: "Report" },
  { id: 3, title: "Update", content: "Update" },
];

const sidebar = [
  { id: 1, title: "Home", image: "" },
  { id: 2, title: "Bookmarks", image: "" },
  { id: 3, title: "Network", image: "" },
  { id: 4, title: "Admin", image: "" },
];

const icons = [IconHome, IconBookmark, IconNetwork, IconAdmin];

const Workspace = () => {
  const [activeMenu, setActiveMenu] = useState(1);
  return (
    <div id="workspace">
      <Row type="flex" className="bg-dark-primary">
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
        <Col lg={3} md={3} xs={24} order={1} className="sidebar">
          <Row type="flex" justify="center">
            {sidebar.map((s, sx) => (
              <Col
                key={sx}
                lg={24}
                md={24}
                xs={6}
                className={classNames("item-sidebar", {
                  active: activeMenu === s.id,
                })}
                onClick={() => setActiveMenu(s.id)}
              >
                <div style={{ margin: "auto", textAlign: "center" }}>
                  <img src={icons[sx] || IconHome} />
                  <p style={{ color: "#fff" }}>{s.title}</p>
                </div>
              </Col>
            ))}
          </Row>
        </Col>
        <Col lg={21} md={21} xs={24} order={2}>
          <Row>
            <Col span={24} style={{ position: "relative" }}>
              <div className="section-download text-white">
                <div className="card">
                  <article className="content">
                    <h3 className="download-guidance text-white">
                      Download our action plan creation guidance document
                    </h3>
                    <p>
                      Integer legentibus erat a ante historiarum dapibus.
                      Petierunt uti sibi concilium totius Galliae in diem certam
                      indicere. Idque Caesaris facere voluntate liceret: sese
                      habere. Fictum, deserunt mollit anim laborum astutumque!
                      Non equidem invideo, miror magis posuere velit aliquet.
                      <br />
                      Contra legem facit qui id facit quod lex prohibet. Ullamco
                      laboris nisi ut aliquid ex ea commodi consequat.
                      Pellentesque habitant morbi tristique senectus et netus.
                      Ut enim ad minim veniam, quis nostrud exercitation. Cum
                      ceteris in veneratione tui montes, nascetur mus.
                    </p>
                  </article>
                  <a href="#" className="download-link">
                    <img src={DownloadPdf} alt="download-pdf-document" />
                    <span className="download-text text-white">Download</span>
                  </a>
                </div>
              </div>
            </Col>
            <ActionPlan plans={plans} classNames={classNames} />
          </Row>
        </Col>
      </Row>
    </div>
  );
};

export default Workspace;
