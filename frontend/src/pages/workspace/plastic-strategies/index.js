import { useCallback, useEffect, useState } from 'react'
import { Trans } from '@lingui/macro'
import styles from './index.module.scss'
import api from '../../../utils/api'
import SkeletonItems from '../../../modules/workspace/ps/skeleton-items'
import { PSCard } from '../../../modules/workspace/view'
import { UIStore } from '../../../store'
import { loadCatalog } from '../../../translations/utils'
import Button from '../../../components/button'
import { Input, Modal, Select } from 'antd'

const View = () => {
  const [psAll, setPSAll] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const profile = UIStore.useState((s) => s.profile)
  const isAdmin = profile?.role === 'ADMIN'

  const getPSAll = useCallback(async () => {
    try {
      if (profile?.id) {
        const { data: plasticsStrategies } = await api.get('/plastic-strategy')
        setPSAll(plasticsStrategies)
        setLoading(false)
      }
    } catch (error) {
      console.error('Unable to fetch plastics strategy:', error)
      setLoading(false)
    }
  }, [profile])

  useEffect(() => {
    getPSAll()
  }, [getPSAll])

  return (
    <div className={styles.psView}>
      <div className="container">
        <div className="ps-heading">
          <h2 className="h-xxl w-bold">
            <Trans>National Source Inventories</Trans>
          </h2>
          <Button type="ghost" onClick={() => setShowAddModal(true)}>
            + Add New
          </Button>
        </div>
        <SkeletonItems loading={loading} />
        <ul className="plastic-strategies-items">
          {psAll.map((item, index) => (
            <PSCard key={index} {...{ item, isAdmin }} />
          ))}
        </ul>
      </div>
      <AddModal {...{ showAddModal, setShowAddModal }} />
    </div>
  )
}

const AddModal = ({ showAddModal, setShowAddModal }) => {
  const { countries } = UIStore.currentState
  const [value, setValue] = useState(null)
  return (
    <Modal
      visible={showAddModal}
      title="Add A National Source Inventory"
      onCancel={() => setShowAddModal(false)}
      className={styles.psModal}
    >
      <Select
        value={value}
        size="small"
        onChange={(val) => setValue(val)}
        filterOption={(input, option) =>
          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
        placeholder="Countries"
        allowClear
        showSearch
      >
        {countries
          .filter(
            (country) => country.description.toLowerCase() === 'member state'
          )
          .map((it) => (
            <Option key={it.id} value={it.id}>
              {it.name}
            </Option>
          ))}
      </Select>
    </Modal>
  )
}

export const getStaticProps = async (ctx) => {
  return {
    props: {
      i18n: await loadCatalog(ctx.locale),
    },
  }
}

export default View
