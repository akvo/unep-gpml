import Auth0Widget from './form-auth0'
import FileWidget from './form-file'

const widgets = {
    Auth0Widget: Auth0Widget,
    FileWidget: FileWidget
};

export const CustomFieldTemplate = ({ id, label, help, required, description, errors, children, uiSchema }) => {
    const title = uiSchema?.extraProps?.kind === "title";
    return (
        <div style={{ marginBottom: "10px" }}>
            {title ? (
                ""
            ) : (
                <label htmlFor={id} style={title ? { color: "#00AAF1", fontWeight: "bold" } : {}}>
                    {label}
                    {required ? "" : <span style={{ color: "#c2c2c2", fontStyle: "italic" }}> - Optional</span>}
                </label>
            )}
            {children}
            {errors}
            {help}
        </div>
    );
};


export default widgets;

