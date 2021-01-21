import React, { useEffect, useState } from "react";
import { withTheme } from "@rjsf/core";
import { Theme as AntDTheme } from "@rjsf/antd";
import { cloneDeep } from "lodash";
import widgets from "../../utils/forms";
import ObjectFieldTemplate from "../../utils/forms/object-field-tpl";
import api from "../../utils/api";

const Form = withTheme(AntDTheme);

const defaultSchema = {
    type: "object",
    properties : {
        profile: {
            type: "object",
            title: "Personal Details",
            required: ["email", "firstName", "lastName"],
            properties: {
                firstName: {
                    type: "string",
                    title: "First name"
                },
                lastName: {
                    type: "string",
                    title: "Last name"
                },
                linkedin: {
                    type: "string",
                    title: "LinkedIn"
                },
                twitter: {
                    type: "string",
                    title: "Twitter"
                },
                avatar: {
                    type: "string",
                    format: "data-url",
                    title: "Avatar photo"
                }
            }
        },
        organisation: {
            type: "object",
            title: "Organisation Details",
            properties: {
                name: {
                    type: "string",
                    title: "Organisation Name"
                },
                website: {
                    type: "string",
                    title: "Website URL"
                },
                sector: {
                    type: "string",
                    title: "Representative sector",
                    enum: ["Sector 1", "Sector 2"]
                },
                country: {
                    type: "string",
                    title: "Country",
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
                    title: "Tell about yourself"
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
            "ui:showSearch": true
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

    useEffect(() => {
        if (schema.loading) {
            (async function fetchData() {
                const response = await api.get('/country')
                const newSchema = cloneDeep(schema);
                newSchema.schema.properties.organisation.properties.country.enum = response.data.map(x => x.name);
                newSchema.loading = false;
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
              uiSchema={defaultUISchema}
              formData={initialData}
              onChange={onChange}
              widgets={widgets}>
            </Form>
        </div>
    );
};

export default SignUpForm;
