import { useState } from "react";
import { CloseOutlined, PlusOutlined } from "@ant-design/icons";
import { Button } from "antd";
// import Swiper from 'swiper'
import { Swiper, SwiperSlide, useSwiper } from "swiper/react";
import { Pagination, Navigation } from "swiper";
import "./get-started.scss";
import "swiper/swiper.min.css";
import "swiper/modules/pagination/pagination.min.css";
import { useRef } from "react";
import { Link } from "react-router-dom";
import CreateProjectModal from "../workspace/create-project-modal";

const quiz = [
  {
    q: "Have you already created your action plan?",
    a: ["No", "Yes"]
  },
  {
    q: "What is the focus area of your action plan?",
    a: ["Plastics", "Circular Economy", "Waste", "Marine Litter", "Sector Specific"]
  },
  {
    q: "Have you collected data on the sources and sinks of plastics in the environment?",
    a: [
      "No",
      "Hotspots only",
      "Beach clean data only",
      "Multiple environmental compartments (land, freshwater, coastal, marine)",
      "Waste and material flows",
      "Sufficient data to set baselines for primary sources and sinks"
    ]
  },
  {
    q: "Have you assessed the legal and policy landscape in which the action plan will operate?",
    a: [
      "No",
      "Yes",
      "Amendments to legislation are required"
    ]
  },
  {
    q: "Have you mapped all relevant stakeholders?",
    a: [
      "No",
      "Relevant government agencies",
      "Relevant private sector actors ",
      "Relevant Civil Society (not-for-profit)actors",
      "Relevant Intergovernmental Organizations (IGOs) actors"
    ]
  },
  {
    q: "Have you engaged all relevant stakeholders?",
    a: [
      "No",
      "Relevant government agencies",
      "Relevant private sector actors ",
      "Relevant Civil Society (not-for-profit)actors",
      "Relevant Intergovernmental Organizations (IGOs) actors"
    ]
  },
  {
    q: "Have you considered gender Aspects and or vulnerable communities?",
    a: ["Yes", "No"]
  },
  {
    q: "Have you consulted with stakeholders and agreed your priority actions to be included in the action plan?",
    a: [
      "No",
      "Yes, all stakeholders consulted but priority actions not yet finalised",
      "Yes, all stakeholders consulted and priority actions finalised"
    ]
  },
  {
    q: "Have you developed a national monitoring programme?",
    a: [
      "No",
      "In Progress",
      "Adopted and funding allocated"
    ]
  },
  {
    q: "Have you developed a reporting structure for the action plan?",
    a: [
      "No",
      "In progress",
      "Yes"
    ]
  },
  {
    q: "Has your government adopted the action plan?",
    a: [
      "Not started",
      "In progress",
      "Yes"
    ]
  },
  {
    q: "Have you begun implementation of your action plan?",
    a: ["No", "Yes, partially (some actions)", "Yes, fully (all actions)"],
  },
  {
    q: "Have you  begun reporting  or measuring progress on your action plan?",
    a: [
      "No",
      "In Progress",
      "Yes - first report completed",
      "Yes - second/third/+ report completed",
    ],
  },
  {
    q: "Have you reviewed and updated your action plan?",
    a: [
      "No",
      "Reviewed, but not updated",
      "Reviewed and updated, but not yet adopted",
      "Reviewed, updated and adopted",
    ],
  },
];
export const stages = ["create", "implement", "report", "update"];

const GetStarted = () => {
  const swiperRef = useRef();
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [stage, setStage] = useState("create");
  // const swiper = useSwiper()
  const handleClick = (index) => () => {
    swiperRef.current.allowSlideNext = true;
    const { realIndex } = swiperRef.current
    let slideTo = realIndex + 1
    if(realIndex === 0 && index === 1){
      slideTo = 11
      setStage('implement')
    }
    else if(realIndex === 11 && index === 0){
      slideTo = quiz.length
    }
    else if(realIndex === 12 && index === 0){
      slideTo = quiz.length
      setStage('report')
    }
    else if(realIndex === 13){
      setStage('update')
    }
    swiperRef.current.slideTo(slideTo);
    swiperRef.current.allowSlideNext = false;
  };
  return (
    <div id="get-started">
      <header>
        <h4>Start Your Action Plan</h4>
        <Link to="/workspace">
          <Button type="link" icon={<CloseOutlined />}>
            Cancel
          </Button>
        </Link>
      </header>
      <div className="quiz">
        <Swiper
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          pagination={true}
          navigation={true}
          allowSlideNext={false}
          modules={[Pagination, Navigation]}
        >
          {quiz.map((it, index) => (
            <SwiperSlide>
              <div className="content">
                <h2>{it.q}</h2>
                <ul>
                  {it.a.map((a, i) => (
                    <li onClick={handleClick(i)}>{a}</li>
                  ))}
                </ul>
              </div>
            </SwiperSlide>
          ))}
          <SwiperSlide>
            <div className="content final">
              <h2>Your action plan starting point is</h2>
              <h2 className="stage">{stage}</h2>
              <Button
                icon={<PlusOutlined />}
                type="ghost"
                size="large"
                onClick={() => setShowCreateProjectModal(true)}
              >
                Create Your Project
              </Button>
            </div>
          </SwiperSlide>
        </Swiper>
      </div>
      <CreateProjectModal
        {...{ showCreateProjectModal, setShowCreateProjectModal, stage }}
      />
    </div>
  );
};

export default GetStarted;
