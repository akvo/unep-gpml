import React from 'react'
import { Button } from "antd";
import './styles.scss'
import { ReactComponent as Down } from "../../images/down.svg";
import { ReactComponent as PlasticLitter } from "../../images/plastic-litter.svg";
import MenuBar from './menu-bar';
import Footer from '../../footer';
import { useEffect } from 'react';
import { useRef } from 'react';
import {Swiper, SwiperSlide} from 'swiper/react';
import { FreeMode } from "swiper";

const Landing = (props) => {
  return (
    <div id="landingb">
      <MenuBar {...props} />
      <div className="hero">
        <div className="litter">
          <PlasticLitter />
        </div>
        <div className="content">
          <h1>The Digital Platform on Plastic Pollution & Marine Litter</h1>
          <h4>Informing and connecting all actors working to prevent plastic pollution and marine litter across the lifecycle and from source to sea.</h4>
          <Button type="primary" size='large'>Join Now</Button>
        </div>
        <div className="next-btn" onClick={(e, v) => { window.scrollTo({ top: window.innerHeight - 80, behavior: 'smooth' }) }}>
          <Down />
        </div>
      </div>
      <div className="workspace">
        <img src="/person-workspace.svg" />
        <h3>All the tools you need to act, in one place.</h3>
        <Button type='primary' size='large'>Create your workspace</Button>
      </div>
      <TheJourney />
      <div className="connect">
        <h2>Connect with the network</h2>
        <Swiper
          spaceBetween={40}
          slidesPerView="auto"
          slidesPerGroup={4}
        >
          <SwiperSlide className='card casestudy'>
              <div className="label">featured case study</div>
              <img src="/featured-case-study.jpg" />
              <h4>Costa Rica: Becoming The First Country To Eliminate Single-Use Plastics</h4>
              <p>
                <b>Challenge & Solution</b><br />
                Plastic pollution poses a threat both to humans and the environment of Costa Rica. Several industries, including fisheries and tourism, are threatened by improper disposal of plastics. The problem was exacerbated when China closed its borders to plastic waste imports, resulting in a quick build-up of plastic waste. This crisis catalyzed Costa Rica to launch an initiative to eliminate single-use plastics in most municipalities and businesses by 2021.<br /><br />This encompasses regulations targeting Extended Producer Responsibility (EPR), requiring “waste producers” to develop, implement, and follow waste management and collection programs. The regulation of single-use plastics covers restrictions for plastic bags, straws, polystyrene containers and single-use plastic water bottles. In addition, a directive was passed to implement information campaigns and label single-use plastics based on a newly adopted classification tool, distinguishing between “Renewable, Compostable, and Compostable” and other types.
              </p>
          </SwiperSlide>
          <SwiperSlide className="card spotlight">
              <div className="label">member spotlight</div>
              <img src="/spotlight.jpg" />
              <p>
                <i>DECEMBER 2020</i><br />
                <b>IMPROVING WASTEWATER MANAGEMENT IN SOMALIA</b><br />
                In October, Somali Greenpeace Association (SOGPA) in collaboration with its partners, held a Wastewater Management training in Baidoa, Somalia. The aim was to build awareness on the importance of proper wastewater management in helping to keep our waterways and oceans clean.
30 young people and local leaders took part, learning about the hazards wastewater can cause if not managed properly. An advocacy message was delivered to government leaders, pushing for increased action on the issue. Local authorities have since requested more training for members of society on the problems and solutions regarding wastewater management.
SOGPA's Vice-chairperson, Hassan Mowlid Yasin, says, "The youth have to be empowered to address environmental issues that affect them.
              </p>
          </SwiperSlide>
        </Swiper>
      </div>
      <div className="partners">
        <h3>Our partners</h3>
        <div className="img-container">
          <img src="/partners.png" />
        </div>
      </div>
      <Stats />
      <Footer />
    </div>
  )
}

