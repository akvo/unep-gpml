import React, { useEffect, useState } from "react";
import styles from "./styles.module.scss";
import { Collapse, Checkbox, Button, Radio } from "antd";
import api from "../../utils/api";
import {
  CheckOutlined,
  UpCircleOutlined,
  CloseOutlined,
  SendOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import AtlasSvg from "../../images/book-atlas.svg";
import AnalyticAndStatisticSvg from "../../images/analytic-and-statistic-icon.svg";
import DataCatalogueSvg from "../../images/data-catalogue-icon.svg";
import CaseStudiesSvg from "../../images/capacity-building/ic-case-studies.svg";
import CapacityBuildingSvg from "../../images/capacity-building/ic-capacity-building.svg";
import IconForum from "../../images/events/forum-icon.svg";
import { stages } from "./get-started";
import classNames from "classnames";
import Link from "next/link";
import { useRouter } from "next/router";

const { Panel } = Collapse;

const ignoreChecklistCount = [
  "Have you already mapped your waste flows?",
  "Have you already mapped your material flows?",
];

export const stagesChecklist = [
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
                The Digital Platform offers a single point of open access for
                data and information to support stakeholders’ needs, ranging
                from interdisciplinary scientific research to informed
                decision-making. The platform compiles and crowdsources
                different resources, integrates data and connects stakeholders
                to guide action around this pressing global issue.
                <br />
                Browse through the{" "}
                <Link to="/knowledge/library">resource library</Link> to see
                what is available for your country and other regions. You can
                also upload new resources if you have resources that are not yet
                available on the Digital Platform through the{" "}
                <Link to="/flexible-forms">add content form</Link>.
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
                          Learning and capacity development resources
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
              "Scientific analysis of information on sources, pathways and sinks",
            content: (checklist) => (
              <>
                The Digital Platform offers a single point of open access for
                data and information to support stakeholders’ needs.
                <br />
                Browse through the{" "}
                <Link to="/knowledge/library">resource library</Link> to access
                resources on sources pathways and sinks.
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
                  </div>
                </div>
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
                          "Create",
                          "Have you already mapped your waste flows?",
                          e.target.value
                        )
                      }
                      optionType="button"
                    />
                  </div>
                  {checklist["Create"]?.hasOwnProperty(
                    "Have you already mapped your waste flows?"
                  ) && (
                    <div className="answers" style={{ marginTop: 10 }}>
                      {checklist["Create"][
                        "Have you already mapped your waste flows?"
                      ] ? (
                        <p>
                          The GPML{" "}
                          <a
                            href="https://unepazecosysadlsstorage.z20.web.core.windows.net/"
                            target="_blank"
                          >
                            Data catalogue
                          </a>{" "}
                          allows GPML partners to list a wide range of
                          potentially relevant datasets to list data on your
                          country’s waste flows{" "}
                          <a
                            href="https://unepazecosysadlsstorage.z20.web.core.windows.net/add-data"
                            target="_blank"
                          >
                            click here
                          </a>
                          .{" "}
                        </p>
                      ) : (
                        <p>
                          The GPML Digital platform provides data to support
                          decision makers. To view the different data layers
                          available,{" "}
                          <a
                            href="https://digital-gpmarinelitter.hub.arcgis.com/maps/0e3d5a7a75d2460a965321fca04d96dd/about"
                            target="_blank"
                          >
                            click here
                          </a>
                        </p>
                      )}
                    </div>
                  )}
                  <div className="buttons">
                    <h5>which tool to use?</h5>
                    <div className="button-wrapper">
                      <Link to="https://datahub.gpmarinelitter.org/">
                        <div className="icon">
                          <AnalyticAndStatisticSvg />
                        </div>
                        <div className="button-content">
                          <p className="content-title">
                            Analytics and Statistics
                          </p>
                          <p className="content-desc">
                            Metrics to measure progress
                          </p>
                        </div>
                      </Link>
                      <Link to="https://unepazecosysadlsstorage.z20.web.core.windows.net/">
                        <div className="icon">
                          <DataCatalogueSvg />
                        </div>
                        <div className="button-content">
                          <p className="content-title">Data Catalogue</p>
                          <p className="content-desc">
                            Datasets on plastic pollution and marine litter
                          </p>
                        </div>
                      </Link>
                    </div>
                  </div>
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
                          "Create",
                          "Have you already mapped your material flows?",
                          e.target.value
                        )
                      }
                      optionType="button"
                    />
                  </div>
                  {checklist["Create"]?.hasOwnProperty(
                    "Have you already mapped your material flows?"
                  ) && (
                    <div className="answers" style={{ marginTop: 10 }}>
                      {checklist["Create"][
                        "Have you already mapped your material flows?"
                      ] ? (
                        <p>
                          The GPML{" "}
                          <a
                            href="https://unepazecosysadlsstorage.z20.web.core.windows.net/"
                            target="_blank"
                          >
                            Data catalogue
                          </a>{" "}
                          allows GPML partners to list a wide range of
                          potentially relevant datasets to list data on your
                          country’s material flows{" "}
                          <a
                            href="https://unepazecosysadlsstorage.z20.web.core.windows.net/add-data"
                            target="_blank"
                          >
                            click here
                          </a>
                          .
                        </p>
                      ) : (
                        <p>
                          The GPML Digital platform provides data to support
                          decision makers. Models that could be used to map
                          material flows are available,{" "}
                          <a
                            href="https://datahub.gpmarinelitter.org/"
                            target="_blank"
                          >
                            here
                          </a>
                        </p>
                      )}
                    </div>
                  )}
                  <div className="buttons">
                    <h5>which tool to use?</h5>
                    <div className="button-wrapper">
                      <Link to="https://datahub.gpmarinelitter.org/">
                        <div className="icon">
                          <AnalyticAndStatisticSvg />
                        </div>
                        <div className="button-content">
                          <p className="content-title">
                            Analytics and Statistics
                          </p>
                          <p className="content-desc">
                            Metrics to measure progress
                          </p>
                        </div>
                      </Link>
                      <Link to="https://unepazecosysadlsstorage.z20.web.core.windows.net/">
                        <div className="icon">
                          <DataCatalogueSvg />
                        </div>
                        <div className="button-content">
                          <p className="content-title">Data Catalogue</p>
                          <p className="content-desc">
                            Datasets on plastic pollution and marine litter
                          </p>
                        </div>
                      </Link>
                    </div>
                  </div>
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
                knowledge gaps. This information can inform your action plan.
                <br />
                The GPML Digital platform compiles and crowdsources different
                resources, integrates data and connects stakeholders to guide
                action around this pressing global issue.
                <br />
                Browse through the{" "}
                <Link to="/knowledge/library">knowledge library</Link> and{" "}
                <Link to="https://datahub.gpmarinelitter.org/">Data Hub</Link>{" "}
                to see what is available for your country and other regions
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
                    <Link to="https://datahub.gpmarinelitter.org/">
                      <div className="icon">
                        <AnalyticAndStatisticSvg />
                      </div>
                      <div className="button-content">
                        <p className="content-title">
                          Analytics and Statistics
                        </p>
                        <p className="content-desc">
                          Metrics to measure progress
                        </p>
                      </div>
                    </Link>
                    <Link to="https://unepazecosysadlsstorage.z20.web.core.windows.net/">
                      <div className="icon">
                        <DataCatalogueSvg />
                      </div>
                      <div className="button-content">
                        <p className="content-title">Data Catalogue</p>
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
                track trends over time.
                <br />
                <br />
                The National Source Inventories (NSI) approach is a framework
                for national-level coordination around statistics on plastic
                production, import, and lifecycle; waste statistics; monitoring
                of freshwater and wastewater; and monitoring of costal and
                marine waters.
                <br />
                <br />
                The GPML{" "}
                <Link to="https://datahub.gpmarinelitter.org/">
                  Data Hub
                </Link>{" "}
                consists of National Source Inventories for data documentation
                and exploratory analysis. The inventory of the proposed
                indicators used in the GPML is available for download in the{" "}
                <a
                  href="https://unepazecosysadlsstorage.z20.web.core.windows.net/"
                  target="_blank"
                >
                  Data catalogue
                </a>{" "}
                <div className="buttons">
                  <h5>which tool to use?</h5>
                  <div className="button-wrapper">
                    <Link to="https://datahub.gpmarinelitter.org/">
                      <div className="icon">
                        <AnalyticAndStatisticSvg />
                      </div>
                      <div className="button-content">
                        <p className="content-title">
                          Analytics and Statistics
                        </p>
                        <p className="content-desc">
                          Metrics to measure progress
                        </p>
                      </div>
                    </Link>
                    <Link to="https://unepazecosysadlsstorage.z20.web.core.windows.net/">
                      <div className="icon">
                        <DataCatalogueSvg />
                      </div>
                      <div className="button-content">
                        <p className="content-title">Data Catalogue</p>
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
            title: "Expected outputs",
            content: (checklist) => (
              <>
                <b>Report:</b> Situation analysis of plastic flows and emissions
              </>
            ),
          },
        ],
      },
      {
        title: "Legal assessment to position the action plan",
        children: [
          {
            title: "Map legislative landscape",
            content: (checklist) => (
              <>
                An action plan does not operate in isolation but is nested
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
                sectors and members of the community.
                <br />
                <br />
                An understanding of how policy interventions can positively or
                negatively affect industry and society is important and requires
                thorough stakeholder engagement. The National Source Inventories
                (NSI) approach is a framework for national-level coordination
                around statistics on plastic production, import, and lifecycle;
                waste statistics; monitoring of freshwater and wastewater; and
                monitoring of costal and marine waters.
                <br />
                <br />
                The GPML{" "}
                <Link to="https://datahub.gpmarinelitter.org">
                  Data Hub
                </Link>{" "}
                consists of National Source Inventories for data documentation
                and exploratory analysis. The inventory of the proposed
                indicators used in the GPML is available for download{" "}
                <a
                  href="https://unepazecosysadlsstorage.z20.web.core.windows.net/"
                  target="_blank"
                >
                  Data catalogue
                </a>{" "}
                <div className="buttons">
                  <h5>which tool to use?</h5>
                  <div className="button-wrapper">
                    <Link to="https://datahub.gpmarinelitter.org/">
                      <div className="icon">
                        <AnalyticAndStatisticSvg />
                      </div>
                      <div className="button-content">
                        <p className="content-title">
                          Analytics and Statistics
                        </p>
                        <p className="content-desc">
                          Metrics to measure progress
                        </p>
                      </div>
                    </Link>
                    <Link to="https://unepazecosysadlsstorage.z20.web.core.windows.net/">
                      <div className="icon">
                        <DataCatalogueSvg />
                      </div>
                      <div className="button-content">
                        <p className="content-title">Data Catalogue</p>
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
            title: "Expected outputs",
            content: (checklist) => (
              <>
                <b>Report:</b> Situation analysis of relevant legal frameworks
                and socio-economic costs and benefits
              </>
            ),
          },
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
                key to the success and ownership of the action plan.
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
                the ability to comment and provide input.
                <br />
                <br />
                The GPML Platform supports the creation of dedicated{" "}
                <a
                  href="https://communities.gpmarinelitter.org/"
                  target="_blank"
                >
                  forum channels
                </a>{" "}
                to facilitate user consultations and discussions on plastic
                pollution, marine litter, and lifecycle management amongst
                stakeholders. To request a dedicated forum for your workshop,
                reach out to{" "}
                <Link
                  to="#"
                  onClick={(e) => {
                    window.location.href = "mailto:unep-gpmarinelitter@un.org";
                    e.preventDefault();
                  }}
                >
                  unep-gpmarinelitter@un.org
                </Link>
                <div className="buttons">
                  <h5>which tool to use?</h5>
                  <div className="button-wrapper">
                    <Link to="https://communities.gpmarinelitter.org/">
                      <div className="icon">
                        <IconForum />
                      </div>
                      <div className="button-content">
                        <p className="content-title">Engage</p>
                        <p className="content-desc">
                          Interactive forum for collaboration
                        </p>
                      </div>
                    </Link>
                  </div>
                </div>
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
                the ability to comment and provide input.
                <br />
                <br />
                The GPML Platform supports the creation of dedicated{" "}
                <a
                  href="https://communities.gpmarinelitter.org/"
                  target="_blank"
                >
                  forum channels
                </a>{" "}
                to facilitate user consultations and discussions on plastic
                pollution, marine litter, and lifecycle management amongst
                stakeholders. To request a dedicated forum for your workshop,
                reach out to{" "}
                <Link
                  to="#"
                  onClick={(e) => {
                    window.location.href = "mailto:unep-gpmarinelitter@un.org";
                    e.preventDefault();
                  }}
                >
                  unep-gpmarinelitter@un.org
                </Link>{" "}
                <div className="buttons">
                  <h5>which tool to use?</h5>
                  <div className="button-wrapper">
                    <Link to="https://communities.gpmarinelitter.org/">
                      <div className="icon">
                        <IconForum />
                      </div>
                      <div className="button-content">
                        <p className="content-title">Engage</p>
                        <p className="content-desc">
                          Interactive forum for collaboration
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
              "Conduct workshops, Interviews: Civil Society (not-for-profit)",
            content: (checklist) => (
              <>
                There are many ways to engage actors and stakeholders. This may
                depend on their circumstances, such as ability to travel and
                access to technology. It is important to ensure all key actors
                and stakeholders have access to the information presented and
                the ability to comment and provide input.
                <br />
                <br />
                The GPML Platform supports the creation of dedicated{" "}
                <a
                  href="https://communities.gpmarinelitter.org/"
                  target="_blank"
                >
                  forum channels
                </a>{" "}
                to facilitate user consultations and discussions on plastic
                pollution, marine litter, and lifecycle management amongst
                stakeholders. To request a dedicated forum for your workshop,
                reach out to{" "}
                <Link
                  to="#"
                  onClick={(e) => {
                    window.location.href = "mailto:unep-gpmarinelitter@un.org";
                    e.preventDefault();
                  }}
                >
                  unep-gpmarinelitter@un.org
                </Link>{" "}
                <div className="buttons">
                  <h5>which tool to use?</h5>
                  <div className="button-wrapper">
                    <Link to="https://communities.gpmarinelitter.org/">
                      <div className="icon">
                        <IconForum />
                      </div>
                      <div className="button-content">
                        <p className="content-title">Engage</p>
                        <p className="content-desc">
                          Interactive forum for collaboration
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
              "Conduct workshops, Interviews: Intergovernmental Organizations (IGOs)",
            content: (checklist) => (
              <>
                There are many ways to engage actors and stakeholders. This may
                depend on their circumstances, such as ability to travel and
                access to technology. It is important to ensure all key actors
                and stakeholders have access to the information presented and
                the ability to comment and provide input.
                <br />
                <br />
                The GPML Platform supports the creation of dedicated{" "}
                <a
                  href="https://communities.gpmarinelitter.org/"
                  target="_blank"
                >
                  forum channels
                </a>{" "}
                to facilitate user consultations and discussions on plastic
                pollution, marine litter, and lifecycle management amongst
                stakeholders. To request a dedicated forum for your workshop,
                reach out to{" "}
                <Link
                  to="#"
                  onClick={(e) => {
                    window.location.href = "mailto:unep-gpmarinelitter@un.org";
                    e.preventDefault();
                  }}
                >
                  unep-gpmarinelitter@un.org
                </Link>{" "}
                <div className="buttons">
                  <h5>which tool to use?</h5>
                  <div className="button-wrapper">
                    <Link to="https://communities.gpmarinelitter.org/">
                      <div className="icon">
                        <IconForum />
                      </div>
                      <div className="button-content">
                        <p className="content-title">Engage</p>
                        <p className="content-desc">
                          Interactive forum for collaboration
                        </p>
                      </div>
                    </Link>
                  </div>
                </div>
              </>
            ),
          },
          {
            title: "Expected outputs",
            content: (checklist) => (
              <>
                <b>Report:</b> Report on actors and findings (needs, barriers,
                opportunities)
              </>
            ),
          },
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
                the ability to comment and provide input.
                <br />
                <br />
                The GPML Platform supports the creation of dedicated{" "}
                <a
                  href="https://communities.gpmarinelitter.org/"
                  target="_blank"
                >
                  forum channels
                </a>{" "}
                to facilitate user consultations and discussions on plastic
                pollution, marine litter, and lifecycle management amongst
                stakeholders. To request a dedicated forum for your workshop,
                reach out to{" "}
                <Link
                  to="#"
                  onClick={(e) => {
                    window.location.href = "mailto:unep-gpmarinelitter@un.org";
                    e.preventDefault();
                  }}
                >
                  unep-gpmarinelitter@un.org
                </Link>{" "}
                <div className="buttons">
                  <h5>which tool to use?</h5>
                  <div className="button-wrapper">
                    <Link to="https://communities.gpmarinelitter.org/">
                      <div className="icon">
                        <IconForum />
                      </div>
                      <div className="button-content">
                        <p className="content-title">Engage</p>
                        <p className="content-desc">
                          Interactive forum for collaboration
                        </p>
                      </div>
                    </Link>
                  </div>
                </div>
              </>
            ),
          },
          {
            title: "Agree control measures for Land-based sources",
            content: (checklist) => (
              <>
                Browse through the action plans in the{" "}
                <Link to="/knowledge/library">Knowledge Library</Link> for
                inspiration on possible control measures for land-based sources.
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
                  </div>
                </div>
              </>
            ),
          },
          {
            title: "Agree control measures for Sea-based sources",
            content: (checklist) => (
              <>
                Browse through the action plans in the{" "}
                <Link to="/knowledge/library">Knowledge Library</Link> for
                inspiration on possible control measures for sea-based sources.
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
                  </div>
                </div>
              </>
            ),
          },
          {
            title: "Agree measures for Removal",
            content: (checklist) => (
              <>
                Browse through the action plans in the{" "}
                <Link to="/knowledge/library">Knowledge Library</Link> for
                inspiration on possible measures for removal.
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
                  </div>
                </div>
              </>
            ),
          },
          {
            title: "Agree measures for Awareness and Education",
            content: (checklist) => (
              <>
                Browse through the action plans in the{" "}
                <Link to="/knowledge/library">Knowledge Library</Link> for
                inspiration on measures for awareness and education.
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
                  </div>
                </div>
              </>
            ),
          },
          {
            title: "Expected outputs",
            content: (checklist) => (
              <>
                Priority action, roles and responsibilities agreed and
                documented
              </>
            ),
          },
        ],
      },
      {
        title: "Design a national monitoring programme",
        children: [
          {
            title:
              "Draft model of monitoring programme based on situation analysis findings",
            content: (checklist) => (
              <>
                The Digital Platform allows for access to a wide range of
                knowledge products including guidelines and reports on
                monitoring. Such reports can be accessed through the{" "}
                <Link to="/knowledge/library">Knowledge Library</Link>.
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
                  </div>
                </div>
              </>
            ),
          },
          {
            title: "Conduct monitoring and hotspot pilots",
            content: (checklist) => (
              <>
                The Digital Platform allows for access to a wide range of
                knowledge products including guidelines and reports on hotspots.
                Such reports can be accessed through the{" "}
                <Link to="/knowledge/library">Knowledge Library</Link>.
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
                  </div>
                </div>
              </>
            ),
          },
          {
            title: "Agree ongoing monitoring programme, actors and funding",
            content: (checklist) => (
              <>
                The Digital Platform{" "}
                <Link to="/knowledge/library">Knowledge Library</Link> allows
                for access to a wide range of knowledge products including
                financing resources and guidelines, and reports on monitoring.{" "}
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
                  </div>
                </div>
              </>
            ),
          },
          {
            title: "Expected outputs",
            content: (checklist) => (
              <>Ongoing national monitoring programme with funding allocated</>
            ),
          },
        ],
      },
      {
        title: "Plan for regular reporting",
        children: [
          {
            title: "Consultation on reporting elements",
            content: (checklist) => (
              <>
                The GPML Platform supports the creation of dedicated{" "}
                <a
                  href="https://communities.gpmarinelitter.org/"
                  target="_blank"
                >
                  forum channels
                </a>{" "}
                for conducting consultations and discussions on plastic
                pollution, marine litter, and lifecycle management amongst
                stakeholders. To request a dedicated forum for your
                consultation, reach out to{" "}
                <Link
                  to="#"
                  onClick={(e) => {
                    window.location.href = "mailto:unep-gpmarinelitter@un.org";
                    e.preventDefault();
                  }}
                >
                  unep-gpmarinelitter@un.org
                </Link>
                <div className="buttons">
                  <h5>which tool to use?</h5>
                  <div className="button-wrapper">
                    <Link to="https://communities.gpmarinelitter.org/">
                      <div className="icon">
                        <IconForum />
                      </div>
                      <div className="button-content">
                        <p className="content-title">Engage</p>
                        <p className="content-desc">
                          Interactive forum for collaboration
                        </p>
                      </div>
                    </Link>
                  </div>
                </div>
              </>
            ),
          },
          {
            title: "Agree on Indicators/measures of success",
            content: (checklist) => (
              <>
                The GPML{" "}
                <Link to="https://datahub.gpmarinelitter.org">Data Hub</Link>{" "}
                consists of National Source Inventories for data documentation
                and exploratory analysis. The inventory of the proposed
                indicators used in the GPML is available for download in the{" "}
                <a
                  href="https://unepazecosysadlsstorage.z20.web.core.windows.net/"
                  target="_blank"
                >
                  Data catalogue
                </a>
                .
                <br />
                <br />
                The National Source Inventories (NSI) approach is a framework
                for national-level coordination around statistics on plastic
                production, import, and lifecycle; waste statistics; monitoring
                of freshwater and wastewater; and monitoring of costal and
                marine waters.
                <div className="buttons">
                  <h5>which tool to use?</h5>
                  <div className="button-wrapper">
                    <Link to="https://datahub.gpmarinelitter.org/">
                      <div className="icon">
                        <AnalyticAndStatisticSvg />
                      </div>
                      <div className="button-content">
                        <p className="content-title">
                          Analytics and Statistics
                        </p>
                        <p className="content-desc">
                          Metrics to measure progress
                        </p>
                      </div>
                    </Link>
                    <Link to="https://unepazecosysadlsstorage.z20.web.core.windows.net/">
                      <div className="icon">
                        <DataCatalogueSvg />
                      </div>
                      <div className="button-content">
                        <p className="content-title">Data Catalogue</p>
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
            title: "Agree reporting elements and timeframe",
            content: (checklist) => (
              <>
                Decide on the scope and time frame for the action plan
                reporting. Browse through the action plans in the{" "}
                <Link to="/knowledge/library">Knowledge Library</Link> for ideas
                on how to structure the reporting elements.
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
                  </div>
                </div>
              </>
            ),
          },
          {
            title: "Design report template",
            content: (checklist) => (
              <>
                The GPML{" "}
                <Link to="https://datahub.gpmarinelitter.org">Data Hub</Link>{" "}
                consists of National Source Inventories for data documentation
                and exploratory analysis. The inventory of the proposed
                indicators used in the GPML is available for download in the{" "}
                <a
                  href="https://unepazecosysadlsstorage.z20.web.core.windows.net/"
                  target="_blank"
                >
                  Data catalogue
                </a>
                .
                <br />
                <br />
                The National Source Inventories (NSI) approach is a framework
                for national-level coordination around statistics on plastic
                production, import, and lifecycle; waste statistics; monitoring
                of freshwater and wastewater; and monitoring of costal and
                marine waters.
                <div className="buttons">
                  <h5>which tool to use?</h5>
                  <div className="button-wrapper">
                    <Link to="https://datahub.gpmarinelitter.org/">
                      <div className="icon">
                        <AnalyticAndStatisticSvg />
                      </div>
                      <div className="button-content">
                        <p className="content-title">
                          Analytics and Statistics
                        </p>
                        <p className="content-desc">
                          Metrics to measure progress
                        </p>
                      </div>
                    </Link>
                    <Link to="https://unepazecosysadlsstorage.z20.web.core.windows.net/">
                      <div className="icon">
                        <DataCatalogueSvg />
                      </div>
                      <div className="button-content">
                        <p className="content-title">Data Catalogue</p>
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
            title: "Expected outputs",
            content: (checklist) => (
              <>Reporting template with roles and responsibilities</>
            ),
          },
        ],
      },
      {
        title: "Adoption of the action plan",
        children: [
          {
            title: "Draft action plan for comment",
            content: (checklist) => (
              <>
                For inspiration on how to structure your action plan, browse
                through the action plans in the{" "}
                <Link to="/knowledge/library">Knowledge Library</Link>.
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
                  </div>
                </div>
              </>
            ),
          },
          {
            title: "Include comments in second draft of action plan",
            content: (checklist) => (
              <>
                Update your action plan document to factor in feedback that you
                have received from different stakeholders.
              </>
            ),
          },
          {
            title: "Conduct final consultation of action plan",
            content: (checklist) => (
              <>
                There are many ways to engage actors and stakeholders. This may
                depend on their circumstances, such as ability to travel and
                access to technology. It is important to ensure all key actors
                and stakeholders have access to the information presented and
                the ability to comment and provide input.
                <br />
                <br />
                The GPML Platform supports the creation of dedicated{" "}
                <a
                  href="https://communities.gpmarinelitter.org/"
                  target="_blank"
                >
                  forum channels
                </a>{" "}
                to facilitate user consultations and discussions on plastic
                pollution, marine litter, and lifecycle management amongst
                stakeholders. To request a dedicated forum for your workshop,
                reach out to{" "}
                <Link
                  to="#"
                  onClick={(e) => {
                    window.location.href = "mailto:unep-gpmarinelitter@un.org";
                    e.preventDefault();
                  }}
                >
                  unep-gpmarinelitter@un.org
                </Link>
                <div className="buttons">
                  <h5>which tool to use?</h5>
                  <div className="button-wrapper">
                    <Link to="https://communities.gpmarinelitter.org/">
                      <div className="icon">
                        <IconForum />
                      </div>
                      <div className="button-content">
                        <p className="content-title">Engage</p>
                        <p className="content-desc">
                          Interactive forum for collaboration
                        </p>
                      </div>
                    </Link>
                  </div>
                </div>
              </>
            ),
          },
          {
            title: "Develop roadmap for implementation of the action plan",
            content: (checklist) => (
              <>
                Create a plan for the implementation of your action plan. For
                inspiration on how to structure your action plan implementation
                roadmap, browse through the action plans in the{" "}
                <Link to="/knowledge/library">Knowledge Library</Link>.{" "}
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
                  </div>
                </div>
              </>
            ),
          },
          {
            title: "Action plan and roadmap adopted by government",
            content: (checklist) => (
              <>
                The GPML Digital Platform promotes all stakeholders to
                contribute additional resources to its knowledge library. Click
                here to add you action plan to the knowledge library.
                <br />
                <br />
                <Link to="/knowledge/library?topic=action-plan">
                  Click here
                </Link>{" "}
                to add you action plan to the knowledge library
                <br />
                <div className="buttons">
                  <h5>which tool to use?</h5>
                  <div className="button-wrapper">
                    <Link to="/knowledge/library?topic=action-plan">
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
            title: "Expected outputs",
            content: (checklist) => (
              <>National Action Plan and Implementation Roadmap</>
            ),
          },
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
            content: (checklist) => (
              <>
                Allocation of funds for the implementation of the action plan.
              </>
            ),
          },
          {
            title:
              "Engage relevant government agencies and actors for each action",
            content: (checklist) => (
              <>
                The GPML Platform supports the creation of dedicated{" "}
                <a
                  href="https://communities.gpmarinelitter.org/"
                  target="_blank"
                >
                  forum channels
                </a>{" "}
                to facilitate user consultations and discussions on plastic
                pollution, marine litter, and lifecycle management amongst
                stakeholders. To request a dedicated forum for your workshop,
                reach out to{" "}
                <Link
                  to="#"
                  onClick={(e) => {
                    window.location.href = "mailto:unep-gpmarinelitter@un.org";
                    e.preventDefault();
                  }}
                >
                  unep-gpmarinelitter@un.org
                </Link>{" "}
                <div className="buttons">
                  <h5>which tool to use?</h5>
                  <div className="button-wrapper">
                    <Link to="https://communities.gpmarinelitter.org/">
                      <div className="icon">
                        <IconForum />
                      </div>
                      <div className="button-content">
                        <p className="content-title">Engage</p>
                        <p className="content-desc">
                          Interactive forum for collaboration
                        </p>
                      </div>
                    </Link>
                  </div>
                </div>
              </>
            ),
          },
          {
            title: "Conduct monitoring and hot spotting surveys",
            content: (checklist) => (
              <>
                The Digital Platform{" "}
                <Link to="/knowledge/library">Knowledge Library</Link> allows
                for access to a wide range of knowledge products including
                guidelines and reports on monitoring and hotspots.{" "}
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
                  </div>
                </div>
              </>
            ),
          },
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
                contribute additional data to its{" "}
                <a
                  href="https://unepazecosysadlsstorage.z20.web.core.windows.net/"
                  target="_blank"
                >
                  Data catalogue
                </a>
                . <Link to="/knowledge/library">Click here</Link> to add you
                action plan data
                <div className="buttons">
                  <h5>which tool to use?</h5>
                  <div className="button-wrapper">
                    <Link to="https://unepazecosysadlsstorage.z20.web.core.windows.net/">
                      <div className="icon">
                        <DataCatalogueSvg />
                      </div>
                      <div className="button-content">
                        <p className="content-title">Data Catalogue</p>
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
            title: "Collect metrics as per monitoring programme",
            content: (checklist) => (
              <>
                The GPML Digital Platform promotes all stakeholders to
                contribute additional data to its{" "}
                <a
                  href="https://unepazecosysadlsstorage.z20.web.core.windows.net/"
                  target="_blank"
                >
                  Data catalogue
                </a>
                . <Link to="/knowledge/library">Click here</Link> to add you
                action plan data
                <div className="buttons">
                  <h5>which tool to use?</h5>
                  <div className="button-wrapper">
                    <Link to="https://unepazecosysadlsstorage.z20.web.core.windows.net/">
                      <div className="icon">
                        <DataCatalogueSvg />
                      </div>
                      <div className="button-content">
                        <p className="content-title">Data Catalogue</p>
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
            title: "Analyse metrics against indicators where applicable",
            content: (checklist) => (
              <>
                The GPML{" "}
                <Link to="https://datahub.gpmarinelitter.org">Data Hub</Link>{" "}
                also consists of National Source Inventories for data
                documentation and exploratory analysis based on a set of
                proposed indicators. The inventory of the proposed indicators
                used in the GPML is available for download in the{" "}
                <a
                  href="https://unepazecosysadlsstorage.z20.web.core.windows.net/"
                  target="_blank"
                >
                  Data catalogue
                </a>
                .
                <br />
                <br />
                If not already added, we encourage you to add your action plan
                data to the GPML digital platform{" "}
                <a
                  href="https://unepazecosysadlsstorage.z20.web.core.windows.net/"
                  target="_blank"
                >
                  Data catalogue.
                </a>
                <div className="buttons">
                  <h5>which tool to use?</h5>
                  <div className="button-wrapper">
                    <Link to="https://datahub.gpmarinelitter.org/">
                      <div className="icon">
                        <AnalyticAndStatisticSvg />
                      </div>
                      <div className="button-content">
                        <p className="content-title">
                          Analytics and Statistics
                        </p>
                        <p className="content-desc">
                          Metrics to measure progress
                        </p>
                      </div>
                    </Link>
                    <Link to="https://unepazecosysadlsstorage.z20.web.core.windows.net/">
                      <div className="icon">
                        <DataCatalogueSvg />
                      </div>
                      <div className="button-content">
                        <p className="content-title">Data Catalogue</p>
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
            title: "Draft report",
            content: (checklist) => (
              <>
                Browse through the action plans in the{" "}
                <Link to="/knowledge/library">Knowledge Library</Link> for ideas
                on how to structure the action plan report.
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
                  </div>
                </div>
              </>
            ),
          },
          {
            title: "Review progress and identify successes and shortfalls",
            content: (checklist) => (
              <>
                Review your action plan implementation process and identify your
                successes and challenges.
              </>
            ),
          },
          {
            title: "Expected outputs",
            content: (checklist) => <>Periodic progress report</>,
          },
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
            content: (checklist) => (
              <>
                The GPML Platform supports the creation of dedicated{" "}
                <a
                  href="https://communities.gpmarinelitter.org/"
                  target="_blank"
                >
                  forum channels
                </a>{" "}
                to facilitate user consultations and discussions on plastic
                pollution, marine litter, and lifecycle management amongst
                stakeholders. To request a dedicated forum for your workshop,
                reach out to{" "}
                <Link
                  to="#"
                  onClick={(e) => {
                    window.location.href = "mailto:unep-gpmarinelitter@un.org";
                    e.preventDefault();
                  }}
                >
                  unep-gpmarinelitter@un.org
                </Link>{" "}
                <div className="buttons">
                  <h5>which tool to use?</h5>
                  <div className="button-wrapper">
                    <Link to="https://communities.gpmarinelitter.org/">
                      <div className="icon">
                        <IconForum />
                      </div>
                      <div className="button-content">
                        <p className="content-title">Engage</p>
                        <p className="content-desc">
                          Interactive forum for collaboration
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
              "Map actions and results to actions and indicators of action plan",
            content: (checklist) => (
              <>
                The GPML{" "}
                <Link to="https://datahub.gpmarinelitter.org">Data Hub</Link>{" "}
                also consists of National Source Inventories for data
                documentation and exploratory analysis based on a set of
                proposed indicators. The inventory of the proposed indicators
                used in the GPML is available for download in the{" "}
                <a
                  href="https://unepazecosysadlsstorage.z20.web.core.windows.net/"
                  target="_blank"
                >
                  Data catalogue
                </a>
                .
                <div className="buttons">
                  <h5>which tool to use?</h5>
                  <div className="button-wrapper">
                    <Link to="https://datahub.gpmarinelitter.org/">
                      <div className="icon">
                        <AnalyticAndStatisticSvg />
                      </div>
                      <div className="button-content">
                        <p className="content-title">
                          Analytics and Statistics
                        </p>
                        <p className="content-desc">
                          Metrics to measure progress
                        </p>
                      </div>
                    </Link>
                    <Link to="https://unepazecosysadlsstorage.z20.web.core.windows.net/">
                      <div className="icon">
                        <DataCatalogueSvg />
                      </div>
                      <div className="button-content">
                        <p className="content-title">Data Catalogue</p>
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
            title: "Review of the action plan itself",
            content: (checklist) => (
              <>
                Review your action plan document and identify gaps or changes
                that need to be made.
              </>
            ),
          },
          {
            title: "Expected outputs",
            content: (checklist) => (
              <>Report identifying opportunities for updating the action plan</>
            ),
          },
        ],
      },
      {
        title: "Update action plan",
        children: [
          {
            title: "Stakeholder engagement",
            content: (checklist) => (
              <>
                Engage your stakeholders on the successes and shortfalls as well
                as the updates to be made to the action plan.
                <br />
                <br />
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
                </Link>{" "}
                <div className="buttons">
                  <h5>which tool to use?</h5>
                  <div className="button-wrapper">
                    <Link to="https://communities.gpmarinelitter.org/">
                      <div className="icon">
                        <IconForum />
                      </div>
                      <div className="button-content">
                        <p className="content-title">Engage</p>
                        <p className="content-desc">
                          Interactive forum for collaboration
                        </p>
                      </div>
                    </Link>
                  </div>
                </div>
              </>
            ),
          },
          {
            title: "Draft updated action plan",
            content: (checklist) => <>Update your action plan document.</>,
          },
          {
            title: "Review of updated action plan",
            content: (checklist) => (
              <>
                Review the updated action plan and update your action plan
                details in the GPML digital platform.
              </>
            ),
          },
          {
            title: "Develop implementation roadmap for updated action plan",
            content: (checklist) => (
              <>
                The GPML Digital Platform encourages all stakeholders to keep
                their resources up to date.
              </>
            ),
          },
          {
            title: "Expected outputs",
            content: (checklist) => (
              <>Updated action plan and implementation roadmap adopted</>
            ),
          },
        ],
      },
    ],
  },
];

const getCheckListObject = (stage) => {
  const getPreviousItems = stagesChecklist
    .slice(
      0,
      stagesChecklist.findIndex((item) => item.title.toLowerCase() === stage)
    )
    .flatMap((a) =>
      a.children.flatMap((b) =>
        b.children.map((e) => ({ label: a.title, ...e }))
      )
    );

  const checklist = getPreviousItems.reduce((object, item) => {
    object[item.label] = object[item.label] || {};
    object[item.label][item.title] = true;
    delete object[item.label]?.["Expected outputs"];
    return object;
  }, {});

  return checklist;
};

const ProjectView = ({ profile, ...props }) => {
  const router = useRouter();
  const { id } = router.query;

  const [projectDetail, setProjectDetail] = useState({});
  const [checklist, setChecklist] = useState({});

  useEffect(() => {
    if (id && profile && profile.reviewStatus === "APPROVED") {
      api
        .getRaw(`/project/${id}`)
        .then((resp) => {
          setProjectDetail(JSON.parse(resp?.data).project);
          setChecklist(
            JSON.parse(resp?.data).project?.checklist
              ? JSON.parse(resp?.data).project?.checklist
              : getCheckListObject(JSON.parse(resp?.data).project.stage)
          );
        })
        .catch((e) => console.log(e));
    }
  }, [profile]);

  const handleStages = (title, name, value) => {
    setChecklist({
      ...checklist,
      [title]: { ...checklist[title], [name]: value },
    });
    const data = {
      ...checklist,
      [title]: { ...checklist[title], [name]: value },
    };
    api
      .putRaw(`/project/${id}`, { checklist: data })
      .then((resp) => {
        console.log(resp);
      })
      .catch((e) => console.log(e));
  };

  return (
    <div className={styles.project}>
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
                  checklist?.hasOwnProperty(item.title) &&
                    checklist?.[item.title]
                )?.filter(
                  (k) =>
                    checklist?.[item.title][k] === true &&
                    !ignoreChecklistCount.includes(k)
                )?.length;
                const totalStages = item.children
                  .map((child) => child.children)
                  .flat()
                  .filter((output) => output.title !== "Expected outputs")
                  .length;
                const isCompleted =
                  completedStages === totalStages ||
                  index < stages.indexOf(projectDetail.stage);

                return (
                  <Panel
                    className={classNames({ completed: isCompleted })}
                    key={index}
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
                          {isCompleted && <CheckCircleOutlined />}
                          <div>
                            <span>Tasks completed</span>
                            <strong>
                              {completedStages} of {totalStages}
                            </strong>
                          </div>
                        </div>
                      </>
                    }
                    key={item.key}
                  >
                    <div className="sub-stages">
                      <Collapse
                        expandIconPosition="end"
                        expandIcon={({ isActive }) => (
                          <UpCircleOutlined rotate={isActive ? 180 : 0} />
                        )}
                        className="child"
                        defaultActiveKey={["0"]}
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

const renderSubStages = (title, data, checklist, handleStages) => {
  const children = data?.map((childItem, index) => (
    <Panel
      header={
        <>
          <h2>{childItem.title}</h2>
        </>
      }
      key={index}
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
                      <p>{subChild?.content(checklist, handleStages)}</p>
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
  return [children];
};

export default ProjectView;
