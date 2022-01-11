import React, { useState } from "react";
import { Link } from "react-router-dom";
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
  {
    id: 0,
    title: "Create",
    content: (
      <>
        <h3>Purpose</h3>
        <p>
          This phase concerns the development of the action plan with engagement
          of stakeholders, starting from data collection and setting targets to
          defining a strategic approach and designing the monitoring and review
          programme.
        </p>
        <h3>How the Digital Platform can support</h3>
        <p>
          The Digital Platform contains various guidance documents that can be
          used when creating an action plan, including the{" "}
          <a href="https://digital.gpmarinelitter.org/technical_resource/253">
            Marine Litter: Guidelines for designing action plans.
          </a>{" "}
          In addition, the following functionalities of the Digital Platform can
          be considered for this phase:
        </p>
        <ul>
          <li>
            The repository of{" "}
            <a href="https://digital.gpmarinelitter.org/browse?country=&transnational=&topic=action_plan&tag=&q=&offset=0">
              Action Plans
            </a>{" "}
            and{" "}
            <a href="https://digital.gpmarinelitter.org/browse?country=&transnational=&topic=policy&tag=&q=&offset=0">
              Policies
            </a>{" "}
            can be used to identify relevant examples of action plans and
            policies at the transnational and national level. Some of those are
            described in more detail as{" "}
            <Link to="case-studies">Case Studies</Link>.
          </li>
          <li>
            The Digital Platform also contains various resources that can
            support the collection of baseline data, in the absence of national
            data. For instance, the waste data layer in the{" "}
            <a href="https://datahub.gpmarinelitter.org/">Data Hub</a> provides
            statistics of urban waste generated and mismanaged plastic waste at
            the country level. The repository of Monitoring & Analysis{" "}
            <a href="https://digital.gpmarinelitter.org/browse?country=&transnational=&topic=project&tag=&q=&offset=0">
              Initiatives
            </a>{" "}
            can be helpful in identifying relevant data.
          </li>
          <li>
            Calculation tools for providing national estimates, such as the{" "}
            <a href="https://digital.gpmarinelitter.org/technical_resource/10084">
              WFD Tool
            </a>{" "}
            and{" "}
            <a href="https://digital.gpmarinelitter.org/technical_resource/138">
              ISWA plastic pollution calculator
            </a>{" "}
            , can be found under <Link to="/learning">Tools & Toolkits</Link>.
          </li>
          <li>
            The{" "}
            <a href="https://digital.gpmarinelitter.org/stakeholders?country=&transnational=&topic=organisation%2Cstakeholder&tag=&q=&offset=0">
              Connect Stakeholders
            </a>{" "}
            component can be used to identify and map stakeholders, as well as
            to identify organizations and experts that can provide specific
            services and expertise.
          </li>
          <li>
            The <Link to="/learning">Capacity Building section</Link> contains
            <Link to="/learning">Courses & Trainings</Link> and{" "}
            <a href="https://digital.gpmarinelitter.org/browse?country=&transnational=&topic=event&tag=&q=&offset=0">
              Events
            </a>
            , such as the{" "}
            <a href="https://digital.gpmarinelitter.org/technical_resource/149">
              MOOC on Marine Litter
            </a>{" "}
            , webinars, and conferences, that provide training opportunities in
            different areas.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 1,
    title: "Implement",
    content: (
      <>
        <h3>Purpose</h3>
        <p>
          The Action Plan is implemented through selected implementation
          actions. Implementation is supported by cooperation and engagement of
          stakeholders, sharing of information, reporting of progress on
          actions, education, outreach, and awareness raising as well as
          training and capacity building.
        </p>

        <h3>How the Digital Platform can support</h3>
        <ul>
          <li>
            Guidance on implementation actions can be found in various{" "}
            <Link to="/learning">Guidance Documents</Link>. The{" "}
            <Link to="/case-studies">Belize and PAME case study</Link> provide
            examples of different types of implementation actions that are being
            applied as part of a national and Regional Action Plan respectively.
            Other examples include:
          </li>
          <i>Regional action plans</i>
          <ul>
            <li>
              <a href="https://digital.gpmarinelitter.org/action_plan/201">
                OSPAR Commission, Regional Action Plan for Prevention and
                Management of Marine Litter in the North-East Atlantic
              </a>
            </li>
            <li>
              <a href="https://digital.gpmarinelitter.org/action_plan/205">
                SPREP , Pacific Regional Action Plan MARINE LITTER (2018?2025)
              </a>
            </li>
            <li>
              <a href="https://digital.gpmarinelitter.org/action_plan/10327">
                Strategic Action Plan for the Environmental Protection and
                Rehabilitation of the Black Sea
              </a>
            </li>
            <li>
              <a href="https://digital.gpmarinelitter.org/action_plan/199">
                Western Indian Ocean, Regional Action Plan on Marine Litter
              </a>
            </li>
            <li>
              <a href="https://digital.gpmarinelitter.org/action_plan/200">
                NOWPAP Regional Action Plan on Marine Litter
              </a>
            </li>
            <i>National Action Plans</i>
            <li>
              <a href="https://digital.gpmarinelitter.org/action_plan/207">
                Canada: Strategy on Zero Plastic Waste, Phase 2
              </a>
            </li>
            <i>Sub national Action Plans</i>
            <li>
              <a href="https://digital.gpmarinelitter.org/action_plan/10328">
                North Carolina Marine Debris Action Plan January 2020
              </a>
            </li>
          </ul>
          <li>
            The <Link to="/learning">Capacity Building section</Link> contains
            an extensive repository of
            <Link to="/learning">{" "}
              Education & Awareness Raising Resources
            </Link>{" "}
            as well as <Link to="/learning">Courses & Trainings</Link> that may
            be helpful in implementing education, awareness raising and capacity
            building actions. An example is the{" "}
            <a href="https://digital.gpmarinelitter.org/technical_resource/149">
              MOOC on Marine litter
            </a>
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 2,
    title: "Report",
    content: (
      <>
        <h3>Purpose</h3>
        <p>
          At regular intervals, progress is reported on the implementation
          measures as well as the overall performance of the Action Plan with
          the purpose of tracking progress on implementation and effectiveness.
        </p>
        <h3>How the Digital Platform can support</h3>
        <ul>
          <li>
            Guidance documents for monitoring and assessment, including the{" "}
            <a hreef="https://digital.gpmarinelitter.org/technical_resource/10024">
              GESAMP Guidelines for the Monitoring and Assessment of Plastic
              Litter in the Ocean
            </a>{" "}
            can be found under Technical Resources.
          </li>
          <li>
            The <a href="https://datahub.gpmarinelitter.org/">Data Hub</a>{" "}
            component of the GPML Digital Platform offers a coordinated,
            authoritative point of access for information on marine litter and
            plastic pollution, from source to fate. It includes a data map,
            layers and dashboard, data catalogue (or metadata repository), an
            API platform, and education material including story maps. Tools and
            data made available in the Data Hub will support measurement of
            progress and reporting.
          </li>
          <li>
            Analysis and comparison with other data layers such as hotspot data
            from the University of Leeds and UN Habitat Spatio-temporal
            quantification of Plastic pollution Origins and Transportation
            (SPOT) model, can help in assessing the effectiveness of action
            plans.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 3,
    title: "Update",
    content: (
      <>
        <h3>Purpose</h3>
        <p>
          Based on an agreed methodology for measuring the effectiveness of the
          implementation measures as well as the overall plan, the Action Plan
          is reviewed at regular intervals, thus ensuring that it is relevant
          and effective.
        </p>
      </>
    ),
  },
];

const sidebar = [
  { id: 1, title: "Home", url: "" },
  { id: 2, title: "Bookmarks", url: "" },
  { id: 3, title: "Network", url: "" },
  { id: 4, title: "Admin", url: "" },
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
                      Download the Action Plan Workflow Guidance
                    </h3>
                    <p>
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
            <ActionPlan plans={plans} classNames={classNames} />
          </Row>
        </Col>
      </Row>
    </div>
  );
};

export default Workspace;
