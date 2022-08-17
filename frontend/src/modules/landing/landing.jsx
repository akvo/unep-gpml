import React from 'react'
import { Button } from "antd";
import './styles.scss'
import { ReactComponent as Down } from "../../images/down.svg";
import { ReactComponent as PlasticLitter } from "../../images/plastic-litter.svg";
import MenuBar from './menu-bar';
import Footer from '../../footer';

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
  return (
    <div className="journey">
        <img src="/plastic-journey.svg" />
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
        </div>
      </div>
  )
}

export default Landing
