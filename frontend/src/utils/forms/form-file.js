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
            <Button onClick={() => inputFile.current.click()} style={{marginTop: "5px"}}>
                <UploadOutlined/> Choose File
            </Button> <span style={{marginLeft:"20px"}}>{file?.name}</span>
            <input type="file" onChange={handleChange} ref={inputFile} accept={props?.options?.accept.join(',')} style={{display:"none"}}/>
            <br/>
            {!output && props?.value && (<img src={props.value} alt="upload" />)}
            {file?.name && (<img src={output} alt={file.name} />)}
        </div>
    )
}

export default FileWidget;
