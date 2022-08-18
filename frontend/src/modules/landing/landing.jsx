import React from 'react'
import { Button } from "antd";
import './styles.scss'
import { ReactComponent as Down } from "../../images/down.svg";
import { ReactComponent as PlasticLitter } from "../../images/plastic-litter.svg";
import MenuBar from './menu-bar';
import Footer from '../../footer';
import { useEffect } from 'react';
import { useRef } from 'react';

const Landing = (props) => {
  return (
    <div id="landing">
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
      { scale: 1.56, x: -1067, y: -777},
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
            <h1>THE PLASTIC POLLUTION JOURNEY</h1>
          </div>
          <div className="screen-view">
            <div className="pane">
              <h3>the plastics lifecycle</h3>
              <p>Plastics are leaked into the environment across the lifecycle and source to sea and can also be transported through various pathways.<br /><br />Plastics pose certain challenges and represent losses across the lifecycle, including during production, packaging, distribution, use, maintenance, and eventually recycling, reuse, recovery or final disposal.</p>
              <Button type="ghost" size="large">Learn more</Button>
            </div>
          </div>
          <div className="screen-view">
            <div className="pane">
              <h3>PLASTIC POLLUTION FROM SOURCE TO SEA</h3>
              <h4>Airborne - pathway</h4>
              <p>Plastic particles such as vehicle tyres,
              synthetic textiles accumulate in the
              atmosphere, where they can be
              transported over long distances. Rain, snow and wind can deposit plastics in
              different places. Microplastics are found in snow, ice
              and sea-ice, from the poles to remote
              mountain tops.
              </p>
              <h4>rivers - direct pathway</h4>
              <p>Transport of plastic debris through the environment including into oceans.</p>
            </div>
          </div>
          <div className="screen-view">
            <div className="pane">
              <h4>Agriculture Soil – source and sink</h4>
              <p>Use of plastic films and large fibre textiles in farming
practices. Sewage sludge with plastic residue used as
fertilizer. Irrigation with plastic contaminated water.
Artificial fertilizer and seeds coated with a polymer.</p>
              <h4>industry - source</h4>
              <p>Missing or low enforcement of regulation to restrict
pollution from pellets during production or transportation
contribute to leakage of plastics into the environment.</p>
              <h4>Cities and Waste Management - source</h4>
              <p>Clothes, synthetic products such as building materials,
take-away food containers…etc. are sources of plastic
particles and fibres. Inadequate waste management is a
source of leakage of plastic particles in the environment
including groundwater.</p>
            </div>
          </div>
          <div className="screen-view">
            <div className="pane">
              <h4>Sewage and wastewater – source and pathway</h4>
              <p>Wastewater treatment plants are a major
source of microplastics and nanoplastics in
water bodies.</p>
              <h4>Lakes – close to rivers and ocean</h4>
              <p>Temporary and long-term storage. A source
under specific weather patterns and
hydrodynamic regimes.</p>
               <h4>Reservoirs – sources and sinks</h4>
               <p>Plastics from atmospheric fallout, streams,
and rivers. Temporary and long-term storage,
and possible infiltration into groundwater.</p>
            </div>
          </div>
          <div className="screen-view">
            <div className="pane">
              <h4>Tourism</h4>
              <p>Coastal and sea-based tourism is
another source of plastic waste
through intentional or accidental
littering of shorelines</p>
                <h4>fishing activities</h4>
                <p>Galley waste thrown overboard, abandoned, lost, or otherwise discarded fishing gear and marine coating.</p>
                <h4>Shipping and Recreational boats - source</h4>
                <p>Galley waste thrown overboard, loss of shipping goods, plastic pellets, and marine coatings.</p>
            </div>
          </div>
        </div>
      </div>
  )
}

export default Landing
