import React, { useEffect, useState } from "react";
import "./styles.scss";
import { Collapse, Checkbox, Button, Radio } from "antd";
import api from "../../utils/api";
import {
  CheckOutlined,
  UpCircleOutlined,
  CloseOutlined,
  SendOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { ReactComponent as AtlasSvg } from "../../images/book-atlas.svg";
import { ReactComponent as CaseStudiesSvg } from "../../images/capacity-building/ic-case-studies.svg";
import { ReactComponent as CapacityBuildingSvg } from "../../images/capacity-building/ic-capacity-building.svg";
import { Link } from "react-router-dom";
import { stages } from "./get-started";
import classNames from "classnames";

const { Panel } = Collapse;

const stagesChecklist = [
  {
    key: "S1",
    title: "Create",
    children: [
      {
        title: "Assessment - situation analysis",
        children: [
          {
            title: "Map available research and knowledge",
            content: (checklist) => (
              <>
                The GPML Digital platform provides a wide range of materials to
                support stakeholders’ needs, ranging from scientific research to
                technological innovation and public outreach information.
                <br />
                Browse through the{" "}
                <Link to="/knowledge/library">resource library</Link> to see
                what is available for your country and other regions of the
                platform to view existing resources. You can also{" "}
                <Link to="/flexible-forms">upload new resources</Link> if you
                have resources that are not yet available on the Digital
                Platform.
                <br />
                <div className="buttons">
                  <h5>which tool to use?</h5>
                  <div className="button-wrapper">
                    <Link to="/knowledge/library">
                      <div className="icon">
                        <AtlasSvg />
                      </div>
                      <div className="button-content">
                        <p className="content-title">Knowledge library</p>
                        <p className="content-desc">
                          Resources on marine litter and plastic pollution
                        </p>
                      </div>
                    </Link>
                    <Link to="/flexible-forms">
                      <div className="icon">
                        <CapacityBuildingSvg />
                      </div>
                      <div className="button-content">
                        <p className="content-title">Learning center</p>
                        <p className="content-desc">
                          Learning and capacity building resources
                        </p>
                      </div>
                    </Link>
                  </div>
                </div>
              </>
            ),
          },
          {
            title:
              "Scientific analysis of information on sources, pathways and sinks ",
            content: (checklist) => (
              <>
                "The GPML Digital platform provides a wide range of materials to
                support stakeholders’ needs, ranging from scientific research to
                technological innovation and public outreach information. Browse
                through the resource on information on sources pathways and
                sinks here( link to filtered knowledge library )"
              </>
            ),
          },
          {
            title: "Map waste flows",
            content: (checklist, handleStages) => (
              <>
                Understanding how plastic moves from the consumer through the
                waste management system and the fraction of plastic contained in
                different waste streams can help identify leakage points and
                prioritize interventions.
                <br />
                <br />
                <div>
                  <p>Have you already mapped your waste flows?</p>
                  <div>
                    <Radio.Group
                      options={[
                        {
                          label: "Yes",
                          value: true,
                        },
                        {
                          label: "No",
                          value: false,
                        },
                      ]}
                      onChange={(e) =>
                        handleStages(
                          "Have you already mapped your waste flows?",
                          e.target.value
                        )
                      }
                      optionType="button"
                    />
                  </div>
                  {checklist.hasOwnProperty(
                    "Have you already mapped your waste flows?"
                  ) && (
                    <div className="answers" style={{ marginTop: 10 }}>
                      {checklist[
                        "Have you already mapped your waste flows?"
                      ] ? (
                        <p>
                          The GPML Data Catalog allows GPML partners to list a
                          wide range of potentially relevant datasets to list
                          data on your country’s waste flows click here (
                          https://unepazecosysadlsstorage.z20.web.core.windows.net/add-data).{" "}
                        </p>
                      ) : (
                        <p>
                          The GPML Digital platform provides data models to help
                          support decision makers. Models that could be used to
                          map waste flows include add Link to access university
                          of Leeds data
                          (https://digital-gpmarinelitter.hub.arcgis.com/maps/0e3d5a7a75d2460a965321fca04d96dd/about)
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </>
            ),
          },
          {
            title: "Map material flows",
            content: (checklist, handleStages) => (
              <>
                Understanding how plastic moves through the economy from
                manufacture and import to the consumer can help identify
                opportunities to reduce waste generation and prioritize
                interventions.
                <br />
                <br />
                <div>
                  <p>Have you already mapped your material flows?</p>
                  <div>
                    <Radio.Group
                      options={[
                        {
                          label: "Yes",
                          value: true,
                        },
                        {
                          label: "No",
                          value: false,
                        },
                      ]}
                      onChange={(e) =>
                        handleStages(
                          "Have you already mapped your material flows?",
                          e.target.value
                        )
                      }
                      optionType="button"
                    />
                  </div>
                  {checklist.hasOwnProperty(
                    "Have you already mapped your material flows?"
                  ) && (
                    <div className="answers" style={{ marginTop: 10 }}>
                      {checklist[
                        "Have you already mapped your material flows?"
                      ] ? (
                        <p>
                          The GPML Data Catalog allows GPML partners to list a
                          wide range of potentially relevant datasets to list
                          data on your country’s material flows click here (
                          https://unepazecosysadlsstorage.z20.web.core.windows.net/add-data).{" "}
                        </p>
                      ) : (
                        <p>
                          The GPML Digital platform provides data models to help
                          support decision makers. Models that could be used to
                          map material flows include add Link to Plastex data
                          (link to be made available once the data is uploaded
                          in the data hub)
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </>
            ),
          },
          {
            title: "Identify gaps in information and knowledge",
            content: (checklist) => (
              <>
                By analysing the available data and gaining an understanding of
                known sources, pathways and sinks of plastics, priority actions
                can be developed, including actions needed to close the
                knowledge gaps. These information can inform your action plan.
                The GPML Digital platform provides a wide range of materials to
                support stakeholders’ needs, ranging from scientific research to
                technological innovation and public outreach information.
                <br />
                Browse through the{" "}
                <Link to="/knowledge/library">resource library</Link> and{" "}
                <Link to="https://unepazecosysadlsstorage.z20.web.core.windows.net/">
                  data catalog
                </Link>{" "}
                of the platform to view existing resources and datasets in your
                country.
                <br />
                <div className="buttons">
                  <h5>which tool to use?</h5>
                  <div className="button-wrapper">
                    <Link to="/knowledge/library">
                      <div className="icon">
                        <AtlasSvg />
                      </div>
                      <div className="button-content">
                        <p className="content-title">Knowledge library</p>
                        <p className="content-desc">
                          Resources on marine litter and plastic pollution
                        </p>
                      </div>
                    </Link>
                    <Link to="/flexible-forms">
                      <div className="icon">
                        <CapacityBuildingSvg />
                      </div>
                      <div className="button-content">
                        <p className="content-title">data catalog</p>
                        <p className="content-desc">
                          Datasets on plastic pollution and marine litter
                        </p>
                      </div>
                    </Link>
                  </div>
                </div>
              </>
            ),
          },
          {
            title: "Set baselines, where possible",
            content: (checklist) => (
              <>
                Where sufficient information is available, quantitative
                baselines can be set against with targets can be agreed and
                tracked. By collating relevant information in a national source
                inventory on a regular basis, this information can be used to
                track trends over time. The National Source Inventories (NSI)
                approach is a framework for national-level coordination around
                statistics on plastic production, import, and lifecycle; waste
                statistics; monitoring of freshwater and wastewater; and
                monitoring of costal and marine waters. To learn more about the
                NSI approach read more here (link to NSI overview document )
                <br />
                <br />
                The GPML data hub consists of National Source Inventories (link
                to the data hub map and layers view) for data documentation and
                exploratory analysis. The inventory of the proposed indicators
                used in the GPML is available for download here (link to the
                inventory of indicators currently being developed by DHI).
              </>
            ),
          },
          { title: "Expected outputs", content: (checklist) => <></> },
        ],
      },
      {
        title: "Legal assessment to position the action plan",
        children: [
          {
            title: "Map legislative landscape",
            content: (checklist) => (
              <>
                An action plan does not operate in isolation, but is nested
                within an existing legal and policy framework. These frameworks
                differ in each country. Gathering all relevant legislation and
                policies at the national and sub-national levels can provide
                insights on the interaction between the different instruments
                and where integration and cooperation may be needed.
                <br />
                <br />
                The GPML Digital platform provides a wide range of policies.
                Browse through the different policies available for your country{" "}
                <Link to="/knowledge/library?topic=policy">here</Link>
                <br />
                <div className="buttons">
                  <h5>which tool to use?</h5>
                  <div className="button-wrapper">
                    <Link to="/knowledge/library?topic=policy">
                      <div className="icon">
                        <AtlasSvg />
                      </div>
                      <div className="button-content">
                        <p className="content-title">Knowledge library</p>
                        <p className="content-desc">
                          Resources on marine litter and plastic pollution
                        </p>
                      </div>
                    </Link>
                  </div>
                </div>
              </>
            ),
          },
          {
            title:
              "Identify suitable legislation (if any) under which the action plan can be developed",
            content: (checklist) => (
              <>
                An action plan could fall under an Environment Act or a Waste
                Management Act, for example. The GPML Digital platform provides
                a wide range of policies.
                <br />
                <br />
                Browse through the different policies available for your country{" "}
                <Link to="/knowledge/library?topic=policy">here</Link>
                <br />
                <div className="buttons">
                  <h5>which tool to use?</h5>
                  <div className="button-wrapper">
                    <Link to="/knowledge/library?topic=policy">
                      <div className="icon">
                        <AtlasSvg />
                      </div>
                      <div className="button-content">
                        <p className="content-title">Knowledge library</p>
                        <p className="content-desc">
                          Resources on marine litter and plastic pollution
                        </p>
                      </div>
                    </Link>
                  </div>
                </div>
              </>
            ),
          },
          {
            title:
              "Identify any specific environmental, social, or economic goals the action plan can deliver on as per existing legislations/policies?",
            content: (checklist) => (
              <>
                An action plan can deliver on more than plastic pollution. It
                can aim to provide numerous co-benefits to society and the
                environment. There are also potential negative impacts to some
                sectors and members of the community. An understanding of how
                policy interventions can positively or negatively affect
                industry and society is important and requires thorough
                stakeholder engagement.
                <br />
                The National Source Inventories (NSI) approach is a framework
                for national-level coordination around statistics on plastic
                production, import, and lifecycle; waste statistics; monitoring
                of freshwater and wastewater; and monitoring of costal and
                marine waters. To learn more about the NSI approach read more
                here (link to NSI overview document)
                <br />
                <br />
                <Link to="/knowledge/library?topic=policy">
                  The GPML data hub consists of National Source Inventories
                </Link>{" "}
                for data documentation and exploratory analysis. The inventory
                of the proposed indicators used in the GPML is available for
                download <Link to="/knowledge/library?topic=policy">here</Link>.
              </>
            ),
          },
          { title: "Expected outputs", content: (checklist) => <></> },
        ],
      },
      {
        title: "Stakeholder mapping and engagement",
        children: [
          {
            title: "Map actors and stakeholders",
            content: (checklist) => (
              <>
                Actors are those who can help make the changes we need.
                Stakeholders are anyone with an interest or who may be affected
                positively or negatively by the measures implemented through the
                action plan. Understanding who the actors and stakeholders are
                is key to the success and ownership of the action plan.
                <br />
                <br />
                The GPML digital platform provides a database of experts and
                other stakeholders, to access this network click{" "}
                <Link to="/connect/community">here</Link>
                <br />
                <div className="buttons">
                  <h5>which tool to use?</h5>
                  <div className="button-wrapper">
                    <Link to="/connect/community">
                      <div className="icon">
                        <AtlasSvg />
                      </div>
                      <div className="button-content">
                        <p className="content-title">Community</p>
                        <p className="content-desc">
                          Resources on marine litter and plastic pollution
                        </p>
                      </div>
                    </Link>
                  </div>
                </div>
              </>
            ),
          },
          {
            title: "Conduct workshops, Interviews: Governments",
            content: (checklist) => (
              <>
                There are many ways to engage actors and stakeholders. This may
                depend on their circumstances, such as ability to travel and
                access to technology. It is important to ensure all key actors
                and stakeholders have access to the information presented and
                the ability to comment and provide input. The GPML Platform
                supports the creation of dedicated forum channels for discussing
                marine litter, plastic pollution and lifecycle management
                amongst stakeholders. To request a dedicated forum for your
                workshop reach out to{" "}
                <Link
                  to="#"
                  onClick={(e) => {
                    window.location.href = "mailto:unep-gpmarinelitter@un.org";
                    e.preventDefault();
                  }}
                >
                  unep-gpmarinelitter@un.org
                </Link>
              </>
            ),
          },
          {
            title: "Conduct workshops, Interviews: Private Sector (for-profit)",
            content: (checklist) => (
              <>
                There are many ways to engage actors and stakeholders. This may
                depend on their circumstances, such as ability to travel and
                access to technology. It is important to ensure all key actors
                and stakeholders have access to the information presented and
                the ability to comment and provide input. The GPML Platform
                supports the creation of dedicated forum channels for discussing
                marine litter, plastic pollution and lifecycle management
                amongst stakeholders. To request a dedicated forum for your
                workshop reach out to{" "}
                <Link
                  to="#"
                  onClick={(e) => {
                    window.location.href = "mailto:unep-gpmarinelitter@un.org";
                    e.preventDefault();
                  }}
                >
                  unep-gpmarinelitter@un.org
                </Link>
              </>
            ),
          },
          {
            title:
              "Conduct workshops, Interviews: Civil Society (not-for-profit)",
            content: (checklist) => (
              <>
                There are many ways to engage actors and stakeholders. This may
                depend on their circumstances, such as ability to travel and
                access to technology. It is important to ensure all key actors
                and stakeholders have access to the information presented and
                the ability to comment and provide input. The GPML Platform
                supports the creation of dedicated forum channels for discussing
                marine litter, plastic pollution and lifecycle management
                amongst stakeholders. To request a dedicated forum for your
                workshop reach out to{" "}
                <Link
                  to="#"
                  onClick={(e) => {
                    window.location.href = "mailto:unep-gpmarinelitter@un.org";
                    e.preventDefault();
                  }}
                >
                  unep-gpmarinelitter@un.org
                </Link>
              </>
            ),
          },
          {
            title:
              "Conduct workshops, Interviews: Intergovernmental Organizations (IGOs)",
            content: (checklist) => (
              <>
                There are many ways to engage actors and stakeholders. This may
                depend on their circumstances, such as ability to travel and
                access to technology. It is important to ensure all key actors
                and stakeholders have access to the information presented and
                the ability to comment and provide input. The GPML Platform
                supports the creation of dedicated forum channels for discussing
                marine litter, plastic pollution and lifecycle management
                amongst stakeholders. To request a dedicated forum for your
                workshop reach out to{" "}
                <Link
                  to="#"
                  onClick={(e) => {
                    window.location.href = "mailto:unep-gpmarinelitter@un.org";
                    e.preventDefault();
                  }}
                >
                  unep-gpmarinelitter@un.org
                </Link>
              </>
            ),
          },
          { title: "Expected outputs", content: (checklist) => <></> },
        ],
      },
      {
        title: "Selection of Implementation actionS",
        children: [
          {
            title:
              "Stakeholder consultation on the gaps and priority actions for the NAP",
            content: (checklist) => (
              <>
                There are many ways to engage actors and stakeholders. This may
                depend on their circumstances, such as ability to travel and
                access to technology. It is important to ensure all key actors
                and stakeholders have access to the information presented and
                the ability to comment and provide input. The GPML Platform
                supports the creation of dedicated forum channels for discussing
                marine litter, plastic pollution and lifecycle management
                amongst stakeholders. To request a dedicated forum for your
                workshop reach out to{" "}
                <Link
                  to="#"
                  onClick={(e) => {
                    window.location.href = "mailto:unep-gpmarinelitter@un.org";
                    e.preventDefault();
                  }}
                >
                  unep-gpmarinelitter@un.org
                </Link>
              </>
            ),
          },
          {
            title: "Agree control measures for Land-based sources",
            content: (checklist) => <></>,
          },
          {
            title: "Agree control measures for Sea-based sources",
            content: (checklist) => <></>,
          },
          {
            title: "Agree measures for Removal",
            content: (checklist) => <></>,
          },
          {
            title: "Agree measures for Awareness and Education",
            content: (checklist) => <></>,
          },
          { title: "Expected outputs", content: (checklist) => <></> },
        ],
      },
      {
        title: "Design a national monitoring programme",
        children: [
          {
            title:
              "Draft model of monitoring programme based on situation analysis in Action 1",
            content: (checklist) => (
              <>
                The Digital Platform allows for access to a wide range of
                knowledge products including guidelines and reports on
                monitoring. <Link to="/">GESAMP report</Link>.
              </>
            ),
          },
          {
            title: "Conduct monitoring and hotspot pilots",
            content: (checklist) => (
              <>
                The Digital Platform allows for access to a wide range of
                knowledge products including guidelines and reports on hotspots{" "}
                <Link to="/">UNEP hotspots report</Link>.
              </>
            ),
          },
          {
            title: "Agree ongoing monitoring programme, actors and funding",
            content: (checklist) => <></>,
          },
          { title: "Expected outputs", content: (checklist) => <></> },
        ],
      },
      {
        title: "Plan for regular reporting",
        children: [
          {
            title: "Consultation on reporting elements",
            content: (checklist) => (
              <>
                The GPML Platform supports the creation of dedicated forum
                channels for discussing marine litter, plastic pollution and
                lifecycle management amongst stakeholders. To request a
                dedicated forum for your workshop reach out to{" "}
                <Link
                  to="#"
                  onClick={(e) => {
                    window.location.href = "mailto:unep-gpmarinelitter@un.org";
                    e.preventDefault();
                  }}
                >
                  unep-gpmarinelitter@un.org
                </Link>
              </>
            ),
          },
          {
            title: "Agree on Indicators/measures of success",
            content: (checklist) => (
              <>
                The National Source Inventories (NSI) approach is a framework
                for national-level coordination around statistics on plastic
                production, import, and lifecycle; waste statistics; monitoring
                of freshwater and wastewater; and monitoring of costal and
                marine waters. To learn more about the NSI approach read more{" "}
                <Link to="/">here</Link>
                <br />
                <br />
                The GPML data hub consists of National Source Inventories (link
                to the data hub map and layers view) for data documentation and
                exploratory analysis. The inventory of the proposed indicators
                used in the GPML is available for download{" "}
                <Link to="/">here</Link>
              </>
            ),
          },
          {
            title: "Agree reporting elements and timeframe",
            content: (checklist) => <></>,
          },
          {
            title: "Design report template",
            content: (checklist) => (
              <>
                The National Source Inventories (NSI) approach is a framework
                for national-level coordination around statistics on plastic
                production, import, and lifecycle; waste statistics; monitoring
                of freshwater and wastewater; and monitoring of costal and
                marine waters. To learn more about the NSI approach read more{" "}
                <Link to="/">here</Link>
                <br />
                <br />
                The GPML data hub consists of National Source Inventories (link
                to the data hub map and layers view) for data documentation and
                exploratory analysis. The inventory of the proposed indicators
                used in the GPML is available for download here (link to the
                inventory of indicators currently being developed by DHI).
              </>
            ),
          },
          { title: "Expected outputs", content: (checklist) => <></> },
        ],
      },
      {
        title: "Adoption of the action plan",
        children: [
          {
            title: "Draft action plan for comment",
            content: (checklist) => <></>,
          },
          {
            title: "Include comments in second draft of action plan",
            content: (checklist) => <></>,
          },
          {
            title: "Conduct final consultation of action plan",
            content: (checklist) => (
              <>
                The GPML Platform supports the creation of dedicated forum
                channels for discussing marine litter, plastic pollution and
                lifecycle management amongst stakeholders. To request a
                dedicated forum for your stakeholder consultations reach out to{" "}
                <Link
                  to="#"
                  onClick={(e) => {
                    window.location.href = "mailto:unep-gpmarinelitter@un.org";
                    e.preventDefault();
                  }}
                >
                  unep-gpmarinelitter@un.org
                </Link>
              </>
            ),
          },
          {
            title: "Develop roadmap for implementation of the action plan",
            content: (checklist) => <></>,
          },
          {
            title: "Action plan and roadmap adopted by government",
            content: (checklist) => (
              <>
                The GPML Digital Platform promotes all stakeholders to
                contribute additional resources to its knowledge library.
                <br />
                <br />
                <Link to="/knowledge/library?topic=policy">Click here</Link> to
                add you action plan to the knowledge library
                <br />
                <div className="buttons">
                  <h5>which tool to use?</h5>
                  <div className="button-wrapper">
                    <Link to="/flexible-forms">
                      <div className="icon">
                        <CapacityBuildingSvg />
                      </div>
                      <div className="button-content">
                        <p className="content-title">Learning center</p>
                        <p className="content-desc">
                          Learning and capacity building resources
                        </p>
                      </div>
                    </Link>
                  </div>
                </div>
              </>
            ),
          },
          { title: "Expected outputs", content: (checklist) => <></> },
        ],
      },
    ],
  },
  {
    key: "S2",
    title: "Implement",
    children: [
      {
        title: "Implementation",
        children: [
          {
            title: "Allocate funding",
            content: (checklist) => <></>,
          },
          {
            title:
              "Engage relevant government agencies and actors for each action",
            content: (checklist) => (
              <>
                The GPML Platform supports the creation of dedicated forum
                channels for discussing marine litter, plastic pollution and
                lifecycle management amongst stakeholders. To request a
                dedicated forum for your stakeholder consultations reach out to{" "}
                <Link
                  to="#"
                  onClick={(e) => {
                    window.location.href = "mailto:unep-gpmarinelitter@un.org";
                    e.preventDefault();
                  }}
                >
                  unep-gpmarinelitter@un.org
                </Link>
              </>
            ),
          },
          {
            title: "Conduct monitoring and hot spotting surveys",
            content: (checklist) => (
              <>
                The Digital Platform allows for access to a wide range of
                knowledge products including guidelines and reports on
                monitoring and hotspots.
              </>
            ),
          },
          { title: "Expected outputs", content: (checklist) => <></> },
        ],
      },
    ],
  },
  {
    key: "S3",
    title: "Report",
    children: [
      {
        title: "Mid-term/periodic report",
        children: [
          {
            title: "Collect progress updates from relevant stakeholders",
            content: (checklist) => (
              <>
                The GPML Digital Platform promotes all stakeholders to
                contribute additional data to its data catalog. Click here (
                https://unepazecosysadlsstorage.z20.web.core.windows.net/add-data)
                to add you action plan data.
              </>
            ),
          },
          {
            title: "Collect metrics as per monitoring programme",
            content: (checklist) => (
              <>
                The GPML Digital Platform promotes all stakeholders to
                contribute additional data to its data catalog. Click here (
                https://unepazecosysadlsstorage.z20.web.core.windows.net/add-data)
                to add you action plan data.
              </>
            ),
          },
          {
            title: "Analyse metrics against indicators where applicable",
            content: (checklist) => (
              <>
                From the list of proposed indicators, select widgets that best
                align with your goals, for comparison with existing global data
                in the GPML National Source Inventories. If not already added we
                encourage you to add your action plan data to the GPML digital
                platform data catalog(
                https://unepazecosysadlsstorage.z20.web.core.windows.net/add-data).
              </>
            ),
          },
          {
            title: "Draft report",
            content: (checklist) => (
              <>
                From the list of proposed indicators, select widgets that best
                align with your goals, for comparison with existing global data
                in the GPML National Source Inventories. If not already added we
                encourage you to add your action plan data to the GPML digital
                platform data catalog(
                https://unepazecosysadlsstorage.z20.web.core.windows.net/add-data).
              </>
            ),
          },
          {
            title: "Review progress and identify successes and shortfalls",
            content: (checklist) => (
              <>
                From the list of proposed indicators, select widgets that best
                align with your goals, for comparison with existing global data
                in the GPML National Source Inventories. If not already added we
                encourage you to add your action plan data to the GPML digital
                platform data catalog(
                https://unepazecosysadlsstorage.z20.web.core.windows.net/add-data).
              </>
            ),
          },
          { title: "Expected outputs", content: (checklist) => <></> },
        ],
      },
    ],
  },
  {
    key: "S4",
    title: "Update",
    children: [
      {
        title: "Review",
        children: [
          {
            title: "Stakeholder engagement in review of effectiveness",
            content: (checklist) => <></>,
          },
          {
            title:
              "Map actions and results to actions and indicators of action plan",
            content: (checklist) => (
              <>
                From the list of proposed indicators, select widgets that best
                align with your goals, for comparison with existing global data
                in the GPML National Source Inventories. If not already added we
                encourage you to add your action plan data to the GPML digital
                platform data catalog(
                https://unepazecosysadlsstorage.z20.web.core.windows.net/add-data).
              </>
            ),
          },
          {
            title: "Review of the action plan itself",
            content: (checklist) => <></>,
          },
          { title: "Expected outputs", content: (checklist) => <></> },
        ],
      },
      {
        title: "Update action plan",
        children: [
          {
            title: "Stakeholder engagement",
            content: (checklist) => (
              <>
                {" "}
                The GPML Platform supports the creation of dedicated forum
                channels for discussing marine litter, plastic pollution and
                lifecycle management amongst stakeholders. To request a
                dedicated forum for your stakeholder consultations reach out to{" "}
                <Link
                  to="#"
                  onClick={(e) => {
                    window.location.href = "mailto:unep-gpmarinelitter@un.org";
                    e.preventDefault();
                  }}
                >
                  unep-gpmarinelitter@un.org
                </Link>
              </>
            ),
          },
          {
            title: "Draft updated action plan",
            content: (checklist) => <></>,
          },
          {
            title: "Review of updated action plan",
            content: (checklist) => <></>,
          },
          {
            title: "Develop implementation roadmap for updated action plan",
            content: (checklist) => (
              <>
                The GPML Digital Platform encourages all stakeholders to keep
                their resources up to date. Click here to add your updated
                action plan.
              </>
            ),
          },
          { title: "Expected outputs", content: (checklist) => <></> },
        ],
      },
    ],
  },
];

const renderSubStages = (title, data, checklist, handleStages) => {
  const childs = data?.map((childItem, index) => (
    <Panel
      header={
        <>
          <h2>{childItem.title}</h2>
        </>
      }
      key={index + childItem.title}
    >
      <div className="sub-stages">
        <Collapse
          accordion
          expandIconPosition="end"
          expandIcon={({ isActive }) => (
            <UpCircleOutlined rotate={isActive ? 180 : 0} />
          )}
          className="sub-child"
        >
          {childItem?.children?.map((subChild, index) => {
            return (
              <Panel
                header={
                  <>
                    {subChild.title !== "Expected outputs" ? (
                      <Checkbox
                        disabled
                        checked={checklist[title]?.[subChild.title]}
                      >
                        {subChild.title}
                      </Checkbox>
                    ) : (
                      <> {subChild.title}</>
                    )}
                  </>
                }
                key={index + subChild.title}
                className={`${
                  subChild.title === "Expected outputs" ? "expected-output" : ""
                }`}
              >
                <div className="sub-stages">
                  {subChild.title !== "Expected outputs" ? (
                    <div className="content">
                      <h5>Task description</h5>
                      <p>{subChild?.content(checklist, handleStages)}</p>
                      <Button
                        type="ghost"
                        icon={
                          checklist[title]?.[subChild.title] ? (
                            <CloseOutlined />
                          ) : (
                            <CheckOutlined />
                          )
                        }
                        onClick={() =>
                          handleStages(
                            title,
                            subChild.title,
                            !checklist[title]?.[subChild.title]
                          )
                        }
                      >
                        {checklist[title]?.[subChild.title]
                          ? `Mark as Incomplete`
                          : `Mark as Completed`}
                      </Button>
                    </div>
                  ) : (
                    <div className="content">
                      <h5>
                        The expected output for this action plan stage is:
                      </h5>
                      <Button type="ghost" icon={<SendOutlined />}>
                        SHARE YOUR REPORT
                      </Button>
                    </div>
                  )}
                </div>
              </Panel>
            );
          })}
        </Collapse>
      </div>
    </Panel>
  ));
  return [childs];
};

const ProjectView = ({ match: { params }, profile, ...props }) => {
  const [projectDetail, setProjectDetail] = useState({});
  const [checklist, setChecklist] = useState({});

  useEffect(() => {
    if (params?.id && profile && profile.reviewStatus === "APPROVED") {
      api
        .get(`/project/${params?.id}`)
        .then((resp) => {
          setProjectDetail(resp?.data.project);
        })
        .catch((e) => console.log(e));
    }
  }, [profile]);

  const handleStages = (title, name, value) => {
    setChecklist({
      ...checklist,
      [title]: { ...checklist[title], [name]: value },
    });
  };
  console.log(checklist)

  return (
    <div id="project">
      <div className="project-container">
        <div className="project-header">
          <div className="title-container">
            <p>Action plan</p>
            <h1>{projectDetail.title}</h1>
          </div>
          <div className="actions-container">
            <div className="status-wrapper">
              <p>Status</p>
              <h2>{projectDetail.stage}</h2>
            </div>
          </div>
        </div>
        <div className="project-body">
          <div className="project-stages">
            <h2>Action plan stages</h2>
            <Collapse
              accordion
              expandIconPosition="end"
              expandIcon={({ isActive }) => (
                <UpCircleOutlined rotate={isActive ? 180 : 0} />
              )}
              className="parent"
            >
              {stagesChecklist.map((item, index) => {
                const completedStages = Object.keys(
                  checklist.hasOwnProperty(item.title) &&
                    checklist?.[item.title]
                ).filter((k) => checklist?.[item.title][k] === true).length;
                const totalStages = item.children
                  .map((child) => child.children)
                  .flat()
                  .filter((output) => output.title !== "Expected outputs")
                  .length;
                const isCompleted = completedStages === totalStages || index < stages.indexOf(projectDetail.stage)
                
                return (
                  <Panel
                    className={classNames({ completed: isCompleted })}
                    header={
                      <>
                        <div className="steps-item-icon">
                          <span class="ant-steps-icon">{index + 1}</span>
                          <h2>{item.title}</h2>
                        </div>
                        <div
                          className={`task-completed ${
                            isCompleted ? "done" : ""
                          }`}
                        >
                          {isCompleted && (
                            <CheckCircleOutlined />
                          )}
                          <div>
                            <span>Tasks completed</span>
                            <strong>
                              {
                                Object.keys(
                                  checklist.hasOwnProperty(item.title) &&
                                    checklist?.[item.title]
                                ).filter(
                                  (k) => checklist?.[item.title][k] === true
                                ).length
                              }{" "}
                              of {totalStages}
                            </strong>
                          </div>
                        </div>
                      </>
                    }
                    key={item.key}
                  >
                    <div className="sub-stages">
                      <Collapse
                        accordion
                        expandIconPosition="end"
                        expandIcon={({ isActive }) => (
                          <UpCircleOutlined rotate={isActive ? 180 : 0} />
                        )}
                        className="child"
                        defaultActiveKey={['1']}
                      >
                        {renderSubStages(
                          item.title,
                          item?.children,
                          checklist,
                          handleStages
                        )}
                      </Collapse>
                    </div>
                  </Panel>
                );
              })}
            </Collapse>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectView;