const TheJourney = () => {
  const topRef = useRef()
  const svgRef = useRef()
  useEffect(() => {
    const views = [
      { scale: 0.76, x: -320, y: -78 },
      { scale: 1.4, x: -1050, y: -700},
      { scale: 1.73, x: -740, y: -260},
      { scale: 1.56, x: -907, y: -777},
      { scale: 2.08, x: -3292, y: -1031},
      { scale: 1.6, x: -2300, y: -850}
    ]
    const scrollListener = () => {
      const { scrollY } = window
      if(scrollY > topRef.current.offsetTop - 80){
        const y = scrollY - topRef.current.offsetTop + 130
        const page = y / window.innerHeight

        const base = Math.floor(page)
        const view = {}
        if(base > 4) return
        view.scale = views[base].scale + (views[base + 1].scale - views[base].scale) * (page - base)
        view.x = views[base].x + (views[base + 1].x - views[base].x) * (page - base)
        view.y = views[base].y + (views[base + 1].y - views[base].y) * (page - base)
        position(view)
      }
    }
    const position = ({ scale, x, y }) => {
      svgRef.current.style.transform = `translate(${x}px, ${y}px) scale(${scale})`
    }
    position(views[0])
    document.addEventListener('scroll', scrollListener)
    return () => {
      document.removeEventListener('scroll', scrollListener)
    }
  }, [])
  return (
    <div className="journey" ref={topRef}>
        <img ref={svgRef} src="/plastic-journey.svg" />
        <div className="contents">
          <div className="screen-view">
            <h1>THE PLASTICS JOURNEY</h1>
          </div>
          <div className="screen-view">
            <div className="pane">
              <h3>FROM SOURCE TO SEA ACCROSS THE PLASTICS LIFECYCLE</h3>
              <p>Plastics can have environmental, economic and social impacts and are leaked into the environment across the plastics life cycle and from source to sea. Once the plastics are in the environment, they can be transported through various pathways.</p>
              <Button type="ghost" size="large">Learn More</Button>
            </div>
          </div>
          <div className="screen-view">
            <div className="pane">
              <h3>PLASTIC POLLUTION PATHWAYS</h3>
              <h4>Airborne</h4>
              <p>Plastic particles such as vehicle tyres and synthetic textiles accumulate in the atmosphere, where they can be transported over long distances. Rain, snow and wind can deposit plastics in different places. Microplastics are found in snow, ice and sea-ice, from the poles to remote mountain tops.
              </p>
              <h4>rivers</h4>
              <p>Waste can be transported by rivers through the environment including into lakes and oceans.</p>
            </div>
          </div>
          <div className="screen-view">
            <div className="pane">
              <h4>Agriculture</h4>
              <p>Use of plastic films, irrigation tubes and fibre textiles in farming practices. Sewage sludge with plastic residue used as fertilizer. Irrigation with plastic contaminated water. The use of polymer coatings on fertilizers, pesticides, and seeds.</p>
              <h4>Cities and Waste Management</h4>
              <p>Use of consumer goods and products such as clothes, building materials and take-away food containers and lack of or inadequate waste management of materials and products.</p>
              <h4>Industry</h4>
              <p>Use and leakage of products, particles, and fibres during industrial activities as well as transportation of consumer and industrial goods</p>
            </div>
          </div>
          <div className="screen-view">
            <div className="pane">
              <h3>PLASTIC POLLUTION SOURCES, PATHWAYS AND SINKS INCLUDE</h3>
              <h4>Wastewater including sewage – source and pathway</h4>
              <p>Capture of pollutants including microplastics by wastewater treatment systems prevents releases to the environment via outfalls; however, many are still lost and leaked into the environment.</p>
              <h4>Lakes and reservoirs – source and sink</h4>
              <p>A source under specific weather patterns and hydrodynamic regimes such as winds and water currents as well as due to anthropogenic activities such as tourism and industrial lake activities including aquaculture. Lakes can also be sinks meaning areas of temporary and long-term storage of pollution, and possible infiltration into groundwater.</p>
               {/* <h4>Reservoirs – sources and sinks</h4>
               <p>Plastics from atmospheric fallout, streams,
and rivers. Temporary and long-term storage,
and possible infiltration into groundwater.</p> */}
            </div>
          </div>
          <div className="screen-view">
            <div className="pane">
              <h4>Tourism</h4>
              <p>Intentional or accidental littering in the environment due to tourism such as terrestrial, including mountain, coastal and sea-based tourism.</p>
                <h4>Fishing Activities and Aquaculture</h4>
                <p>Waste thrown overboard, abandoned, lost, or otherwise discarded fishing gear and aquaculture equipment, and marine coatings.</p>
                <h4>Shipping and Recreational activities</h4>
                <p>Waste thrown overboard, loss of shipped goods such as industrial and consumer products and materials, and marine coatings.</p>
            </div>
          </div>
        </div>
      </div>
  )
}

const Stats = () => {
  return (
    <div className="stats">
      <div className="row">
        <div className="stat">
          <b>42</b>
          <i>Governments</i>
        </div>
        <div className="stat">
          <b>498</b>
          <i>Organisations</i>
        </div>
        <div className="stat">
          <b>571</b>
          <i>Individuals</i>
        </div>
        <div className="stat">
          <b>6</b>
          <i>Communities of Practise</i>
        </div>
      </div>
      <div className="row">
        <div className="stat">
          <b>5</b>
          <i>Centers of Excellence</i>
        </div>
        <div className="stat">
          <b>16</b>
          <i>Sectors</i>
        </div>
        <div className="stat">
          <b>5</b>
          <i>Regions</i>
        </div>
      </div>
    </div>
  )
}

export default Landing
