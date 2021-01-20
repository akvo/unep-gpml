import React, { useEffect, useState } from "react";
import { withTheme } from "@rjsf/core";
import { Theme as AntDTheme } from "@rjsf/antd";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import { cloneDeep } from "lodash";
import widgets, { CustomFieldTemplate } from "../../utils/forms";
import ObjectFieldTemplate from "../../utils/forms/template";

const Form = withTheme(AntDTheme);

const defaultSchema = {
    title: "",
    type:"object",
    properties : {
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
            required: ["details"],
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
            "ui:allowSearch": true
        },
    },
    other: {
        details: {
            "ui:widget": "textarea",
            "ui:placeholder": "Max 999 character"
        },
    },
};

const SignUpForm = ({initialData, dispatchData}) => {
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
                dispatchData({
                    profile: {
                        email: claims?.email || "",
                        firstName: claims?.given_name || "",
                        lastName: claims?.family_name || ""
                    }
                })
                setSchema(newSchema);
            })();
        }
    }, [schema]);

    const onChange = ({formData}) => {
        dispatchData(formData);
    }

    return (
        <div className={schema.loading ? "hidden" : ""}>
            <Form
                idPrefix="signup_"
                schema={schema.schema}
                ObjectFieldTemplate={ObjectFieldTemplate}
                FieldTemplate={CustomFieldTemplate}
                uiSchema={defaultUISchema}
                formData={initialData}
                onChange={onChange}
                widgets={widgets}>
                <button type="submit" style={{display: "none"}}>Fire</button>
            </Form>
        </div>
    );
};

export default SignUpForm;
