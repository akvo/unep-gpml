
import { Button, Dropdown, Menu } from "antd";
import { Icon } from "../../components/svg-icon/svg-icon";
import { ReactComponent as FilterIcon } from "../../images/knowledge-library/filter-icon.svg";
import { ReactComponent as OverviewIcon } from "../../images/overview.svg";
import { ReactComponent as GlobeIcon } from "../../images/transnational.svg";

const resourceTypes = [
  {key: 'technical-resource', label: 'Technical Resources'},
  { key: 'event', label: 'Events' },
  { key: 'technology', label: 'Technology'},
  { key: 'capacity-building', label: 'Capacity Building'},
  { key: 'initiative', label: 'Initiatives' },
  { key: 'action-plan', label: 'Policy' },
  { key: 'policy', label: 'Policy' },
  { key: 'financing-resource', label: 'Financing Resources' }
]

const FilterBar = ({ view, setView, filter, setFilter }) => {
  const handleClickFilter = (key) => () => {
    if(filter.indexOf(key) === -1){
      setFilter([...filter, key])
    } else {
      setFilter(filter.filter(it => it !== key))
    }
    if(view === 'overview'){
      setView('map')
    }
  }
  const handleClickOverview = () => {
    setView('overview')
    setFilter([])
  }
  return (
    <div className="filter-bar">
      <Button className={view === 'overview' && 'selected'} onClick={handleClickOverview}>
        <OverviewIcon />
        <span>Overview</span>
      </Button>
      <ul>
        {resourceTypes.map(it => (
          <li onClick={handleClickFilter(it.key)} className={filter.indexOf(it.key) !== -1 && 'selected'}>
            <div className="img-container">
              <Icon name={`resource-types/${it.key}`} fill="#FFF" />
            </div>
            <div className="label-container">
              <span>{it.label}</span>
            </div>
          </li>
        ))}
      </ul>
      <Button>
        <FilterIcon />
        <span>More Filters</span>
      </Button>
      <Button>
        <GlobeIcon />
        <span>Location</span>
      </Button>
    </div>
  )
}

export default FilterBar
