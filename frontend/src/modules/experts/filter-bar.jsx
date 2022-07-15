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
  const handleClick1 = (tag) => () => {
    let tagfilters = [...(filter[1] || [])]
    if(tagfilters.findIndex(it => it === tag) > -1){
      tagfilters = tagfilters.filter(it => it !== tag)
    } else {
      tagfilters = [...tagfilters, tag]
    }
    setFilter([filter[0], tagfilters])
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
        <div className={`selected-btn s${filter[0]}`} onClick={handleBack}>
          <small>&lt; Back to categories</small>
          <img src={require(`../../images/cat-tags/${slug(catTags[filter[0]].title)}.svg`).default} />
          <div>
            <strong>{catTags[filter[0]].title}</strong>
            <small>Sub-topics</small>
          </div>
        </div>
        <ul>
          {catTags[filter[0]].topics
            .map((tag) => (
              <li onClick={handleClick1(tag)} className={filter[1] && filter[1].indexOf(tag) > -1 && 'selected'}>
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
      </div>
      }
    </div>
  )
}

export default FilterBar