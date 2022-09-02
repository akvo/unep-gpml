import React, { useEffect, useState } from "react";
import "./styles.scss";
import { Collapse, Checkbox } from "antd";
import api from "../../utils/api";
import { UpCircleOutlined } from "@ant-design/icons";

const { Panel } = Collapse;

const stages = [
  {
    key: "S1",
    title: "Create",
    children: [
      {
        title: "Assessment - situation analysis",
        children: [
          { title: "Gather available research and knowledge" },
          {
            title:
              "Scientific analysis of information on sources, pathways and sinks ",
          },
          { title: "Map waste flows" },
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
                                    <p>test</p>
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
