import React, { useEffect, useState } from "react";
import "./project-stages.scss";
import api from "../../utils/api";

const ProjectStages = ({ match: { params }, ...props }) => {
  console.log(params);
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
      <div className="project-container"></div>
    </div>
  );
};

export default ProjectStages;
