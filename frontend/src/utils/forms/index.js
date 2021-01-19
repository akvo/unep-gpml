import Auth0Widget from './form-auth0'
import FileWidget from './form-file'
import SelectWidget from './form-select'

const widgets = {
    Auth0Widget: Auth0Widget,
    FileWidget: FileWidget,
    SelectWidget: SelectWidget
};

export const CustomFieldTemplate = (props) => {
    const { id, classNames, label, help, required, errors, children, displayLabel } = props
    return (
        <div style={{ marginBottom: "10px" }} className={classNames}>
            <label htmlFor={id} style={{fontWeight: "bold"}}>
                {displayLabel ? label : ""}
                {displayLabel && !required ? <span style={{ color: "#c2c2c2", fontStyle: "italic", fontWeight:"normal" }}> - Optional</span> : ""}
            </label>
            {children}
            {errors}
            {help}
        </div>
    );
};

export default widgets;

