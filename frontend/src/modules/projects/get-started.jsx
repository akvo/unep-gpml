import { useState } from "react";
import { CloseOutlined, PlusOutlined } from '@ant-design/icons'
import { Button } from 'antd'
// import Swiper from 'swiper'
import { Swiper, SwiperSlide, useSwiper } from 'swiper/react'
import { Pagination, Navigation } from "swiper";
import './get-started.scss'
import "swiper/swiper.min.css";
import "swiper/modules/pagination/pagination.min.css";
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import CreateProjectModal from "../workspace/create-project-modal";

const quiz = [
  {
    q: 'Have you begun implementation of your action plan?',
    a: [
      'No',
      'Yes, partially (some actions)',
      'Yes, fully (all actions)',
    ]
  },
  {
    q: 'Have you  begun reporting  or measuring progress on your action plan?',
    a: [
      'No',
      'In Progress',
      'Yes - first report completed',
      'Yes - second/third/+ report completed'
    ]
  },
  {
    q: 'Have you reviewed and updated your action plan?',
    a: [
      'No',
      'Reviewed, but not updated',
      'Reviewed and updated, but not yet adopted',
      'Reviewed, updated and adopted',
    ]
  }
]
const stages = ['create', 'implement', 'report', 'update']

const GetStarted = () => {
  const swiperRef = useRef();
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [stage, setStage] = useState('create')
  // const swiper = useSwiper()
  const handleClick = (index) => () => {
    // console.log('asdas')
    swiperRef.current.allowSlideNext = true
    if(index === 0){
      setStage(stages[swiperRef.current.realIndex])
      swiperRef.current.slideTo(quiz.length)
    } else {
      swiperRef.current.slideNext()
    }
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
          navigation={true}
          allowSlideNext={false}
          modules={[Pagination, Navigation]}
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
            <div className="content final">
              <h2>Your action plan starting point is</h2>
              <h2 className="stage">{stage}</h2>
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