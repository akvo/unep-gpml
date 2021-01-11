import React ,{useState} from 'react'
import Maps from '../../components/Maps'

const Landing = () => {
    const [country, setCountry] = useState("nothing");
    const data = [{name:'Indonesia', value:40}];

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
        <Maps
            title={`${country} is clicked`}
            subtitle={"Test"}
            data={data}
            clickEvents={clickEvents}
            toolTip={toolTip}
        />
    )
}

export default Landing
