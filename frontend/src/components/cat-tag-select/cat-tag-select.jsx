import { Select } from 'antd'
import catTags from '../../utils/cat-tags.json'
import './style.scss'

const CatTagSelect = () => (
  <div className="cat-tag-select">
    <Select
      // open={true}
      placeholder="Choose categories"
      // dropdownMatchSelectWidth={false}
      dropdownRender={(menu) => (
        <CategorisedTags />
      )}
    />
  </div>
)
function slug(text) {
  return text.toLowerCase().replaceAll('&', 'n').replaceAll(' ', '-')
}
const CategorisedTags = () => {
  return (
      <ul className="cat-tag-dropdown">
      {catTags.map(cat => (
        <li>
          <h4>{cat.title}</h4>
          <ul>
            {cat.topics.map(tag =>
              <li>
                <div className="img-container">
                  <img src={require(`../../images/cat-tags/${slug(tag)}.svg`).default} />
                </div>
                <div className="label-container">
                  <span>{tag}</span>
                </div>
              </li>
            )}
          </ul>
        </li>
      ))}
      </ul>
  )
}

export default CatTagSelect