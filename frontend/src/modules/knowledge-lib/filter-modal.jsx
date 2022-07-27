import React, { useEffect, useState } from "react";
import "./filter-modal.scss";
import {
  Row,
  Col,
  Space,
  Checkbox,
  Tag,
  Button,
  DatePicker,
  Modal,
} from "antd";
import moment from "moment";
import { useAuth0 } from "@auth0/auth0-react";
import isEmpty from "lodash/isEmpty";
import values from "lodash/values";
import flatten from "lodash/flatten";

import { UIStore } from "../../store";

import MultipleSelectFilter from "../../components/select/multiple-select-filter";

const InviteExpertModal = ({
  query,
  updateQuery,
  setIsShownModal,
  isShownModal,
  handleFilter,
  moreFilter,
  fetchData,
  filterCountries,
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

  const handleApplyFilter = () => {
    fetchData({
      ...(filterCountries.length > 0 && {
        country: filterCountries.toString(),
      }),
      ...moreFilter,
      ...(moreFilter.entity && {
        entity: moreFilter.entity.toString(),
      }),
      ...(moreFilter.subContentType && {
        subContentType: moreFilter.subContentType.toString(),
      }),
      ...(moreFilter.tag && {
        tag: moreFilter.tag.toString(),
      }),
      ...(moreFilter.representativeGroup && {
        representativeGroup: moreFilter.representativeGroup.toString(),
      }),
    });
    setIsShownModal(false);
  };

  return (
    <Modal
      centered
      className="filter-modal"
      title="Filters"
      visible={isShownModal}
      onCancel={() => setIsShownModal(false)}
      footer={[
        <Button
          key="submit"
          type="primary"
          className="apply-button"
          onClick={() => handleApplyFilter()}
        >
          APPLY FILTERS
        </Button>,
        <Button className="clear-button" onClick={() => setIsShownModal(false)}>
          Cancel
        </Button>,
      ]}
    >
      <Row type="flex" gutter={[0, 24]}>
        {/* My Bookmarks */}
        {isAuthenticated && (
          <Col span={24} style={{ paddingTop: 5, paddingBottom: 5 }}>
            <Space align="middle">
              <Checkbox
                className="favorites-checkbox"
                checked={moreFilter?.favorites?.indexOf("true") > -1}
                onChange={({ target: { checked } }) =>
                  handleFilter("favorites", checked)
                }
              >
                My Bookmarks
              </Checkbox>
            </Space>
          </Col>
        )}

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
          value={moreFilter?.subContentType || []}
          flag="subContentType"
          query={query}
          updateQuery={handleFilter}
        />

        {/* Tags */}
        <MultipleSelectFilter
          title="Tags"
          options={tagOpts || []}
          value={moreFilter?.tag?.map((x) => x) || []}
          flag="tag"
          query={query}
          updateQuery={handleFilter}
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
          value={moreFilter?.entity?.map((x) => parseInt(x)) || []}
          flag="entity"
          query={query}
          updateQuery={handleFilter}
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
          value={moreFilter?.representativeGroup || []}
          flag="representativeGroup"
          query={query}
          updateQuery={handleFilter}
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
              value={moreFilter?.startDate}
              flag="startDate"
              query={query}
              updateQuery={handleFilter}
              span={12}
              startDate={
                !isEmpty(moreFilter?.startDate)
                  ? moment(moreFilter?.startDate[0])
                  : null
              }
            />
            {/* End date */}
            <DatePickerFilter
              title="End Date"
              value={moreFilter?.endDate}
              flag="endDate"
              query={query}
              updateQuery={handleFilter}
              span={12}
              endDate={
                !isEmpty(moreFilter?.endDate)
                  ? moment(moreFilter?.endDate[0])
                  : null
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
      </Space>
      <div>
        <DatePicker
          placeholder="YYYY"
          picker={"year"}
          value={
            !isEmpty(value)
              ? flag.toLowerCase() === "startdate"
                ? moment(value).startOf("year")
                : moment(value).endOf("year")
              : ""
          }
          onChange={(val) =>
            updateQuery(flag, val ? moment(val).format("YYYY-MM-DD") : null)
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
