import React from "react"
import { geoEqualEarth, geoPath } from "d3-geo"
import { feature } from "topojson-client"

const projection = geoEqualEarth();

const world = window.__UNEP__MAP__;
const geographies = feature(world, world.objects.countries).features;
//const geographies = [];
console.log(geographies[0]);

const Maps = ({
    title,
    subtitle,
    data,
    clickEvents,
    tooltip,
    custom={},
}) => {
  return (
    <svg width={ 800 } height={ 450 } viewBox="0 0 800 450">
      <g className="countries">
        {
          geographies.map((d,i) => (
            <path
              key={ `path-${ i }` }
              d={ geoPath().projection(projection)(d) }
              className="country"
              fill={ `rgba(38,50,56,${ 1 / geographies.length * i})` }
              stroke="#FFFFFF"
              strokeWidth={ 0.5 }
            />
          ))
        }
      </g>
    </svg>
  )
}

export default Maps;
