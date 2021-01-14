import { Select } from 'antd';
import React ,{useState} from 'react'
import Maps from '../../components/Maps'
import './styles.scss'

const Landing = () => {
    const [country, setCountry] = useState("nothing");
    const data = [];

    const clickEvents = ({name, data}) => {
        setCountry(name);
    }

    const toolTip = (params) => {
        if (params.value) {
            let value = (params.value + '').split('.');
            value = value[0].replace(/(\d{1,3})(?=(?:\d{3})+(?!\d))/g, '$1,');
            return params.name + ': ' + value;
        }
    }

    return (
      <div id="landing">
        <div className="map-overlay">
          <Select placeholder="Countries" />
          <div className="summary">
            <header>Global summary</header>
            <ul>
              <li>
                <b>18</b>
                <div className="label">projects</div>
                <span>in 35 countries</span>
              </li>
              <li>
                <b>18</b>
                <div className="label">projects</div>
                <span>in 35 countries</span>
              </li>
              <li>
                <b>18</b>
                <div className="label">projects</div>
                <span>in 35 countries</span>
              </li>
            </ul>
          </div>
        </div>
        <Maps
          data={data}
          clickEvents={clickEvents}
          tooltip={toolTip}
        />
      </div>
    )
}

export default Landing
