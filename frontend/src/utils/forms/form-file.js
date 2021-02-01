import React, {useRef, useState} from "react";
import { UploadOutlined } from "@ant-design/icons";
import { Button } from "antd";


const getBase64 = (file) => {
    return new Promise ((resolve, reject) => {
       var reader = new FileReader();
       reader.readAsDataURL(file);
       reader.onload = () => resolve(reader.result);
       reader.onerror = () => reject(reader.result)
    });
}

const ViewWidget = ({url, download}) =>  {
    if (download) {
        return (<a className="view-cv ant-btn" href={url} target="_blank" rel="noreferrer" download={download}>Download CV</a>)
    }
    return (<a className="view-cv ant-btn" href={url} target="_blank" rel="noreferrer">View CV</a>)
}


const FileWidget = (props) => {
    const [file, setFile] = useState(null);
    const [output, setOutput] = useState("");
    const inputFile = useRef(null);
    const handleChange = (x) => {
        const input = x.target.files[0];
        setFile(input);
        const base64 = getBase64(input)
        base64.then(res => {
            setOutput(res);
            props.onChange(res);
        })
    }
    return (
        <div className="photo-upload">
            <Button onClick={() => inputFile.current.click()} style={{marginTop: "5px"}} className="upload-btn">
                <UploadOutlined/> Choose File
            </Button> <span style={{marginLeft:"20px"}}>{file?.name}</span>
            {!output && props?.value && props?.name === 'cv' && (<ViewWidget url={props.value} download={false}/>)}
            {props?.name === 'cv' && file?.name && (<ViewWidget url={output} download={file.name}/>)}
            <input type="file" onChange={handleChange} ref={inputFile} accept={props?.accept} style={{display:"none"}}/>
            <br/>
            {!output && props?.value && props?.name !== 'cv' && (<img src={props.value} alt="upload" />)}
            {props?.name !== 'cv' && file?.name && (<img src={output} alt={file.name} />)}
        </div>
    )
}

export default FileWidget;
