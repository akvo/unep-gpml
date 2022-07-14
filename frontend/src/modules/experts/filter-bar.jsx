import React from 'react'
import catTags from "../../utils/cat-tags.json";

function slug(text) {
  return text.toLowerCase().replaceAll("&", "n").replaceAll(" ", "-");
}

const FilterBar = ({ filter, setFilter }) => {
  const handleClick0 = (catIndex) => () => {
    setFilter([catIndex])
  }
  const handleBack = () => {
    setFilter([])
  }
  return (
    <div className="filter-bar">
      {filter.length === 0 &&
      <div className="level-0">
        <div><small>Choose an expert category</small></div>
        <div>
          <ul>
          {catTags.map((cat, index) => {
            return (
            <li onClick={handleClick0(index)}>
              <img src={require(`../../images/cat-tags/${slug(cat.title)}.svg`).default} />
              <span>{cat.title}</span>
            </li>
            )
          })}
          </ul>
        </div>
      </div>
      }
      {filter.length > 0 &&
      <div className="level-1">
        <div className="selected" onClick={handleBack}>
          <small>Back to categories</small>
          <img src={require(`../../images/cat-tags/${slug(catTags[filter[0]].title)}.svg`).default} />
          <div>
            <strong>{catTags[filter[0]].title}</strong>
          </div>
        </div>

      </div>
      }
    </div>
  )
}

export default FilterBar