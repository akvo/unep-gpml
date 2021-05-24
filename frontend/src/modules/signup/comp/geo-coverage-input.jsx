import { UIStore } from "../../../store";
import React from "react";
import { Input, Select } from "antd";
import { Field } from "react-final-form";
import specificAreasOptions from "../../events/specific-areas.json";

const GeoCoverageInput = (props) => {
  const { countries, regionOptions } = UIStore.currentState;
  const { disabled } = props;
  const national =
    countries && countries.map((it) => ({ value: it.isoCode, label: it.name }));
  return (
    <Field
      key={props.name}
      name={props.input.name.replace("Value", "Type")}
      render={({ input: typeInput, name }) => {
        return (
          <Field
            key={name}
            name={props.input.name}
            render={({ input }) => {
              if (typeInput.value === "global") {
                return <Input disabled />;
              }
              if (typeInput.value === "sub-national") {
                return (
                  <Input
                    placeholder="Type regions here..."
                    {...input}
                    disabled={disabled}
                  />
                );
              }
              if (typeInput.value === "Other") {
                return (
                  <Input
                    placeholder="Type here..."
                    {...input}
                    disabled={disabled}
                  />
                );
              }
              const selectProps = { ...input, disabled };
              if (typeInput.value === "regional") {
                if (input.value === "" || input?.[0] === "") {
                  input.onChange([]);
                }
                selectProps.options = regionOptions.map((it) => ({
                  value: it,
                  label: it,
                }));
                selectProps.mode = "multiple";
              } else if (
                typeInput.value === "national" ||
                typeInput.value === "transnational"
              ) {
                selectProps.options = national;
                selectProps.showSearch = true;
                selectProps.filterOption = (input, option) =>
                  option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
                if (typeInput.value === "transnational") {
                  if (input.value === "" || input?.[0] === "") {
                    input.onChange([]);
                  }
                  selectProps.mode = "multiple";
                }
              } else if (
                typeInput.value === "global with elements in specific areas"
              ) {
                selectProps.options = specificAreasOptions.map((it) => ({
                  value: it,
                  label: it,
                }));
                selectProps.mode = "multiple";
                if (input.value === "" || input?.[0] === "") {
                  input.onChange([]);
                }
              }
              return <Select {...selectProps} virtual={false} />;
            }}
          />
        );
      }}
    />
  );
};

export default GeoCoverageInput;
