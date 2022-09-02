import React, { useEffect, useState } from "react";
import "./styles.scss";
import { Collapse, Checkbox, Button } from "antd";
import api from "../../utils/api";
import { CheckOutlined, UpCircleOutlined } from "@ant-design/icons";
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
          { title: "Map available research and knowledge", content: (
            <>
              The GPML Digital platform provides a wide range of materials to support stakeholders’ needs, ranging from scientific research to technological innovation and public outreach information.<br />
              Browse through the <Link to="/knowledge/library">resource library</Link> to see what is available for your country and other regions of the platform to view existing resources. You can also <Link to="/flexible-forms">upload new resources</Link> if you have resources that are not yet available on the Digital Platform.
              <br />
              <div className="buttons">
                <h5>which tool to use?</h5>
                //buttons go here
              </div>
            </>
          ) },
          {
            title: "Scientific analysis of information on sources, pathways and sinks ",
            content: "The GPML Digital platform provides a wide range of materials to support stakeholders’ needs, ranging from scientific research to technological innovation and public outreach information. Browse through the resource  on information on sources pathways and sinks here( link to filtered  knowledge library )"
          },
          { title: "Map waste flows", content: (
            <>
              Understanding how plastic moves from the consumer through the waste management system and the fraction of plastic contained in different waste streams can help identify leakage points and prioritize interventions.
              <br /><br />Have you already mapped your waste flows?
            </>
          ) },
          { title: "Map material flows" },
          { title: "Identify gaps in information and knowledge" },
          { title: "Set baselines, where possible" },
          { title: "Expected outputs" },
        ],
      },
      { title: "Legal assessment to position the action plan" },
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

const ProjectView = ({ match: { params }, ...props }) => {
  const [projectDetail, setProjectDetail] = useState({});

  useEffect(() => {
    if (params?.id) {
      api
        .get(`/project/${params?.id}`)
        .then((resp) => {
          setProjectDetail(resp?.data.project);
        })
        .catch((e) => console.log(e));
    }
  }, [params]);

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
                      {item?.children?.map((childItem, index) => (
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
                                      <Checkbox>{childItem.title}</Checkbox>
                                    </>
                                  }
                                  key={index + childItem.title}
                                >
                                  <div className="sub-stages">
                                    <div className="content">
                                      <h5>Task description</h5>
                                      <p>
                                      {childItem.content}
                                      </p>
                                      <Button type="ghost" icon={<CheckOutlined />}>Mark as Completed</Button>
                                    </div>
                                  </div>
                                </Panel>
                              ))}
                            </Collapse>
                          </div>
                        </Panel>
                      ))}
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
