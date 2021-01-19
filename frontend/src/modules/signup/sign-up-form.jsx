import React, { useEffect, useState } from "react";
import { withTheme } from "@rjsf/core";
import { Theme as AntDTheme } from "@rjsf/antd";
import axios from "axios";
import { ExclamationCircleFilled, CheckCircleFilled } from "@ant-design/icons";
import { useAuth0 } from "@auth0/auth0-react";
import { cloneDeep } from "lodash";

const Form = withTheme(AntDTheme);

const defaultSchema = {
    type: "object",
    properties: {
        profile: {
            type: "object",
            title: "Personal Details",
            required: ["email", "firstName", "lastName"],
            properties: {
                email: {
                    type: "string",
                    title: "EMAIL"
                },
                firstName: {
                    type: "string",
                    title: "FIRST NAME"
                },
                lastName: {
                    type: "string",
                    title: "LAST NAME"
                },
                linkedin: {
                    type: "string",
                    title: "LINKEDIN"
                },
                twitter: {
                    type: "string",
                    title: "TWITTER"
                },
                avatar: {
                    type: "string",
                    format: "data-url",
                    title: "AVATAR PHOTO"
                }
            }
        },
        organisation: {
            type: "object",
            title: "Organisation Details",
            properties: {
                name: {
                    type: "string",
                    title: "ORGANISATION NAME"
                },
                website: {
                    type: "string",
                    format: "url",
                    title: "WEBSITE URL"
                },
                sector: {
                    type: "string",
                    title: "REPRESENTATIVE SECTOR",
                    enum: ["Sector 1", "Sector 2"]
                },
                country: {
                    type: "string",
                    title: "COUNTRY",
                    enum: ["Loading"]
                }
            }
        },
        other: {
            type: "object",
            title: "Other",
            properties: {
                details: {
                    type: "string",
                    title: "TELL ABOUT YOURSELF"
                }
            }
        }
    }
};

const defaultUISchema = {
    profile: {
        email: {
            "ui:disabled": "true",
            "ui:widget": "Auth0Widget"
        },
        twitter: {
            "ui:placeholder": "Twitter Username"
        },
        linkedin: {
            "ui:placeholder": "Linkedin Username"
        },
        avatar: {
            "ui:options": { accept: [".jpg", ".png", ".webp"] },
            "ui:widget": "file"
        },
        extraProps: {
            kind: "title"
        }
    },
    organisation: {
        name: {
            "ui:placeholder": "Organsation Name"
        },
        website: {
            "ui:placeholder": "www.org.com",
        },
        sector: {
            "ui:placeholder": "Select your activity sector"
        },
        country: {
            "ui:placeholder": "Select your country",
        },
        extraProps: {
            kind: "title"
        }
    },
    other: {
        details: {
            "ui:widget": "textarea",
            "ui:placeholder": "Max 999 character"
        },
        extraProps: {
            kind: "title"
        }
    },
    extraProps: {
        kind: "title"
    }
};

const Auth0Widget = (props) => {
  const { logout } = useAuth0();
  const email = props.schema.description;
  return (
    <>
    <input type="text"
        className="ant-input"
        value={props.value}
        required={props.required}
        disabled={props.disabled}
    onChange={(event) => props.onChange(event.target.value)} />
    <div style={{ marginTop: "10px" }}>
        <span style={{ color: email !== "Verified" ? "red" : "green" }}>
            {email !== "Verified" ? <ExclamationCircleFilled /> : <CheckCircleFilled />} {email}
        </span>
        {email !== "Verified" ? <span style={{ fontWeight: "bold" }}> or </span> : ""}
        <button style={{ marginLeft: "10px" }} onClick={() => logout()}>
            use diffrent email
        </button>
    </div>
    </>
  );
};

const widgets = {
  Auth0Widget: Auth0Widget
};

const CustomFieldTemplate = ({ id, label, help, required, description, errors, children, uiSchema }) => {
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

const SignUpForm = ({initialData, updateData}) => {
    const [schema, setSchema] = useState({ schema: defaultSchema, loading: true });
    const { getIdTokenClaims } = useAuth0();

    useEffect(() => {
        if (schema.loading) {
            (async function fetchData() {
                const response = await axios.get("/api/country");
                const claims = await getIdTokenClaims();
                const newSchema = cloneDeep(schema);
                newSchema.schema.properties.profile.properties.email.description = claims?.email_verified ? "Verified" : "Please confirm your email address";
                newSchema.schema.properties.organisation.properties.country.enum = response.data.map(x => x.name);
                newSchema.loading = false;
                updateData({
                    profile: {
                        email: claims?.email || "",
                        firstName: claims?.given_name || "",
                        lastName: claims?.family_name || ""
                    }
                })
                setSchema(newSchema);
            })();
        }
    }, []);

    const onChange = ({formData}) => {
        updateData(formData);
    }

    return (
        <div className={schema.loading ? "hidden" : ""}>
            <Form schema={schema.schema} FieldTemplate={CustomFieldTemplate} uiSchema={defaultUISchema} formData={initialData} onChange={onChange} widgets={widgets}>
                <button type="submit" style={{display: "none"}}>Fire</button>
            </Form>
        </div>
    );
};

export default SignUpForm;
