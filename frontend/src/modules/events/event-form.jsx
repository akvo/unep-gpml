import React, { useEffect, useState } from "react";
import { withTheme } from "@rjsf/core";
import { Theme as AntDTheme } from "@rjsf/antd";
import { cloneDeep } from "lodash";
import { Button } from 'antd';
import widgets from "../../utils/forms";
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
            required: ["title", "startDate", "endDate", "url", "description"],
            properties: {
                title: {
                    type: "string",
                    title: "TITLE"
                },
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
                    title: "EVENT URL"
                },
                description: {
                    type: "string",
                    title: "DESCRIPTION"
                },
                image: {
                    type: "string",
                    format: "data-url",
                    title: "IMAGE"
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
                    title: "CITY",
                },
                country: {
                    type: "string",
                    title: "COUNTRY",
                    enum: ["Loading"],
                },
            },
        },
        other: {
            type: "object",
            title: "Other",
            properties: {
                additionalInfo: {
                    type: "string",
                    title: "ADDITIONAL INFO"
                },
                tags: {
                    type: "string",
                    title: "TAGS",
                    enum: ["Tag 1", "Tag 2"]
                }
            }
        }
    }
};

const defaultUISchema = {
    details: {
        title: {
            "ui:placeholder": "Title"
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
            "ui:placeholder": "Select your country",
            "ui:showSearch": true,
        },
    },
    other: {
        additionalInfo: {
            "ui:widget": "textarea",
            "ui:placeholder": "Max 999 character"
        },
        tags: {
            "ui:placeholder": "Choose as many tags as you want",
            "ui:showSearch": true,
            "ui:mode": "multiple",
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
                newSchema.schema.properties.location.properties.country.enum = response.data.map(x => x.id);
                newSchema.schema.properties.location.properties.country.enumNames = response.data.map(x => x.name);
                newSchema.loading = false;
                setSchema(newSchema);
            })();
        }
    }, [schema]);

    const onChange = ({formData}) => {
        updateData(formData);
    }

    const sendData = () => {
        (async function() {
            const payload = {
                title: data.details?.title || null,
                start_date: data.details?.startDate || null,
                end_date: data.details?.endDate || null,
                description: data.details?.description || null,
                remarks: data.other?.additionalInfo || null,
                // FIXME: Need to allow UI selection
                geo_coverage_type: null,
                country: data.location?.country || null,
                city: data.location?.city || null,
            };
            const response = await axios.post("/api/event", payload);
            console.log(response);
        })();
    }

    return (
        <div className={schema.loading ? "hidden" : ""}>
            <Form
                idPrefix="events_"
                schema={schema.schema}
                ObjectFieldTemplate={ObjectFieldTemplate}
                uiSchema={defaultUISchema}
                formData={data}
                onChange={onChange}
                widgets={widgets}>
                <button type="submit" style={{display: "none"}}>Fire</button>
            </Form>
            <Button onClick={() => sendData()}>Add Event</Button>
        </div>
    );
};

export default EventForm;
