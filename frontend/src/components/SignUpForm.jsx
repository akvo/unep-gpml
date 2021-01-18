import React ,{ useEffect, useState } from 'react'
import { withTheme } from '@rjsf/core';
import { Theme as AntDTheme } from '@rjsf/antd';
import axios from 'axios';

const Form = withTheme(AntDTheme);
const defaultSchema = {
    type: "object",
    properties: {
        profile: {
            type: "object",
            title: "Personal Details",
            required: ["firstName", "lastName"],
            properties: {
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
                    title: "LINKEDIN",
                },
                twitter: {
                    type: "string",
                    title: "TWITTER",
                },
                avatar: {
                    type: "string",
                    format: "data-url",
                    title: "AVATAR PHOTO",
                }
            }
        },
        organisation: {
            type: "object",
            title: "Organisation Details",
            properties: {
                name: {
                    type: "string",
                    title: "ORGANISATION NAME",
                },
                website: {
                    type: "string",
                    title: "WEBSITE URL",
                },
                sector: {
                    type: "string",
                    title: "REPRESENTATIVE SECTOR",
                    enum: ["Sector 1","Sector 2"],
                },
                country: {
                    type: "string",
                    title: "COUNTRY",
                    enum: ["Loading"],
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
}

const defaultUISchema = {
    profile: {
        twitter: {
            "ui:placeholder": "Twitter Username",
        },
        linkedin: {
            "ui:placeholder": "Linkedin Username",
        },
        avatar: {
            "ui:options": {accept: [".jpg",".png", ".webp"]},
            "ui:widget": "file"
        }
    },
    organisation: {
        name: {
            "ui:placeholder": "Organsation Name",
        },
        website: {
            "ui:placeholder": "www.org.com",
        },
        sector: {
            "ui:placeholder": "Select your activity sector",
        },
        country: {
            "ui:placeholder": "Select your country",
        }
    },
    other: {
        details: {
            "ui:widget": "textarea",
                "ui:placeholder": "Max 999 character"
        }
    }
}

const CustomFieldTemplate = ({id, label, help, required, description, errors, children}) => {
    const isTitle = label ? ["Organisation Details", "Personal Details", "Other"].includes(label) : false;
    const isForm = id.split('_').length === 3;
    return (
        <div style={{marginBottom: "10px"}}>
            {isForm ? (
                <label htmlFor={id} style={isTitle ? {color: "#00AAF1", fontWeight: "bold"} : {}}>
                    {label}{required ? "" : (isForm ? (<span style={{color: "#c2c2c2", fontStyle: "italic"}}> - Optional</span>) : "")}
                </label>
            ): ""}
            {children}
            {description}
            {errors}
            {help}
        </div>
    );
}


const SignUpForm = () => {
    const [schema, setSchema] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function getCountries() {
            const response = await axios.get('/api/country');
            const countries = response.data.map(x => x.name);
            const newSchema = {
                type: "object",
                properties : {
                    ...defaultSchema.properties,
                    organisation: {
                        ...defaultSchema.properties.organisation,
                        properties: {
                            ...defaultSchema.properties.organisation.properties,
                            country: {
                                ...defaultSchema.properties.organisation.properties.country,
                                enum: countries
                            }}
                        }
                }
            };
            setSchema(newSchema);
            setLoading(false);
        }
        getCountries();
    }, [])

    const onSubmit = ({formData}) => {
        console.log(formData);
    };

    if (loading) {
        return <div>Loading</div>;
    }

    return (
        <div>
            <Form schema={schema} onSubmit={onSubmit} FieldTemplate={CustomFieldTemplate} uiSchema={loading ? {} : defaultUISchema}>
            <div>
                <button className={"ant-btn ant-btn-primary"} type="submit">Submit</button>
            </div>
            </Form>
        </div>
    )
}

export default SignUpForm;
