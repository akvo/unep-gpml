import classNames from 'classnames'
import { useEffect, useState } from 'react'
import styles from './index.module.scss'
import { Check, Check2 } from '../../components/icons'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../utils/api'
import ResourceCard from '../../components/resource-card/resource-card'

const KnowledgeHub = () => {
  const [results, setResults] = useState([])
  const themes = [
    { name: 'Plastic Production & Distribution' },
    { name: 'Plastic Consumption' },
    { name: 'Reuse' },
    { name: 'Recycle' },
    { name: 'Waste Management' },
    { name: 'Just Transition of Informal Sector' },
  ]
  const types = [
    { name: 'Technical Resource' },
    { name: 'Technology' },
    { name: 'Action Plan' },
    { name: 'Policy & Legislation' },
    { name: 'Financing Resource' },
    { name: 'Case Studies' },
  ]
  useEffect(() => {
    api.get('/resources').then((d) => {
      setResults(d.data.results)
    })
  }, [])
  return (
    <div className={styles.knowledgeHub}>
      <aside className="filter-sidebar">
        <div className="caps-heading-xs">browse resources by</div>
        <div className="section">
          <h4 className="h-xs w-semi">Theme</h4>
          <div className="filters">
            {themes.map((theme) => (
              <FilterToggle>{theme.name}</FilterToggle>
            ))}
          </div>
        </div>
        <div className="section">
          <h4 className="h-xs w-semi">Resource Type</h4>
          <div className="filters">
            {types.map((type) => (
              <FilterToggle>{type.name}</FilterToggle>
            ))}
          </div>
        </div>
      </aside>
      <div className="results">
        {results?.map((result) => (
          <ResourceCard item={result} />
        ))}
      </div>
    </div>
  )
}

// const ResourceCard = () => {}

const FilterToggle = ({ children }) => {
  const [on, setOn] = useState(false)
  return (
    <div className={classNames('filter', { on })} onClick={() => setOn(!on)}>
      <AnimatePresence>
        {on && (
          <motion.div
            initial={{ width: 0, height: 0, marginRight: 0 }}
            animate={{ width: 9, height: 8, marginRight: 5 }}
            exit={{ width: 0, height: 0, marginRight: 0 }}
          >
            <Check2 />
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </div>
  )
}

export default KnowledgeHub
