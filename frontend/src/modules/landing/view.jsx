import React ,{useState} from 'react'
import Map from './map'

const Landing = () => {
    const [country, setCountry] = useState("nothing");
    const data = [{name:'Indonesia', value:40}];

    const clickEvents = ({name, data}) => {
        setCountry(name);
    }

    const toolTip = (params) => {
        if (params.value) {
            var value = (params.value + '').split('.');
            value = value[0].replace(/(\d{1,3})(?=(?:\d{3})+(?!\d))/g, '$1,');
            return params.seriesName + '<br/>' + params.name + ': ' + value;
        }
        return 'No Data';
    }

    return (
        <>
        <Map
            title={`${country} is clicked`}
            subtitle={"Test"}
            data={data}
            clickEvents={clickEvents}
            toolTip={toolTip}
        />
        </>
    )
}

export default Landing
