import { useState } from "react";
import { CloseOutlined, PlusOutlined } from "@ant-design/icons";
import { Button } from "antd";
// import Swiper from 'swiper'
import { Swiper, SwiperSlide, useSwiper } from "swiper/react";
import { Pagination, Navigation } from "swiper";
import styles from "./get-started.module.scss";
import { useRef } from "react";
import CreateProjectModal from "../workspace/create-project-modal";
import Link from "next/link";

const quiz = [
  {
    q: "Have you already created your action plan?",
    a: ["No", "Yes"],
  },
  {
    q: "What is the focus area of your action plan?",
    a: [
      "Plastics",
      "Circular Economy",
      "Waste",
      "Marine Litter",
      "Sector Specific",
    ],
  },
  {
    q:
      "Have you collected data on the sources and sinks of plastics in the environment?",
    a: [
      "No",
      "Hotspots only",
      "Beach clean data only",
      "Multiple environmental compartments (land, freshwater, coastal, marine)",
      "Waste and material flows",
      "Sufficient data to set baselines for primary sources and sinks",
    ],
  },
  {
    q:
      "Have you assessed the legal and policy landscape in which the action plan will operate?",
    a: ["No", "Yes", "Amendments to legislation are required"],
  },
  {
    q: "Have you mapped all relevant stakeholders?",
    a: [
      "No",
      "Relevant government agencies",
      "Relevant private sector actors ",
      "Relevant Civil Society (not-for-profit)actors",
      "Relevant Intergovernmental Organizations (IGOs) actors",
    ],
  },
  {
    q: "Have you engaged all relevant stakeholders?",
    a: [
      "No",
      "Relevant government agencies",
      "Relevant private sector actors ",
      "Relevant Civil Society (not-for-profit)actors",
      "Relevant Intergovernmental Organizations (IGOs) actors",
    ],
  },
  {
    q: "Have you considered gender Aspects and or vulnerable communities?",
    a: ["Yes", "No"],
  },
  {
    q:
      "Have you consulted with stakeholders and agreed your priority actions to be included in the action plan?",
    a: [
      "No",
      "Yes, all stakeholders consulted but priority actions not yet finalised",
      "Yes, all stakeholders consulted and priority actions finalised",
    ],
  },
  {
    q: "Have you developed a national monitoring programme?",
    a: ["No", "In Progress", "Adopted and funding allocated"],
  },
  {
    q: "Have you developed a reporting structure for the action plan?",
    a: ["No", "In progress", "Yes"],
  },
  {
    q: "Has your government adopted the action plan?",
    a: ["Not started", "In progress", "Yes"],
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
let answers = {};

const GetStarted = () => {
  const swiperRef = useRef();
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [stage, setStage] = useState("create");
  const [stageContent, setStageContent] = useState(
    "This the first phase of the action plan workflow and is completed when first developing an action plan. When revising and existing action plan, numerous elements of this phase will also apply. The create phase includes the development of national source inventories to collate information, a legal review of the regulatory and policy environment, stakeholder engagement in agreeing the measures to be included in the action plan, socio-economic studies to understand the impacts of measures, identifying budget requirements and sources of funding, and completing the process of adoption."
  );

  const handleClick = (index) => () => {
    const { realIndex } = swiperRef.current;
    answers[`${realIndex + 1}. ${quiz[realIndex].q}`] =
      quiz[realIndex].a[index];
    swiperRef.current.allowSlideNext = true;
    let slideTo = realIndex + 1;
    if (realIndex === 0 && index === 1) {
      slideTo = 11;
      setStage("implement");
      setStageContent(
        "This is the second phase of the action plan workflow and includes the activities to be achieved towards the goals and targets of the action plan. Sustainable sources of financing are important to ensure effective implementation, monitoring and enforcement. An implementation plan is often developed to guide short-, medium- and long-term activities."
      );
    } else if (realIndex === 11 && index === 0) {
      slideTo = quiz.length;
    } else if (realIndex === 12 && index === 0) {
      slideTo = quiz.length;
      setStage("report");
      setStageContent(
        "This is the third phase of the action plan workflow and can be conducted mid-term, at the end of term of the action plan, or as specified in the action plan. Reporting against agreed indicators, as set out in the action plan, allows for the tracking of progress towards the goals and targets of the action plan as per the specified timeframes."
      );
    } else if (realIndex === 13) {
      setStage("update");
      setStageContent(
        "This is the fourth and final phase of the action plan workflow. A review of the effectiveness of actions and the continued applicability of measures adopted in the action plan can be conducted mid-term and/or at the end of term of the action plan. An action plan is considered a ‘living document’ and revision of the action plan take place at the end of term to maintain currency of measures for national circumstances, as well as emerging science and deeper understanding of the issues and solutions."
      );
    }
    swiperRef.current.slideTo(slideTo);
    swiperRef.current.allowSlideNext = false;
  };
  return (
    <div className={styles.getStarted}>
      <header>
        <h4>Start Your Action Plan</h4>
        <Link href="/workspace" legacyBehavior>
          <a>
            <Button type="link" icon={<CloseOutlined />}>
              Cancel
            </Button>
          </a>
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
            <SwiperSlide key={index}>
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
              <div className="stage-content">
                <p>{stageContent}</p>
              </div>
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
        {...{
          showCreateProjectModal,
          setShowCreateProjectModal,
          stage,
          answers,
        }}
      />
    </div>
  );
};

export default GetStarted;
