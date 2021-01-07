import React ,{ useState } from 'react'
import Map from './map'

const Landing = () => {
    const [data, setData] = useState([{name:'Indonesia', value:40}]);

    const clickEvents = (res) => {
        console.log(res);
    }

    const dispatchData = (param, data) => {
        setData([{name:'India', value: 20}]);
    }

    return (
        <Map
            title={"Test"}
            subtitle={"Test"}
            data={data}
            clickEvents={clickEvents}
            clickEffects={dispatchData}
        />
    )
}

export default Landing
