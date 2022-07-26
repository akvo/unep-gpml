import React, { useEffect, useState } from "react";
import "./filter-modal.scss";
import {
  Row,
  Col,
  Space,
  Drawer,
  Checkbox,
  Tag,
  Card,
  Button,
  DatePicker,
  Modal,
} from "antd";
import { CloseCircleOutlined } from "@ant-design/icons";
import classNames from "classnames";
import moment from "moment";
import { useAuth0 } from "@auth0/auth0-react";
import humps from "humps";
import isEmpty from "lodash/isEmpty";
import values from "lodash/values";
import flatten from "lodash/flatten";

import { UIStore } from "../../store";
import api from "../../utils/api";
import { topicTypes, topicNames } from "../../utils/misc";
import { titleCase } from "../../utils/string";

import MultipleSelectFilter from "../../components/select/multiple-select-filter";
import CountryTransnationalFilter from "../../components/select/country-transnational-filter";

// Import Icons as React component since the color of the icons changes when the card is selected
import { ReactComponent as CapacityBuildingIcon } from "../../images/knowledge-library/capacity-building.svg";
import { ReactComponent as ActionSelectedIcon } from "../../images/knowledge-library/action-selected.svg";
import { ReactComponent as EventFlexibleIcon } from "../../images/knowledge-library/event-flexible.svg";
import { ReactComponent as InitiativeIcon } from "../../images/knowledge-library/initiative.svg";
import { ReactComponent as FinancingIcon } from "../../images/knowledge-library/financing-2.svg";
import { ReactComponent as PolicyIcon } from "../../images/knowledge-library/policy.svg";
import { ReactComponent as TechnicalIcon } from "../../images/knowledge-library/technical.svg";
import { ReactComponent as TechnologyIcon } from "../../images/knowledge-library/technology.svg";

