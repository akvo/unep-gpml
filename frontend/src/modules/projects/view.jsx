import React, { useEffect, useState } from "react";
import "./styles.scss";
import { Collapse, Checkbox, Button, Radio } from "antd";
import api from "../../utils/api";
import {
  CheckOutlined,
  UpCircleOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { ReactComponent as AtlasSvg } from "../../images/book-atlas.svg";
import { ReactComponent as CaseStudiesSvg } from "../../images/capacity-building/ic-case-studies.svg";
import { ReactComponent as CapacityBuildingSvg } from "../../images/capacity-building/ic-capacity-building.svg";
import { Link } from "react-router-dom";

const { Panel } = Collapse;

const stages = [
  {
    key: "S1",
    title: "Create",
    children: [
      {
        title: "Assessment - situation analysis",
        children: [
          {
            title: "Map available research and knowledge",
            content: (
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
            content:
              "The GPML Digital platform provides a wide range of materials to support stakeholders’ needs, ranging from scientific research to technological innovation and public outreach information. Browse through the resource  on information on sources pathways and sinks here( link to filtered  knowledge library )",
          },
          {
            title: "Map waste flows",
            content: (
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
                      optionType="button"
                    />
                  </div>
                </div>
              </>
            ),
          },
          {
            title: "Map material flows",
            content: (
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
                      optionType="button"
                    />
                  </div>
                </div>
              </>
            ),
          },
          {
            title: "Identify gaps in information and knowledge",
            content: (
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
            content: (
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
          { title: "Expected outputs" },
        ],
      },
      {
        title: "Legal assessment to position the action plan",
        children: [
          {
            title: "Map legislative landscape",
            content: (
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
            content: (
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
            content: (
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
        ],
      },
      { title: "Stakeholder mapping and engagement" },
      { title: "Selection of Implementation actionS" },
      { title: "Monitoring programme" },
      { title: "report planning" },
      { title: "Adoption of the action plan" },
    ],
  },
  {
    key: "S2",
    title: "Implement",
  },
  {
    key: "S3",
    title: "Report",
  },
  {
    key: "S4",
    title: "Update",
  },
];

const renderSubStages = (data, checklist, handleStages) => {
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
          {childItem?.children?.map((childItem, index) => (
            <Panel
              header={
                <>
                  <Checkbox disabled checked={checklist[childItem.title]}>
                    {childItem.title}
                  </Checkbox>
                </>
              }
              key={index + childItem.title}
            >
              <div className="sub-stages">
                <div className="content">
                  <h5>Task description</h5>
                  <p>{childItem.content}</p>
                  <Button
                    type="ghost"
                    icon={
                      checklist[childItem.title] ? (
                        <CloseOutlined />
                      ) : (
                        <CheckOutlined />
                      )
                    }
                    onClick={() =>
                      handleStages(childItem.title, !checklist[childItem.title])
                    }
                  >
                    {checklist[childItem.title]
                      ? `Mark as Incomplete`
                      : `Mark as Completed`}
                  </Button>
                </div>
              </div>
            </Panel>
          ))}
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
    if (params?.id && profile) {
      api
        .get(`/project/${params?.id}`)
        .then((resp) => {
          setProjectDetail(resp?.data.project);
        })
        .catch((e) => console.log(e));
    }
  }, [params, profile]);

  const handleStages = (name, value) => {
    setChecklist({
      ...checklist,
      [name]: value,
    });
  };

  console.log(checklist, "checklist");

  return (
    <div id="project">
      <div className="project-container">
        <Header title={projectDetail.title} />
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
              {stages.map((item, index) => (
                <Panel
                  header={
                    <>
                      <div className="steps-item-icon">
                        <span class="ant-steps-icon">{index + 1}</span>
                        <h2>{item.title}</h2>
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
                    >
                      {renderSubStages(item?.children, checklist, handleStages)}
                    </Collapse>
                  </div>
                </Panel>
              ))}
            </Collapse>
          </div>
        </div>
      </div>
    </div>
  );
};

const Header = ({ title }) => {
  return (
    <div className="project-header">
      <div className="title-container">
        <p>Action plan</p>
        <h1>{title}</h1>
      </div>
      <div className="actions-container">
        <div className="status-wrapper">
          <p>Action plan status</p>
          <h2>IMPLEMENT</h2>
        </div>
      </div>
    </div>
  );
};

export default ProjectView;
