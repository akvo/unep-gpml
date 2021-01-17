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
            properties: {
                firstName: {
                    type: "string",
                    title: "First Name"
                },
                lastName: {
                    type: "string",
                    title: "Last Name"
                },
                linkedin: {
                    type: "string",
                    title: "Linked In",
                    description: "Optional",
                },
                twitter: {
                    type: "string",
                    title: "Twitter",
                    description: "Optional",
                },
                avatar: {
                    type: "string",
                    format: "data-url",
                    title: "Avatar Photo",
                }
            }
        },
        organisation: {
            type: "object",
            title: "Organisation Details",
            properties: {
                name: {
                    type: "string",
                    title: "Organisation Name",
                    description: "Optional",
                },
                website: {
                    type: "string",
                    title: "Website Url",
                    description: "Optional",
                },
                sector: {
                    type: "string",
                    description: "Optional",
                    title: "Sector",
                    enum: ["Sector 1","Sector 2"],
                },
                country: {
                    type: "string",
                    description: "Optional",
                    title: "Country",
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
                    title: "Tell About Yourself"
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
            "ui:options": {accept: [".jpg",".png", ".webp"]}
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

const SignUpForm = () => {
    const [schema, setSchema] = useState(defaultSchema);
    const [uiSchema, ] = useState(defaultUISchema);
    const [loading, setLoading] = useState(true);
    //const countries = await axios.get('/api/country');
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
            console.log(newSchema);
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

    console.log(schema);
    return (
        <div>
            <Form schema={schema} uiSchema={uiSchema} onSubmit={onSubmit}/>
        </div>
    )
}

export default SignUpForm;
