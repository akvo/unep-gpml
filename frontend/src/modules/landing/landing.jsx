import React, { useState } from 'react'
import { Button, Card } from "antd";
import './styles.scss'
import { ReactComponent as Down } from "../../images/down.svg";
import { ReactComponent as PlasticLitter } from "../../images/plastic-litter.svg";
import MenuBar from './menu-bar';
import Footer from '../../footer';
import { useEffect } from 'react';
import { useRef } from 'react';
import {Swiper, SwiperSlide} from 'swiper/react';
import { Pagination, Navigation } from "swiper";
 import { UIStore } from "../../store";
 import { ReactComponent as ActionPlanIcon } from "../../images/actionplan.svg";
 import { ReactComponent as KnowledgeIcon } from "../../images/knowledge.svg";
 import { ReactComponent as DataSetIcon } from "../../images/datasets.svg";
 import user1img from '../../images/our-community/cassia-patel.jpg'
import api from '../../utils/api';
import { Link } from 'react-router-dom';

const Landing = ({ setLoginVisible, history, ...props }) => {
  return (
    <div id="landingb">
      <MenuBar {...props} setLoginVisible={setLoginVisible} />
      <div className="hero">
        <div className="litter">
          <PlasticLitter />
        </div>
        <div className="content">
          <h1>The Digital Platform on Plastic Pollution & Marine Litter</h1>
          <h4>Informing and connecting all actors working to prevent plastic pollution and marine litter across the life cycle and from source to sea.</h4>
          {!props.isAuthenticated && (
            <Button
              type="primary"
              size="large"
              onClick={() => setLoginVisible(true)}
            >
              Join Now
            </Button>
          )}
        </div>
        <div className="next-btn" onClick={(e, v) => { window.scrollTo({ top: window.innerHeight - 80, behavior: 'smooth' }) }}>
          <Down />
        </div>
      </div>
      <div className="workspace">
        <img src="/person-workspace.svg" />
        <h3>All the tools you need to act, in one place.</h3>
        <Button type='primary' size='large' onClick={() => {
          if (!props.isAuthenticated) setLoginVisible(true);
          else history.push("/projects/get-started");
        }}>Create your workspace</Button>
      </div>
      <TheJourney />
      <Connect />
      <Partners />
      <Stats />
      <Act {...{ setLoginVisible }} />
      <AnyQuestions />
      <Footer setShowMenu={props.setShowMenu} />
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
          <div className="mobile-only img">
            <img src="/plastic-journey.svg" />
          </div>
        </div>
        <div className="screen-view">
          <div className="pane">
            <h3>FROM SOURCE TO SEA ACROSS THE PLASTICS life cycle</h3>
            <p>Plastics can have environmental, economic, health and social impacts and are leaked into the environment across the plastics life cycle and from source to sea. Once the plastics are in the environment, they can be transported through various pathways.</p>
            {/* <Button type="ghost" size="large">Learn More</Button> */}
          </div>
          <div className="mobile-only img">
            <img src="/plastic-journey.svg" />
          </div>
        </div>
        <div className="screen-view">
          <div className="pane">
            <h3>PLASTIC POLLUTION PATHWAYS INCLUDE</h3>
            <h4>Airborne</h4>
            <p>Plastic particles such as vehicle tyres and synthetic textiles accumulate in the atmosphere, where they can be transported over long distances. Rain, snow and wind can deposit plastics in different places. Microplastics are found in snow, ice and sea-ice, from the poles to remote mountain tops.
            </p>
            <h4>rivers</h4>
            <p>Waste can be transported by rivers through the environment including into lakes and oceans.</p>
          </div>
          <div className="mobile-only img">
            <img src="/plastic-journey.svg" />
          </div>
        </div>
        <div className="screen-view">
          <div className="pane">
            <h3>PLASTIC POLLUTION SOURCES INCLUDE</h3>
            <h4>Agriculture</h4>
            <p>Use of plastic films, irrigation tubes and fibre textiles in farming practices. Sewage sludge with plastic residue used as fertilizer. Irrigation with plastic contaminated water. The use of polymer coatings on fertilizers, pesticides, and seeds.</p>
            <h4>Cities and Waste Management</h4>
            <p>Use of consumer goods and products such as clothes, building materials and take-away food containers and lack of or inadequate waste management of materials and products.</p>
            <h4>Industry</h4>
            <p>Use and leakage of products, particles, and fibres during industrial activities as well as leakage of consumer and industrial goods during transportation.</p>
          </div>
          <div className="mobile-only img">
            <img src="/plastic-journey.svg" />
          </div>
        </div>
        <div className="screen-view">
          <div className="pane">
            <h3>PLASTIC POLLUTION SOURCES, PATHWAYS AND SINKS INCLUDE</h3>
            <h4>Wastewater including sewage – source and pathway</h4>
            <p>Capture of pollutants including microplastics by wastewater treatment systems prevents releases to the environment via outfalls; however, many are still lost and leaked into the environment.</p>
            <h4>Lakes and reservoirs – source and sink</h4>
            <p>A source under specific weather patterns and hydrodynamic regimes such as winds and water currents as well as due to anthropogenic activities such as tourism and industrial lake activities including aquaculture. Lakes can also be sinks meaning areas of temporary and long-term storage of pollution, and possible infiltration into groundwater.</p>
          </div>
          <div className="mobile-only img">
            <img src="/plastic-journey.svg" />
          </div>
        </div>
        <div className="screen-view">
          <div className="pane">
            <h3>FURTHER PLASTIC POLLUTION SOURCES INCLUDE</h3>
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

const Connect = () => {
  return (
    <div className="connect">
        <h2>Connect with the network</h2>
        <Swiper
          spaceBetween={window.innerWidth <= 1024 ? 20 : 40}
          slidesPerView="auto"
          slidesPerGroup={window.innerWidth <= 1024 ? 1 : 4}
          pagination={{
            clickable: true,
          }}
          navigation={true}
          modules={[Pagination, Navigation]}
        >
          <SwiperSlide className="card nowpap">
            <div className="label">REGIONAL NODE SPOTLIGHT</div>
            <img src="/nowpap.jpg" />
            <h4>A NOWPAP-organised international coastal cleanup campaign in Dalian, China</h4>
            <p>The Northwest Pacific Action Plan <a href='https://www.unep.org/nowpap/' target="_blank">(NOWPAP)</a> was adopted by the People’s Republic of China, Japan, the Republic of Korea, and the Russian Federation in September 1994 as a part of the <a href='http://web.unep.org/regionalseas/' target="_blank">Regional Seas Programme</a> of the UN Environment Programme (UNEP). The overall goal is "the wise use, development and management of the coastal and marine environment so as to obtain the utmost long-term benefits for the human populations of the region, while protecting human health, ecological integrity and the region’s sustainability for future generations".<br /><br />NOWPAP and the Coordinating Body on the Seas of East Asia <a href='https://www.unep.org/cobsea/' target="_blank">(COBSEA)</a> recently co-organised a Technical Session on “Strengthening Regional Cooperation for Global Action on Marine Litter in the East Asian Seas and Northwest Pacific’ at the 7th International Marine Debris Conference. The session explored how existing regional mechanisms can be leveraged to strengthen partnerships and cooperation toward tackling marine litter globally. Representatives of Japan, Republic of Korea, Thailand and Vietnam shared their insights on interagency coordination, monitoring for evidence-based action, and strengthening regional cooperation. Read more <a href='https://www.unep.org/nowpap/news-and-stories/press-release/strengthening-regional-cooperation-global-action-marine-litter' target="_blank">here</a>.</p>
          </SwiperSlide>
          <SwiperSlide className="card casestudy">
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
              In October, Somali Greenpeace Association (SOGPA) in collaboration with its partners, held a Wastewater Management training in Baidoa, Somalia. The aim was to build awareness on the importance of proper wastewater management in helping to keep our waterways and oceans clean. 30 young people and local leaders took part, learning about the hazards wastewater can cause if not managed properly. An advocacy message was delivered to government leaders, pushing for increased action on the issue. Local authorities have since requested more training for members of society on the problems and solutions regarding wastewater management. SOGPA's Vice-chairperson, Hassan Mowlid Yasin, says, "The youth have to be empowered to address environmental issues that affect them.
            </p>
          </SwiperSlide>
          <SwiperSlide className="card testimonial">
            <img src={user1img} />
            <h4>Cassia Patel</h4>
            <h5>Program Director, Oceanic Global</h5>
            <blockquote>This is an unparalleled tool to bring together global actors fighting against our marine plastic crisis.</blockquote>
          </SwiperSlide>
          <SwiperSlide className="card testimonial">
            <img src="https://digital.gpmarinelitter.org/image/profile/27" />
            <h4>Marvin Burman</h4>
            <h5>Assistant Executive Director - Gulf and Caribbean Fisheries Institute</h5>
            <blockquote>This is a fantastic resource for knowledge management, networking, accessing and managing data.</blockquote>
          </SwiperSlide>
          <SwiperSlide className="card testimonial">
            <img src="https://digital.gpmarinelitter.org/image/profile/30" />
            <h4>Fadilah Ali</h4>
            <h5>Assistant Executive Director - Gulf and Caribbean Fisheries Institute</h5>
            <blockquote>The platform makes it easier to discover stakeholders, events and experts in specific regions and fields.</blockquote>
          </SwiperSlide>
        </Swiper>
      </div>
  )
}

const Partners = () => {
  const ref = useRef()
  const imgRef = useRef()
  const scrollHandler = () => {
    const y = window.scrollY + window.innerHeight - ref.current.clientHeight
    let subt = y - ref.current.offsetTop
    const max = window.innerHeight -ref.current.clientHeight - 80
    if(subt < 0) subt = 0
    else if(subt > max) subt = max
    const coef = subt / max
    const imgExx = imgRef.current.clientWidth - window.innerWidth + 100
    imgRef.current.style.transform = `translateX(-${coef * imgExx}px)`
  }
  useEffect(() => {
    document.addEventListener('scroll', scrollHandler)
    return () => {
      document.removeEventListener('scroll', scrollHandler)
    }
  }, [])
  return (
    <div className="partners" ref={ref}>
      <h3>Our partners</h3>
      <div className="img-container">
        <img ref={imgRef} src="/partners.png" />
      </div>
    </div>
  )
}

const Stats = () => {
  const {stakeholders, organisations,nonMemberOrganisations} = UIStore.useState((s) => ({
    stakeholders: s?.stakeholders?.stakeholders,
    organisations: s?.organisations,
    nonMemberOrganisations:s?.nonMemberOrganisations
  }));
  const [governmentsCount, setGovernmentsCount] = useState(0);

  useEffect(()=> {
    api.get(`/community?representativeGroup=Government`).then((resp) => {
      const governments = resp.data.counts.find(count => count?.networkType?.toLowerCase() ==="organisation");
      setGovernmentsCount(governments?.count || 0)
    })
  }, [])

  return (
    <div className="stats">
      <div className="row">
        <div className="stat">
          <b>{governmentsCount}</b>
          <i>Governments</i>
        </div>
        <div className="stat">
          <b>{(organisations?.length + nonMemberOrganisations?.length) - governmentsCount}</b>
          <i>Organisations</i>
        </div>
        <div className="stat">
          <b>{stakeholders?.length}</b>
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

const Act = ({ setLoginVisible }) => {
   const { resources } = UIStore.useState((s) => ({
     resources: s.nav?.resourceCounts,
   }));

   const organisationsCount =
     resources?.find((data) => data?.hasOwnProperty("organisation"))[
       "organisation"
     ] || 0;

   const initialData = [
     {
       title: "Share your data",
       name: "Data layers",
       count: '300+',
       entityCount: '20+',
       icon: <DataSetIcon />,
       background: "#ECF8F6",
     },
   ];

   const [data, setData] = useState(initialData);

   useEffect(() => {
     const actionPlan = resources?.find((data) =>
       data?.hasOwnProperty("actionPlan")
     )["actionPlan"];

     const allResources = resources?.filter(
       (resource) =>
         !resource?.hasOwnProperty("stakeholder") &&
         !resource?.hasOwnProperty("organisation") &&
         !resource?.hasOwnProperty("nonMemberOrganisation")
     );

     const resourcesWithKey = allResources
       ?.map((resource) => {
         return Object.entries(resource)
           ?.filter(([key]) => key !== "countries")
           .flat();
       })
       .flat();

     const resourceCounts = resourcesWithKey
       ?.map((item) => Number(item))
       ?.filter((item) => !isNaN(item));

     const totalResourceCount = resourceCounts?.reduce(
       (acc, val) => acc + val,
       0
     );

     setData([
       {
         title: "Coordinate in a global effort ",
         name: "Action Plans",
         count: actionPlan,
         entityCount: 28,
         icon: <ActionPlanIcon />,
         background: "rgba(165, 176, 201, 0.2)",
       },
       {
         title: "Contribute to the knowledge",
         name: "Resources",
         count: totalResourceCount,
         entityCount: 814,
         icon: <KnowledgeIcon />,
         background: "#F6EFDD",
       },
       ...initialData,
     ]);
   }, [resources]);

   return (
     <div className="act">
       <h3>Act now</h3>
       <div className="act-cards">
         {data.map((item) => (
           <Card className="act-card">
             <div
               className="act-contents"
               style={{ backgroundColor: item?.background }}
             >
               <h4 className="act-title">{item?.title}</h4>
               <div className="act-data-contents">
                 {item?.icon}
                 <div>
                   <span className="count">{item?.count} </span>
                   <span className="name">{item?.name}</span>
                 </div>
               </div>
               <div className="created-by">
                 Created by
                 <br />
                 <div className="entity-creators">
                   {item?.entityCount} entities
                 </div>
               </div>
             </div>
           </Card>
         ))}
       </div>
       <Button type="primary" size="large" onClick={() => setLoginVisible(true)}>
         Join now
       </Button>
     </div>
   );
 };

 const AnyQuestions = () => {
   return (
     <div className="any-questions">
       <div className="image-wrapper">
         <img src="/help-center.svg" alt="help-center-icon" loading="lazy" />
       </div>
       <div className="content-container">
         <h3>Any Questions?</h3>
         <p>Visit the Help Center for FAQs, tutorials and more.</p>
         <Link to="/help-center">
          <Button type="ghost" size="large">
            Find your answers &#62;
          </Button>
         </Link>
       </div>
     </div>
   );
 };

export default Landing
