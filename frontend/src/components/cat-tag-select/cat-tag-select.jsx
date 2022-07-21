import { Select } from "antd";
import catTags from "../../utils/cat-tags.json";
import "./style.scss";

const CatTagSelect = ({
  handleChange,
  meta,
  error,
  value,
  handleRemove,
  placeholder,
}) => (
  <div className="cat-tag-select">
    <Select
      mode="multiple"
      placeholder={`${placeholder ? placeholder : "Choose"} categories`}
      dropdownRender={(menu) => (
        <CategorisedTags handleChange={handleChange} value={value} />
      )}
      className={`dont-show ${
        error && !meta.valid ? "ant-input-status-error" : ""
      }`}
      value={value}
      onDeselect={(value) => handleRemove(value)}
    />
  </div>
);
function slug(text) {
  return text.toLowerCase().replaceAll("&", "n").replaceAll(" ", "-");
}
const CategorisedTags = ({ handleChange, value }) => {
  return (
    <ul className="cat-tag-dropdown">
      {catTags.map((cat) => (
        <li>
          <h4>{cat.title}</h4>
          <ul>
            {cat.topics
              .filter((item) => !value?.includes(item))
              .map((tag) => (
                <li onClick={() => handleChange(tag)}>
                  <div className="img-container">
                    <img
                      src={
                        require(`../../images/cat-tags/${slug(tag)}.svg`)
                          .default
                      }
                    />
                  </div>
                  <div className="label-container">
                    <span>{tag}</span>
                  </div>
                </li>
              ))}
          </ul>
        </li>
      ))}
    </ul>
  );
};

export default CatTagSelect;
