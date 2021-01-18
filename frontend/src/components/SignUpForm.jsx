import React ,{ useEffect, useState } from 'react'
import { withTheme } from '@rjsf/core';
import { Theme as AntDTheme } from '@rjsf/antd';
import axios from 'axios';
import { ExclamationCircleFilled, CheckCircleFilled } from '@ant-design/icons';
import { useAuth0 } from '@auth0/auth0-react';

const Form = withTheme(AntDTheme);
const defaultSchema = {
    type: "object",
    properties: {
        profile: {
            type: "object",
            title: "Personal Details",
            required: ["email","firstName", "lastName"],
            properties: {
                email: {
                    type: "string",
                    title: "EMAIL",
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
        email: {
            "ui:disabled":"true",
        },
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
    const emailInfo = description?.props?.description;
    let extraField = "";
    if (isForm && label === "EMAIL" && emailInfo) {
        console.log(emailInfo);
        extraField = (
            <div style={{marginTop: "10px"}}>
                <span style={{color: emailInfo !== "Verified" ? "red" : "green"}}>
                {emailInfo !== "Verified" ? <ExclamationCircleFilled/> : <CheckCircleFilled/>} {emailInfo}
                </span>
                {emailInfo !== "Verified" ? (
                    <>
                    <span style={{fontWeight: "bold"}}> or </span>
                    <span style={{textDecoration: "underline", color: "#00AAF1", cursor: "pointer"}}>use diffrent email</span>
                    </>
                ) : ""}
            </div>
        )
    }
    return (
        <div style={{marginBottom: "10px"}}>
            {isForm ? (
                <label htmlFor={id} style={isTitle ? {color: "#00AAF1", fontWeight: "bold"} : {}}>
                    {label}{required ? "" : (isForm ? (<span style={{color: "#c2c2c2", fontStyle: "italic"}}> - Optional</span>) : "")}
                </label>
            ): ""}
            {children}
            {label !== "EMAIL" ? description : extraField}
            {errors}
            {help}
        </div>
    );
}

const SignUpForm = () => {
    const [schema, setSchema] = useState({schema: defaultSchema, loading: true, data: {}});
    const { getIdTokenClaims } = useAuth0();

    console.log();

    useEffect(() => {
        if (schema.loading) {
            (async function fetchData() {
                const response = await axios.get('/api/country');
                const claims = await getIdTokenClaims();
                const newSchema  = {
                    loading: false,
                    schema: {
                        type: "object",
                        properties : {
                            ...defaultSchema.properties,
                            profile: {
                                ...defaultSchema.properties.profile,
                                properties: {
                                    ...defaultSchema.properties.profile.properties,
                                    email: {
                                        ...defaultSchema.properties.profile.properties.email,
                                        description: claims.email_verified ? "Verified" : "Please confirm your email address",
                                    }
                                },
                            },
                            organisation: {
                                ...defaultSchema.properties.organisation,
                                properties: {
                                    ...defaultSchema.properties.organisation.properties,
                                    country: {
                                        ...defaultSchema.properties.organisation.properties.country,
                                        enum: response.data.map(x => x.name)
                                    }}
                            }
                        }
                    },
                    data: {
                        profile: {
                            email: claims.email,
                            firstName: claims.given_name,
                            lastName: claims.family_name,
                        }
                    }
                };
                console.log()
                setSchema(newSchema);
            }());
        }
    }, []);

    const onSubmit = ({formData}) => {
        console.log(formData);
    };

    return (
        <div className={schema.loading ? "hidden" : ""}>
            <Form
                schema={schema.schema}
                onSubmit={onSubmit}
                FieldTemplate={CustomFieldTemplate}
                formData={schema.data}
                uiSchema={defaultUISchema}>
            <div>
                <button className={"ant-btn ant-btn-primary"} type="submit">Submit</button>
            </div>
            </Form>
        </div>
    )
}

export default SignUpForm;