const InviteExpertModal = ({
  query,
  view,
  countData,
  updateQuery,
  filterVisible,
  setFilterVisible,
  multiCountryCountries,
  setMultiCountryCountries,
  filterTagValue,
  setIsShownModal,
  isShownModal,
}) => {
  const {
    tags,
    representativeGroup,
    mainContentType,
    organisations,
  } = UIStore.useState((s) => ({
    profile: s.profile,
    tags: s.tags,
    mainContentType: s.mainContentType,
    representativeGroup: s.representativeGroup,
    organisations: s.organisations,
  }));
  const { isAuthenticated } = useAuth0();
  const [
    tagsExcludingCapacityBuilding,
    setTagsExcludingCapacityBuilding,
  ] = useState([]);

  const [isClearFilter, setIsClearFilter] = useState(false);

  const filteredMainContentOptions = !isEmpty(mainContentType)
    ? mainContentType
        .filter((content) => {
          const resourceName = (name) => {
            if (name === "initiative") {
              return "project";
            } else if (name === "event_flexible") {
              return "event";
            } else if (name === "financing") {
              return "financing_resource";
            } else if (name === "technical") {
              return "technical_resource";
            } else if (name === "action") {
              return "action_plan";
            } else {
              return name;
            }
          };
          return query?.topic?.includes(resourceName(content?.code));
        })
        .sort((a, b) => a?.code.localeCompare(b?.code))
    : [];

  const mainContentOption = () => {
    if (query?.topic?.length > 0) {
      return filteredMainContentOptions;
    } else if (query?.topic?.length === 0 || !query?.topic) {
      return mainContentType;
    }
  };

  const topicIcons = (topic) => {
    if (topic === "project") {
      return <InitiativeIcon width="53" height="53" />;
    }
    if (topic === "actionPlan") {
      return <ActionSelectedIcon width="53" height="53" />;
    }
    if (topic === "policy") {
      return <PolicyIcon width="53" height="53" />;
    }
    if (topic === "technicalResource") {
      return <TechnicalIcon width="53" height="53" />;
    }
    if (topic === "financingResource") {
      return <FinancingIcon width="53" height="53" />;
    }
    if (topic === "event") {
      return <EventFlexibleIcon width="53" height="53" />;
    }
    if (topic === "technology") {
      return <TechnologyIcon width="53" height="53" />;
    }
    if (topic === "capacityBuilding") {
      return <CapacityBuildingIcon width="53" height="53" />;
    }
  };

  const handleChangeResourceType = (flag, type) => {
    const val = query[flag];

    let updateVal = [];

    if (isEmpty(val)) {
      updateVal = [type];
    } else if (val.includes(type)) {
      updateVal = val.filter((x) => x !== type);
    } else {
      updateVal = [...val, type];
    }
    updateQuery(flag, updateVal);
  };

  // populate options for tags dropdown
  const tagsWithoutSpace =
    !isEmpty(tags) &&
    flatten(values(tags)).map((it) => ({
      value: it?.tag?.trim(),
      label: it?.tag?.trim(),
    }));

  const tagOpts = !isEmpty(tags)
    ? [...new Set(tagsWithoutSpace.map((s) => JSON.stringify(s)))]
        .map((s) => JSON.parse(s))
        ?.sort((tag1, tag2) => tag1?.label.localeCompare(tag2?.label))
    : [];

  // populate options for representative group options
  const representativeOpts = !isEmpty(representativeGroup)
    ? [...representativeGroup, { code: "other", name: "Other" }].map((x) => ({
        label: x?.name,
        value: x?.code,
      }))
    : [];

  useEffect(() => {
    if (isClearFilter) {
      updateQuery("tag", tagsExcludingCapacityBuilding);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tagsExcludingCapacityBuilding]);

  const clearTopicFilter = () => {
    setIsClearFilter(true);
    const removeCapacityBuilding = query?.tag?.filter(
      (tag) => tag?.toLowerCase() !== "capacity building"
    );
    updateQuery("topic", []);
    setTagsExcludingCapacityBuilding(removeCapacityBuilding);
  };

  return (
    <Modal
      centered
      className="filter-modal"
      title="Filters"
      visible={isShownModal}
      onCancel={() => setIsShownModal(false)}
      footer={[
        <Button key="submit" type="primary" className="apply-button">
          APPLY FILTERS
        </Button>,
        <Button
          key="submit"
          className="clear-button"
          onClick={() => setIsShownModal(false)}
        >
          Cancel
        </Button>,
      ]}
    >
      <Row type="flex" gutter={[0, 24]}>
        {/* Sub-content type */}
        <MultipleSelectFilter
          title="Sub-content type"
          options={
            !isEmpty(mainContentType)
              ? mainContentOption().map((content) => ({
                  label: content?.name,
                  options: content?.childs
                    .map((child, i) => ({
                      label: child?.title,
                      value: child?.title,
                      key: `${i}-${content?.name}`,
                    }))
                    .sort((a, b) =>
                      a?.label?.trim().localeCompare(b?.label?.trim())
                    ),
                }))
              : []
          }
          value={query?.subContentType || []}
          flag="subContentType"
          query={query}
          updateQuery={updateQuery}
        />

        {/* My Bookmarks */}
        {isAuthenticated && (
          <Col span={24} style={{ paddingTop: 5, paddingBottom: 5 }}>
            <Space align="middle">
              <Checkbox
                className="favorites-checkbox"
                checked={query?.favorites?.indexOf("true") > -1}
                onChange={({ target: { checked } }) =>
                  updateQuery("favorites", checked)
                }
              >
                My Bookmarks
              </Checkbox>
            </Space>
          </Col>
        )}

        {/* Tags */}
        <MultipleSelectFilter
          title="Tags"
          options={tagOpts || []}
          value={query?.tag?.map((x) => x) || []}
          flag="tag"
          query={query}
          updateQuery={updateQuery}
        />

        <MultipleSelectFilter
          title="Entities"
          options={
            !isEmpty(organisations)
              ? organisations
                  ?.map((x) => ({ value: x.id, label: x.name }))
                  .filter(
                    (organisation) =>
                      organisation?.value > -1 ||
                      organisation?.label?.length === 0
                  )
              : []
          }
          value={query?.entity?.map((x) => parseInt(x)) || []}
          flag="entity"
          query={query}
          updateQuery={updateQuery}
        />

        <MultipleSelectFilter
          title="Representative group"
          options={
            !isEmpty(representativeGroup)
              ? representativeOpts.map((x) => ({
                  value: x?.value,
                  label: x.label,
                }))
              : []
          }
          value={query?.representativeGroup || []}
          flag="representativeGroup"
          query={query}
          updateQuery={updateQuery}
        />

        {/* Date Filter */}
        <Col
          span={24}
          className="date-picker-container"
          style={{ paddingTop: 5, paddingBottom: 5 }}
        >
          <Row type="flex" style={{ width: "100%" }} gutter={[10, 10]}>
            {/* Start date */}
            <DatePickerFilter
              title="Start Date"
              value={query?.startDate}
              flag="startDate"
              query={query}
              updateQuery={updateQuery}
              span={12}
              startDate={
                !isEmpty(query?.startDate) ? moment(query?.startDate[0]) : null
              }
            />
            {/* End date */}
            <DatePickerFilter
              title="End Date"
              value={query?.endDate}
              flag="endDate"
              query={query}
              updateQuery={updateQuery}
              span={12}
              endDate={
                !isEmpty(query?.endDate) ? moment(query?.endDate[0]) : null
              }
            />
          </Row>
        </Col>
      </Row>
    </Modal>
  );
};

const DatePickerFilter = ({
  title,
  value,
  query,
  flag,
  updateQuery,
  span = 24,
  startDate = null,
}) => {
  return (
    <Col span={span}>
      <Space align="middle">
        <div className="filter-title multiple-filter-title">{title}</div>
        {!isEmpty(query?.[flag]) ? (
          <Tag
            className="clear-selection"
            closable
            onClick={() => updateQuery(flag, [])}
            onClose={() => updateQuery(flag, [])}
          >
            Clear Selection
          </Tag>
        ) : (
          ""
        )}
      </Space>
      <div>
        <DatePicker
          placeholder="YYYY"
          picker={"year"}
          value={
            !isEmpty(value)
              ? flag.toLowerCase() === "startdate"
                ? moment(value[0]).startOf("year")
                : moment(value[0]).endOf("year")
              : ""
          }
          onChange={(val) =>
            updateQuery(flag, val ? moment(val).format("YYYY-MM-DD") : [])
          }
          disabledDate={(current) => {
            // Can not select days past start date
            if (startDate) {
              return current <= startDate;
            }
            return null;
          }}
        />
      </div>
    </Col>
  );
};

export default InviteExpertModal;
