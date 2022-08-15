import React from 'react'
import { Button } from "antd";
import './styles.scss'
import { ReactComponent as Down } from "../../images/down.svg";
import { ReactComponent as PlasticLitter } from "../../images/plastic-litter.svg";
import MenuBar from './menu-bar';

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
          <Button type="primary" size='large'>Join the Partnership</Button>
        </div>
        <div className="next-btn">
          <Down />
        </div>
      </div>
    </div>
  )
}

export default Landing
