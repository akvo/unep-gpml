import React, { useEffect, useState } from "react";
import { withTheme } from "@rjsf/core";
import { Theme as AntDTheme } from "@rjsf/antd";
import { cloneDeep } from "lodash";
import widgets, { CustomFieldTemplate } from "../../utils/forms";
import ObjectFieldTemplate from "../../utils/forms/template";
import axios from "axios";

const Form = withTheme(AntDTheme);

const defaultSchema = {
    title: "",
    type:"object",
    properties : {
        details: {
            type: "object",
            title: "Event Details",
            required: ["startDate", "endDate", "url", "description"],
            properties: {
                startDate: {
                    type: "string",
                    title: "START DATE",
                    format: "date"
                },
                endDate: {
                    type: "string",
                    title: "END DATE",
                    format: "date"
                },
                url: {
                    type: "string",
                    title: "FIRST NAME"
                },
                description: {
                    type: "string",
                    title: "LAST NAME"
                },
                image: {
                    type: "string",
                    format: "data-url",
                    title: "AVATAR PHOTO"
                },
                association: {
                    type: "string",
                    title: "CHOOSE YOUR ASSOCIATION TO THIIS EVENT"
                }
            }
        },
        location: {
            type: "object",
            title: "Event Location",
            properties: {
                city: {
                    type: "string",
                    title: "CITY"
                },
                country: {
                    type: "string",
                    title: "COUNTRY",
                    enum: ["Loading"]
                },
            },
        },
        other: {
            type: "object",
            title: "Other",
            properties: {
                additionalInfo: {
                    type: "string",
                    title: "WEBSITE URL"
                },
                tags: {
                    type: "string",
                    title: "TAGS",
                    enum: ["Loading"]
                }
            }
        }
    }
};

const defaultUISchema = {
    details: {
        title: {
            "ui:placeholder": "Twitter Username"
        },
        startDate: {
            "ui:placeholder": "DD/MM/YYYY"
        },
        endDate: {
            "ui:placeholder": "DD/MM/YYYY"
        },
        url: {
            "ui:placeholder": "www.org.com"
        },
        description: {
            "ui:widget": "textarea",
            "ui:placeholder": "Max 999 character"
        },
        image: {
            "ui:options": { accept: [".jpg", ".png", ".webp"] },
            "ui:widget": "file"
        },
        country: {
            "ui:placeholder": "Organiser",
        },
    },
    location: {
        city: {
            "ui:placeholder": "Select your city"
        },
        country: {
            "ui:placeholder": "Select your country"
        },
    },
    other: {
        additionalInfo: {
            "ui:widget": "textarea",
            "ui:placeholder": "Max 999 character"
        },
        city: {
            "ui:placeholder": "Choose as many tags as you want"
        },
    }
};


const EventForm = () => {
    const [schema, setSchema] = useState({ schema: defaultSchema, loading: true });
    const [data, updateData] = useState({});

    useEffect(() => {
        if (schema.loading) {
            (async function fetchData() {
                const response = await axios.get("/api/country");
                const newSchema = cloneDeep(schema);
                newSchema.schema.properties.location.properties.country.enum = response.data.map(x => x.name);
                newSchema.loading = false;
                setSchema(newSchema);
            })();
        }
    }, [schema]);

    const onChange = ({formData}) => {
        updateData(formData);
    }

    return (
        <div className={schema.loading ? "hidden" : ""}>
            <Form
                idPrefix="events_"
                schema={schema.schema}
                ObjectFieldTemplate={ObjectFieldTemplate}
                FieldTemplate={CustomFieldTemplate}
                uiSchema={defaultUISchema}
                formData={data}
                onChange={onChange}
                widgets={widgets}>
                <button type="submit" style={{display: "none"}}>Fire</button>
            </Form>
        </div>
    );
};

export default EventForm;
