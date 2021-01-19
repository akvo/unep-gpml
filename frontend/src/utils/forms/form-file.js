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
        <div>
            <Button onClick={() => inputFile.current.click()}>
                <UploadOutlined/> Choose File
            </Button>
            <input type="file" onChange={handleChange} ref={inputFile} accept={props.options.accept.join(',')} style={{display:"none"}}/>
            <br/>
            <br/>
            {file?.name && (<img src={output} alt={file.name} width="200px"/>)}
            <br/>
            {file?.name}
        </div>
    )
}

export default FileWidget;
