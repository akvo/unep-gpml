import React, { useEffect, useState, useCallback } from "react";
import ObjectFieldTemplate from "../../utils/forms/object-template";
import ArrayFieldTemplate from "../../utils/forms/array-template";
import FieldTemplate from "../../utils/forms/field-template";
import widgets from "../../utils/forms";
import { overideValidation } from "../../utils/forms";
import uiSchema from "./uiSchema.json";
import common from "./common";
import cloneDeep from "lodash/cloneDeep";
import { withRouter } from "react-router-dom";
import { UIStore } from "../../store";
import { Store } from "pullstate";
import { notification, Typography } from "antd";
import { Theme as AntDTheme } from "@rjsf/antd";
import { withTheme } from "@rjsf/core";
import {
  transformFormData,
  collectDependSchemaRefactor,
} from "../initiative/form";
import { checkRequiredFieldFilledIn, customFormats } from "../../utils/forms";
import api from "../../utils/api";

const Form = withTheme(AntDTheme);

const FlexibleForm = withRouter(
  ({
    btnSubmit,
    sending,
    setSending,
    formType,
    highlight,
    setHighlight,
    isStakeholderType,
    isEntityType,
    formSchema,
    setDisabledBtn,
    history,
    hideEntityPersonalDetail,
    tabsData,
    mainType,
    subContentType,
    capacityBuilding,
    type,
    match: { params },
  }) => {
    const {
      countries,
      organisations,
      tags,
      formEdit,
      profile,
      selectedMainContentType,
      mainContentType,
      languages,
    } = UIStore.currentState;

    const { status, id } = formEdit.flexible;

    const { initialData, initialFormData } = common;

    const flexibleFormData = initialFormData.useState();

    const [dependValue, setDependValue] = useState([]);
    const [schema, setSchema] = useState(formSchema.schema);
    const [editCheck, setEditCheck] = useState(true);

    useEffect(() => {
      if (subContentType) {
        let obj = mainContentType.find(
          (o) => o.code === selectedMainContentType
        );
        let find = obj?.childs.find((o) => o.title === subContentType)?.tags;
        if (find) {
          initialFormData.update((e) => {
            e.data = {
              ...e.data,
              tagsList: find,
            };
          });
        }
      }
    }, [
      subContentType,
      mainContentType,
      selectedMainContentType,
      initialFormData,
    ]);

    const handleOnSubmit = ({ formData }) => {
      if (mainType === "Policy") {
        handleOnSubmitPolicy(formData);
        return false;
      }

      if (mainType === "Initiative") {
        handleOnSubmitInitiative(formData);
        return false;
      }

      if (mainType === "Event") {
        handleOnSubmitEvent(formData, capacityBuilding);
        return false;
      }

      if (mainType === "Technology") {
        handleOnSubmitTechnology(formData);
        return false;
      }

      delete formData?.tabs;
      delete formData?.steps;
      delete formData?.required;

      // # Transform data before sending to endpoint
      let data = {
        ...formData,
        resourceType: mainType,
        subContentType: subContentType,
        ...(capacityBuilding && { capacityBuilding: true }),
      };

      transformFormData(data, formData, formSchema.schema.properties, true);

      data.version = parseInt(formSchema.schema.version);

      delete data?.S1;
      delete data?.S2;
      delete data?.S3;
      delete data?.S4;
      delete data?.S5;

      data.geoCoverageType = Object.keys(data.geoCoverageType)[0];

      if (data.resourceType === "Financing Resource") {
        if (data.hasOwnProperty("valueCurrency")) {
          data.valueCurrency = Object.keys(data?.valueCurrency)[0];
        }
        if (data.hasOwnProperty("validFrom")) {
          data.validFrom = data?.validFrom;
          data.validTo = data.validTo || "Ongoing";
        }
        if (data.hasOwnProperty("validTo")) {
          data.validTo = data?.validTo;
        }
        if (data.hasOwnProperty("valueAmount")) {
          data.value = data?.valueAmount;
        }

        delete data.valueAmount;
        if (data.hasOwnProperty("valueRemark")) {
          data.valueRemarks = data.valueRemark;
          delete data.valueRemark;
        }
      }

      if (data.resourceType === "Action Plan") {
        if (data.hasOwnProperty("validTo")) {
          data.validTo = data?.validTo;
        }
        if (data.hasOwnProperty("validFrom")) {
          data.validFrom = data?.validFrom;
          data.validTo = data.validTo || "Ongoing";
        }

        if (data.hasOwnProperty("firstPublicationDate")) {
          data.firstPublicationDate = data.firstPublicationDate;
          data.latestAmendmentDate = data.latestAmendmentDate || "Ongoing";
        }

        if (data.hasOwnProperty("latestAmendmentDate")) {
          data.latestAmendmentDate = data.latestAmendmentDate;
        }
      } else {
        delete data.firstPublicationDate;
        delete data.latestAmendmentDate;
      }

      delete data.orgName;

      data.tags =
        formData.S4.S4_G3.tags &&
        formData.S4.S4_G3.tags.map((x) => {
          return {
            id: parseInt(x),
            tag: Object.values(tags)
              .flat()
              .find((o) => o.id === parseInt(x)).tag,
          };
        });

      if (data?.publishYear) {
        const publishYear = new Date(data.publishYear);
        data.publishYear = publishYear.getFullYear();
      }

      if (data.geoCoverageType === "transnational") {
        if (
          data.geoCoverageValueTransnational &&
          data.geoCoverageValueTransnational.length > 0
        ) {
          data.geoCoverageCountryGroups = data.geoCoverageValueTransnational
            ? data.geoCoverageValueTransnational.map((x) => parseInt(x))
            : [];
          delete data.geoCoverageValueTransnational;
        }
        if (data.geoCoverageCountries && data.geoCoverageCountries.length > 0) {
          data.geoCoverageCountries = data.geoCoverageCountries
            ? data.geoCoverageCountries.map((x) => parseInt(x))
            : [];
        }
      }

      if (data.geoCoverageType === "national") {
        data.geoCoverageCountries = data.geoCoverageCountries.map((x) =>
          parseInt(x)
        );
        delete data.geoCoverageValueTransnational;
      }

      if (data.geoCoverageType === "sub-national") {
        data.geoCoverageCountries = data.geoCoverageCountries.map((x) =>
          parseInt(x)
        );
        delete data.geoCoverageValueTransnational;
      }

      if (data.geoCoverageType === "global") {
        delete data.geoCoverageValueTransnational;
      }

      if (data?.urls) {
        data.urls = data.urls.map((x) => {
          return {
            url: x,
            lang: "en",
          };
        });
      }

      if (data?.entity) {
        data.entityConnections = data.entity[0].hasOwnProperty("role")
          ? data.entity
          : [];
        delete data.entity;
      }

      if (data?.individual) {
        data.individualConnections = data.individual[0].hasOwnProperty("role")
          ? data.individual
          : [];
        delete data.individual;
      }

      if (data?.info) {
        data.infoDocs = data.info;
        delete data.info;
      }

      if (data?.related) {
        data.relatedContent = data?.related.map((x) => parseInt(x));
        delete data.related;
      }

      if (status === "add" && !params?.id) {
        data?.image && data?.image === "" && delete data.image;
      }

      if (status === "edit" || params?.id) {
        data?.image &&
          data?.image.match(customFormats.url) &&
          delete data.image;
      }

      if (status === "add" && !params?.id) {
        api
          .post("/resource", data)
          .then(() => {
            // scroll top
            window.scrollTo({ top: 0 });
            initialFormData.update((e) => {
              e.data = initialData;
            });
            setDisabledBtn({ disabled: true, type: "default" });
            notification.success({ message: "Resource successfully created" });
          })
          .catch(() => {
            notification.error({ message: "An error occured" });
          })
          .finally(() => {
            setSending(false);
          });
      }
      if (status === "edit" || params?.id) {
        delete data.version;
        api
          .put(`/detail/${type}/${id || params?.id}`, data)
          .then(() => {
            // scroll top
            window.scrollTo({ top: 0 });
            initialFormData.update((e) => {
              e.data = initialData;
            });
            setDisabledBtn({ disabled: true, type: "default" });
            notification.success({ message: "Resource successfully updated" });
            history.push(`/${type}/${id || params?.id}`);
          })
          .catch(() => {
            initialFormData.update((e) => {
              e.data = initialData;
            });
            history.push(`/${type}/${id || params?.id}`);
            notification.error({ message: "An error occured" });
          })
          .finally(() => {
            setSending(false);
          });
      }
    };

    ///

    const handleOnSubmitInitiative = (formData) => {
      delete formData?.tabs;
      delete formData?.steps;
      delete formData?.required;

      let data = {
        ...formData,
        ...(capacityBuilding && { capacityBuilding: true }),
      };

      transformFormData(data, formData, formSchema.schema.properties);

      data.version = parseInt(formSchema.schema.version);

      delete data?.S1;
      delete data?.S2;
      delete data?.S3;
      delete data?.S4;
      delete data?.S5;

      data.tags =
        formData.S4.S4_G3.tags &&
        formData.S4.S4_G3.tags.map((x) => {
          return {
            id: parseInt(x),
            tag: Object.values(tags)
              .flat()
              .find((o) => o.id === parseInt(x)).tag,
          };
        });

      delete data.qtags;

      data.url = data.qurl;
      delete data.qurl;

      if (data?.qinfo) {
        data.info_docs = data.qinfo;
        delete data.qinfo;
      }

      if (data?.qentity) {
        data.entity_connections = data.qentity[0].hasOwnProperty("role")
          ? data.qentity
          : [];
        delete data.qentity;
      }

      if (data?.qindividual) {
        data.individual_connections = data.qindividual;
        delete data.qindividual;
      }

      data.q2 = data.qtitle;
      delete data.qtitle;

      data.q3 = data.qsummary;
      delete data.qsummary;

      data.q24 = data.qgeoCoverageType;
      delete data.qgeoCoverageType;

      data.sub_content_type = subContentType;

      if (data.q24.hasOwnProperty("transnational")) {
        data.q24_2 = data.q24_4;
        data.q24_4 = data.q24_3;
        data.q24_3 = null;
      }
      if (data.q24.hasOwnProperty("national")) {
        data.q24_2 = [data.q24_2];
      }

      if (data.q24.hasOwnProperty("sub-national")) {
        data.q24_2 = [data.qgeoCoverageValueSubnational];
        delete data.qgeoCoverageValueSubnational;
        delete data.qgeoCoverageValueSubnationalCity;
      }

      if (data?.qrelated) {
        data.related_content = data?.qrelated.map((x) => parseInt(x));
        delete data.qrelated;
      }

      if (status === "add" && !params?.id) {
        api
          .postRaw("/initiative", data)
          .then(() => {
            window.scrollTo({ top: 0 });
            initialFormData.update((e) => {
              e.data = initialData;
            });
            setDisabledBtn({ disabled: true, type: "default" });
            notification.success({ message: "Resource successfully created" });
          })
          .catch(() => {
            notification.error({ message: "An error occured" });
          })
          .finally(() => {
            setSending(false);
          });
      }
      if (status === "edit" || params?.id) {
        delete data.version;
        api
          .putRaw(`/detail/project/${id || params?.id}`, data)
          .then(() => {
            // scroll top
            window.scrollTo({ top: 0 });
            initialFormData.update((e) => {
              e.data = initialData;
            });
            setDisabledBtn({ disabled: true, type: "default" });
            notification.success({ message: "Resource successfully updated" });
            history.push(`/project/${id || params?.id}`);
          })
          .catch(() => {
            initialFormData.update((e) => {
              e.data = initialData;
            });
            history.push(`/project/${id || params?.id}`);
            notification.error({ message: "An error occured" });
          })
          .finally(() => {
            setSending(false);
          });
      }
    };

    const handleOnSubmitPolicy = (formData) => {
      delete formData?.tabs;
      delete formData?.steps;
      delete formData?.required;

      let data = {
        ...formData,
        ...(capacityBuilding && { capacityBuilding: true }),
      };

      transformFormData(data, formData, formSchema.schema.properties, true);
      data.version = parseInt(formSchema.schema.version);

      delete data?.S1;
      delete data?.S2;
      delete data?.S3;
      delete data?.S4;
      delete data?.S5;

      data.geoCoverageType = Object.keys(data.geoCoverageType)[0];

      if (data.geoCoverageType === "transnational") {
        if (
          data.geoCoverageValueTransnational &&
          data.geoCoverageValueTransnational.length > 0
        ) {
          data.geoCoverageCountryGroups = data.geoCoverageValueTransnational
            ? data.geoCoverageValueTransnational.map((x) => parseInt(x))
            : [];
          delete data.geoCoverageValueTransnational;
        }
        if (data.geoCoverageCountries && data.geoCoverageCountries.length > 0) {
          data.geoCoverageCountries = data.geoCoverageCountries
            ? data.geoCoverageCountries.map((x) => parseInt(x))
            : [];
        }
      }

      if (data.geoCoverageType === "national") {
        data.geoCoverageCountries = data.geoCoverageCountries.map((x) =>
          parseInt(x)
        );
      }

      if (data.geoCoverageType === "sub-national") {
        data.geoCoverageCountries = data.geoCoverageCountries.map((x) =>
          parseInt(x)
        );
      }

      if (data.geoCoverageType === "sub-national") {
        data.geoCoverageCountries = [
          parseInt(Object.keys(data.geoCoverageValueSubnational)[0]),
        ];

        delete data.geoCoverageValueSubnational;
      }

      if (data?.urls) {
        data.urls = data.urls.map((x) => {
          return {
            url: x,
            lang: "en",
          };
        });
      }

      data.tags =
        formData.S4.S4_G3.tags &&
        formData.S4.S4_G3.tags.map((x) => {
          return {
            id: parseInt(x),
            tag: Object.values(tags)
              .flat()
              .find((o) => o.id === parseInt(x)).tag,
          };
        });

      if (data.hasOwnProperty("firstPublicationDate")) {
        data.firstPublicationDate = data.firstPublicationDate;
        data.latestAmendmentDate = data.latestAmendmentDate || "Ongoing";
      }

      if (data.hasOwnProperty("latestAmendmentDate")) {
        data.latestAmendmentDate = data.latestAmendmentDate;
      }

      if (data.hasOwnProperty("implementingMea")) {
        data.implementingMea = parseInt(Object.keys(data.implementingMea)[0]);
      }

      if (data?.entity) {
        data.entityConnections = data.entity[0].hasOwnProperty("role")
          ? data.entity
          : [];
        delete data.entity;
      }

      if (data?.individual) {
        data.individualConnections = data.individual;
        delete data.individual;
      }
      if (data?.info) {
        data.infoDocs = data.info;
        delete data.info;
      }

      if (data?.related) {
        data.relatedContent = data?.related.map((x) => parseInt(x));
        delete data.related;
      }

      if (data?.summary) {
        data.abstract = data?.summary;
        delete data.summary;
      }

      if (data?.lang) {
        let find = languages[Object.keys(data.lang)[0]];
        data.language = {
          english_name: find.name,
          native_name: find.native,
          iso_code: Object.keys(data.lang)[0],
        };
        delete data.lang;
      }

      if (status === "add" && !params?.id) {
        data?.image && data?.image === "" && delete data.image;
      }

      if (status === "edit" || params?.id) {
        data?.image &&
          data?.image.match(customFormats.url) &&
          delete data.image;
      }

      if (status === "add" && !params?.id) {
        api
          .post("/policy", data)
          .then(() => {
            window.scrollTo({ top: 0 });
            initialFormData.update((e) => {
              e.data = initialData;
            });
            setDisabledBtn({ disabled: true, type: "default" });
            notification.success({ message: "Resource successfully created" });
          })
          .catch(() => {
            notification.error({ message: "An error occured" });
          })
          .finally(() => {
            setSending(false);
          });
      }
      if (status === "edit" || params?.id) {
        delete data.version;
        api
          .put(`/detail/${type}/${id || params?.id}`, data)
          .then(() => {
            // scroll top
            window.scrollTo({ top: 0 });
            initialFormData.update((e) => {
              e.data = initialData;
            });
            setDisabledBtn({ disabled: true, type: "default" });
            notification.success({ message: "Resource successfully updated" });
            history.push(`/${type}/${id || params?.id}`);
          })
          .catch(() => {
            initialFormData.update((e) => {
              e.data = initialData;
            });
            history.push(`/${type}/${id || params?.id}`);
            notification.error({ message: "An error occured" });
          })
          .finally(() => {
            setSending(false);
          });
      }
    };

    ///

    const handleOnSubmitEvent = (formData) => {
      delete formData?.tabs;
      delete formData?.steps;
      delete formData?.required;

      let data = {
        ...formData,
        ...(capacityBuilding && { capacityBuilding: true }),
      };

      transformFormData(data, formData, formSchema.schema.properties, true);

      data.version = parseInt(formSchema.schema.version);

      delete data?.S1;
      delete data?.S2;
      delete data?.S3;
      delete data?.S4;
      delete data?.S5;

      data.geoCoverageType = Object.keys(data.geoCoverageType)[0];

      if (data.geoCoverageType === "transnational") {
        if (
          data.geoCoverageValueTransnational &&
          data.geoCoverageValueTransnational.length > 0
        ) {
          data.geoCoverageCountryGroups = data.geoCoverageValueTransnational
            ? data.geoCoverageValueTransnational.map((x) => parseInt(x))
            : [];
          delete data.geoCoverageValueTransnational;
        }
        if (data.geoCoverageCountries && data.geoCoverageCountries.length > 0) {
          data.geoCoverageCountries = data.geoCoverageCountries
            ? data.geoCoverageCountries.map((x) => parseInt(x))
            : [];
        }
      }

      if (data.geoCoverageType === "national") {
        data.geoCoverageCountries = data.geoCoverageCountries.map((x) =>
          parseInt(x)
        );
      }

      if (data.geoCoverageType === "sub-national") {
        data.geoCoverageCountries = data.geoCoverageCountries.map((x) =>
          parseInt(x)
        );
      }

      if (data.geoCoverageType === "sub-national") {
        data.geoCoverageCountries = [
          parseInt(Object.keys(data.geoCoverageValueSubnational)[0]),
        ];

        delete data.geoCoverageValueSubnational;
      }

      if (data?.urls) {
        data.urls = data.urls.map((x) => {
          return {
            url: x,
            lang: "en",
          };
        });
      }

      data.tags =
        formData.S4.S4_G3.tags &&
        formData.S4.S4_G3.tags.map((x) => {
          return {
            id: parseInt(x),
            tag: Object.values(tags)
              .flat()
              .find((o) => o.id === parseInt(x)).tag,
          };
        });

      if (data.hasOwnProperty("startDate")) {
        data.startDate = data.startDate;
      }

      if (data.hasOwnProperty("endDate")) {
        data.endDate = data.endDate;
      }

      if (data?.entity) {
        data.entityConnections = data.entity[0].hasOwnProperty("role")
          ? data.entity
          : [];
        delete data.entity;
      }

      if (data?.individual) {
        data.individualConnections = data.individual;
        delete data.individual;
      }
      if (data?.info) {
        data.infoDocs = data.info;
        delete data.info;
      }

      if (data?.related) {
        data.relatedContent = data?.related.map((x) => parseInt(x));
        delete data.related;
      }

      if (data?.summary) {
        data.description = data?.summary;
        delete data.summary;
      }

      if (status === "add" && !params?.id) {
        data?.image && data?.image === "" && delete data.image;
      }

      if (status === "edit" || params?.id) {
        data?.image &&
          data?.image.match(customFormats.url) &&
          delete data.image;
      }

      if (status === "add" && !params?.id) {
        api
          .post("/event", data)
          .then(() => {
            window.scrollTo({ top: 0 });
            initialFormData.update((e) => {
              e.data = initialData;
            });
            setDisabledBtn({ disabled: true, type: "default" });
            notification.success({ message: "Resource successfully created" });
          })
          .catch(() => {
            notification.error({ message: "An error occured" });
          })
          .finally(() => {
            setSending(false);
          });
      }
      if (status === "edit" || params?.id) {
        delete data.version;
        api
          .put(`/detail/${type}/${id || params?.id}`, data)
          .then(() => {
            // scroll top
            window.scrollTo({ top: 0 });
            initialFormData.update((e) => {
              e.data = initialData;
            });
            setDisabledBtn({ disabled: true, type: "default" });
            notification.success({ message: "Resource successfully updated" });
            history.push(`/${type}/${id || params?.id}`);
          })
          .catch(() => {
            initialFormData.update((e) => {
              e.data = initialData;
            });
            history.push(`/${type}/${id || params?.id}`);
            notification.error({ message: "An error occured" });
          })
          .finally(() => {
            setSending(false);
          });
      }
    };

    ///

    const handleOnSubmitTechnology = (formData) => {
      delete formData?.tabs;
      delete formData?.steps;
      delete formData?.required;

      let data = {
        ...formData,
      };

      transformFormData(data, formData, formSchema.schema.properties, true);

      data.version = parseInt(formSchema.schema.version);

      delete data?.S1;
      delete data?.S2;
      delete data?.S3;
      delete data?.S4;
      delete data?.S5;

      data.geoCoverageType = Object.keys(data.geoCoverageType)[0];

      if (data.geoCoverageType === "transnational") {
        if (
          data.geoCoverageValueTransnational &&
          data.geoCoverageValueTransnational.length > 0
        ) {
          data.geoCoverageCountryGroups = data.geoCoverageValueTransnational
            ? data.geoCoverageValueTransnational.map((x) => parseInt(x))
            : [];
          delete data.geoCoverageValueTransnational;
        }
        if (data.geoCoverageCountries && data.geoCoverageCountries.length > 0) {
          data.geoCoverageCountries = data.geoCoverageCountries
            ? data.geoCoverageCountries.map((x) => parseInt(x))
            : [];
        }
      }

      if (data.geoCoverageType === "national") {
        data.geoCoverageCountries = data.geoCoverageCountries.map((x) =>
          parseInt(x)
        );
      }

      if (data.geoCoverageType === "sub-national") {
        data.geoCoverageCountries = data.geoCoverageCountries.map((x) =>
          parseInt(x)
        );
      }

      if (data?.yearFounded) {
        const yearFounded = new Date(data.yearFounded);
        data.yearFounded = yearFounded.getFullYear();
      }

      if (data?.title) {
        data.name = data.title;
        delete data.title;
      }

      if (data?.urls) {
        data.urls = data.urls.map((x) => {
          return {
            url: x,
            lang: "en",
          };
        });
      }

      data.tags =
        formData.S4.S4_G3.tags &&
        formData.S4.S4_G3.tags.map((x) => {
          return {
            id: parseInt(x),
            tag: Object.values(tags)
              .flat()
              .find((o) => o.id === parseInt(x)).tag,
          };
        });

      if (data?.entity) {
        data.entityConnections = data.entity[0].hasOwnProperty("role")
          ? data.entity
          : [];
        delete data.entity;
      }

      if (data?.individual) {
        data.individualConnections = data.individual[0].hasOwnProperty("role")
          ? data.individual
          : [];
        delete data.individual;
      }

      if (data?.info) {
        data.infoDocs = data.info;
        delete data.info;
      }

      if (data?.related) {
        data.relatedContent = data?.related.map((x) => parseInt(x));
        delete data.related;
      }

      if (data?.summary) {
        data.remarks = data?.summary;
        delete data.summary;
      }

      if (status === "add" && !params?.id) {
        data?.image && data?.image === "" && delete data.image;
      }

      if (status === "edit" || params?.id) {
        data?.image &&
          data?.image.match(customFormats.url) &&
          delete data.image;
      }

      if (status === "add" && !params?.id) {
        api
          .post("/technology", data)
          .then(() => {
            window.scrollTo({ top: 0 });
            initialFormData.update((e) => {
              e.data = initialData;
            });
            setDisabledBtn({ disabled: true, type: "default" });
            notification.success({ message: "Resource successfully created" });
          })
          .catch(() => {
            notification.error({ message: "An error occured" });
          })
          .finally(() => {
            setSending(false);
          });
      }
      if (status === "edit" || params?.id) {
        delete data.version;
        api
          .put(`/detail/${type}/${id || params?.id}`, data)
          .then(() => {
            // scroll top
            window.scrollTo({ top: 0 });
            initialFormData.update((e) => {
              e.data = initialData;
            });
            setDisabledBtn({ disabled: true, type: "default" });
            notification.success({ message: "Resource successfully updated" });
            history.push(`/${type}/${id || params?.id}`);
          })
          .catch(() => {
            initialFormData.update((e) => {
              e.data = initialData;
            });
            history.push(`/${type}/${id || params?.id}`);
            notification.error({ message: "An error occured" });
          })
          .finally(() => {
            setSending(false);
          });
      }
    };

    const handleFormOnChange = useCallback(
      ({ formData, schema }) => {
        initialFormData.update((e) => {
          e.data = {
            ...e.data,
            ...formData,
          };
        });

        let updatedFormDataSchema = {};

        if (
          formData?.S4.S4_G2.geoCoverageType === "transnational" &&
          formData?.S4.S4_G2.geoCoverageValueTransnational
        ) {
          let result = formSchema.schema.properties.S4.properties.S4_G2.required.filter(
            (value) => value !== "geoCoverageCountries"
          );
          updatedFormDataSchema = {
            ...formSchema.schema,
            properties: {
              ...formSchema.schema.properties,
              S4: {
                ...formSchema.schema.properties.S4,
                properties: {
                  ...formSchema.schema.properties.S4.properties,
                  S4_G2: {
                    ...formSchema.schema.properties.S4.properties.S4_G2,
                    required: result,
                  },
                },
              },
            },
          };
        } else if (
          formData?.S4.S4_G2.geoCoverageType === "transnational" &&
          formData?.S4.S4_G2.geoCoverageCountries
        ) {
          let result = formSchema.schema.properties.S4.properties.S4_G2.required.filter(
            (value) => value !== "geoCoverageValueTransnational"
          );
          updatedFormDataSchema = {
            ...formSchema.schema,
            properties: {
              ...formSchema.schema.properties,
              S4: {
                ...formSchema.schema.properties.S4,
                properties: {
                  ...formSchema.schema.properties.S4.properties,
                  S4_G2: {
                    ...formSchema.schema.properties.S4.properties.S4_G2,
                    required: result,
                  },
                },
              },
            },
          };
        } else {
          updatedFormDataSchema = formSchema.schema;
        }

        setSchema(updatedFormDataSchema);

        // to overide validation
        let dependFields = [];
        let requiredFields = [];
        // this function eliminate required key from required list when that required form appear (show)
        collectDependSchemaRefactor(
          dependFields,
          formData,
          updatedFormDataSchema,
          requiredFields
        );

        setDependValue(dependFields);
        const requiredFilledIn = checkRequiredFieldFilledIn(
          formData,
          dependFields,
          requiredFields
        );
        let sectionRequiredFields = {};
        let groupRequiredFields = {};

        requiredFields.forEach(({ group, key, required }) => {
          let index = group ? group : key;
          let filterRequired = required.filter((r) =>
            requiredFilledIn.includes(r)
          );
          sectionRequiredFields = {
            ...sectionRequiredFields,
            [index]: sectionRequiredFields?.[index]
              ? sectionRequiredFields?.[index].concat(filterRequired)
              : filterRequired,
          };
          if (!group) {
            groupRequiredFields = {
              ...groupRequiredFields,
              [key]: {
                ...groupRequiredFields[key],
                required: {
                  [key]: filterRequired,
                },
              },
            };
          }
          if (group) {
            groupRequiredFields = {
              ...groupRequiredFields,
              [group]: {
                ...groupRequiredFields[group],
                required: {
                  ...groupRequiredFields?.[group]?.required,
                  [key]: filterRequired,
                },
              },
            };
          }
        });
        initialFormData.update((e) => {
          e.data = {
            ...e.data,
            required: sectionRequiredFields,
            S4: {
              ...e.data.S4,
              required: groupRequiredFields["S4"].required,
            },
            S5: {
              ...e.data.S5,
              required: groupRequiredFields["S5"].required,
            },
          };
        });
        // enable btn submit
        requiredFilledIn.length === 0 &&
          ((initialFormData?.currentState?.data.S4[
            "S4_G5"
          ].individual[0].hasOwnProperty("role") &&
            initialFormData?.currentState?.data.S4[
              "S4_G5"
            ].individual[0].hasOwnProperty("stakeholder")) ||
            (initialFormData?.currentState?.data.S4[
              "S4_G5"
            ].entity[0].hasOwnProperty("role") &&
              initialFormData?.currentState?.data.S4[
                "S4_G5"
              ].entity[0].hasOwnProperty("entity"))) === true &&
          setDisabledBtn({ disabled: false, type: "primary" });
        requiredFilledIn.length !== 0 &&
          ((initialFormData?.currentState?.data.S4["S4_G5"].individual.length >
            0 &&
            initialFormData?.currentState?.data.S4[
              "S4_G5"
            ].individual[0].hasOwnProperty("role") &&
            initialFormData?.currentState?.data.S4[
              "S4_G5"
            ].individual[0].hasOwnProperty("stakeholder")) ||
            (initialFormData?.currentState?.data.S4[
              "S4_G5"
            ].entity[0].hasOwnProperty("role") &&
              initialFormData?.currentState?.data.S4[
                "S4_G5"
              ].entity[0].hasOwnProperty("entity"))) === true &&
          setDisabledBtn({ disabled: true, type: "default" });
      },
      [initialFormData, formSchema, setDisabledBtn]
    );
    const handleTransformErrors = (errors, dependValue) => {
      // custom errors handle
      [".S4", ".S5"].forEach((x) => {
        let index = dependValue.indexOf(x);
        index !== -1 && dependValue.splice(index, 1);
      });
      const res = overideValidation(errors, dependValue);
      res.length === 0 && setHighlight(false);
      if (res.length > 0) {
        const descriptionList = res.map((r, index) => {
          const { property, message } = r;
          const tabSection = property
            .replace(".", "")
            .replace("['", "_")
            .replace("']", "_")
            .split("_")[0];
          const tabSectionTitle = tabsData.find((x) => x.key === tabSection)
            ?.title;
          return (
            <li key={`${property}-${index}`}>
              {tabSectionTitle}:{" "}
              <Typography.Text type="danger">{message}</Typography.Text>
            </li>
          );
        });
        notification.error({
          message: "Error",
          description: <ul>{descriptionList}</ul>,
        });
      }
      return res;
    };

    return (
      <div className="add-flexible-form">
        <>
          <Form
            idPrefix="flexibleForm"
            schema={schema}
            uiSchema={uiSchema[selectedMainContentType]}
            formData={flexibleFormData.data}
            onChange={(e) => handleFormOnChange(e)}
            onSubmit={(e) => handleOnSubmit(e)}
            ArrayFieldTemplate={ArrayFieldTemplate}
            ObjectFieldTemplate={ObjectFieldTemplate}
            FieldTemplate={FieldTemplate}
            widgets={widgets}
            customFormats={customFormats}
            transformErrors={(errors) =>
              handleTransformErrors(errors, dependValue)
            }
            showErrorList={false}
            formContext={flexibleFormData}
          >
            <button ref={btnSubmit} type="submit" style={{ display: "none" }}>
              Fire
            </button>
          </Form>
        </>
      </div>
    );
  }
);

export default FlexibleForm;
