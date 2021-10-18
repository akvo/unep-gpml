import { UIStore } from "../../store";
import React, { useEffect, useRef, useState } from "react";
import { Row, Col, Card, Button, Switch } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import "./styles.scss";
import AddResourceForm from "./form";
import StickyBox from "react-sticky-box";
import isEmpty from "lodash/isEmpty";

const AddFinancingResource = ({ match: { params }, ...props }) => {
  const {
    countries,
    organisations,
    tags,
    regionOptions,
    meaOptions,
    transnationalOptions,
    currencies,
    formStep,
    formEdit,
  } = UIStore.useState((s) => ({
    countries: s.countries,
    organisations: s.organisations,
    tags: s.tags,
    regionOptions: s.regionOptions,
    meaOptions: s.meaOptions,
    transnationalOptions: s.transnationalOptions,
    currencies: s.currencies,
    formStep: s.formStep,
    formEdit: s.formEdit,
  }));
  const btnSubmit = useRef();
  const [sending, setSending] = useState(false);
  const [highlight, setHighlight] = useState(false);
  const [disabledBtn, setDisabledBtn] = useState({
    disabled: true,
    type: "default",
  });
  const isLoaded = () =>
    Boolean(
      !isEmpty(countries) &&
        !isEmpty(organisations) &&
        !isEmpty(tags) &&
        !isEmpty(regionOptions) &&
        !isEmpty(meaOptions) &&
        !isEmpty(currencies) &&
        !isEmpty(transnationalOptions)
    );

  useEffect(() => {
    UIStore.update((e) => {
      e.disclaimer = null;
    });
  }, [props]);

  useEffect(() => {
    UIStore.update((e) => {
      e.highlight = highlight;
    });
  }, [highlight]);

  const handleOnClickBtnSubmit = (e) => {
    setHighlight(true);
    btnSubmit.current.click();
  };

  return (
    <div id="add-resource">
      <StickyBox style={{ zIndex: 10 }}>
        <div className="form-info-wrapper">
          <div className="ui container">
            <Row>
              <Col xs={24} lg={11}>
                <div className="form-title">
                  <span className="title">Financing Resource</span>
                </div>
              </Col>
              <Col xs={24} lg={13}>
                <div
                  className={`form-meta ${
                    formStep.financingResource === 2 ? "submitted" : ""
                  }`}
                >
                  <div className="highlight">
                    <Switch
                      checked={highlight}
                      size="small"
                      onChange={(status) => setHighlight(status)}
                    />{" "}
                    {highlight
                      ? "Required fields highlighted"
                      : "Highlight required"}
                  </div>
                  <Button
                    disabled={disabledBtn.disabled}
                    loading={sending}
                    type={disabledBtn.type}
                    size="large"
                    onClick={(e) => handleOnClickBtnSubmit(e)}
                  >
                    SUBMIT
                  </Button>
                </div>
              </Col>
            </Row>
          </div>
        </div>
      </StickyBox>
      {!isLoaded() ? (
        <h2 className="loading">
          <LoadingOutlined spin /> Loading
        </h2>
      ) : (
        <div className="ui container">
          <Row>
            <Col xs={24} lg={11}>
              <h1>
                {formEdit.financingResource.status === "add" && !params.id
                  ? "Add"
                  : "Edit"}{" "}
                Financing Resource
              </h1>
            </Col>
            <Col xs={24} lg={13}>
              <Card>
                <AddResourceForm
                  btnSubmit={btnSubmit}
                  sending={sending}
                  setSending={setSending}
                  highlight={highlight}
                  setHighlight={setHighlight}
                  setDisabledBtn={setDisabledBtn}
                  isLoaded={isLoaded()}
                />
              </Card>
            </Col>
          </Row>
        </div>
      )}
    </div>
  );
};

export default AddFinancingResource;
