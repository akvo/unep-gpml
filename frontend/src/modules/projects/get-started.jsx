import { useState } from "react";
import { CloseOutlined, PlusOutlined } from '@ant-design/icons'
import { Button } from 'antd'
// import Swiper from 'swiper'
import { Swiper, SwiperSlide, useSwiper } from 'swiper/react'
import { Pagination } from "swiper";
import './get-started.scss'
import "swiper/swiper.min.css";
import "swiper/modules/pagination/pagination.min.css";
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import CreateProjectModal from "../workspace/create-project-modal";

const quiz = [
  {
    q: 'Have you collected data on the sources and sinks of plastics in the environment?',
    a: [
      'No',
      'Hotspots only',
      'Beach clean data only',
      'Multiple environmental compartments (land, freshwater, coastal, marine)',
      'Waste and material flows',
      'Sufficient data to set baselines for primary sources and sinks'
    ]
  },
  {
    q: '2. Have you assessed the legal and policy landscape in which the action plan will operate?',
    a: [
      'No',
      'Yes',
      'Amendments to legislation are required'
    ]
  },
  {
    q: 'Have you mapped all relevant stakeholders and engaged them?',
    a: [
      'No',
      'Relevant government agencies have been mapped',
      'Relevant private sector actors have been mapped',
      'Relevant NGOs and CBOs have been mapped',
      'Full engagement of all stakeholders'
    ]
  }
]

const GetStarted = () => {
  const swiperRef = useRef();
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  // const swiper = useSwiper()
  const handleClick = (index) => () => {
    // console.log('asdas')
    swiperRef.current.allowSlideNext = true
    swiperRef.current.slideNext()
    swiperRef.current.allowSlideNext = false
    if(index < quiz.length){
    } else {
      
    }
  }
  return (
    <div id="get-started">
      <header>
        <h4>Action Plan assessment</h4>
        <Link to="/workspace">
          <Button type="link" icon={<CloseOutlined />}>Cancel</Button>
        </Link>
      </header>
      <div className="quiz">
        <Swiper
          onSwiper={(swiper) => { swiperRef.current = swiper }}
          pagination={true}
          allowSlideNext={false}
          modules={[Pagination]}
        >
          {quiz.map(it =>
          <SwiperSlide>
            <div className="content">
              <h2>{it.q}</h2>
              <ul>
                {it.a.map((a, i) => <li onClick={handleClick(i)}>{a}</li>)}
              </ul>
            </div>
          </SwiperSlide>
          )}
          <SwiperSlide>
            <div className="content">
              <h2>Your action plan starting point is</h2>
              <h2>IMPLEMENT</h2>
              <Button icon={<PlusOutlined />} type="ghost" size="large" onClick={() => setShowCreateProjectModal(true)}>Create Your Project</Button>
            </div>
          </SwiperSlide>
        </Swiper>
      </div>
      <CreateProjectModal
        {...{ showCreateProjectModal, setShowCreateProjectModal }}
      />
    </div>
  )
}

export default GetStarted