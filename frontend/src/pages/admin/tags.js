import { Table, Space, Modal, message, notification, Input, Select } from 'antd'
import { useEffect, useState } from 'react'
import api from '../../utils/api'
import { SearchIcon } from '../../components/icons'
import styles from './index.module.scss'

const { confirm } = Modal

const TagView = () => {
  const [dataSource, setDataSource] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [selectedTags, setSelectedTags] = useState({ tag1: null, tag2: null })

  const showMigrateModal = (record) => {
    setIsModalVisible(true)
    setSelectedTags((prevTags) => ({
      ...prevTags,
      tag1: record.id,
    }))
  }

  useEffect(() => {
    api.get('/tag').then((d) => {
      let allTags = []
      Object.keys(d.data).forEach((category) => {
        allTags = [
          ...allTags,
          ...d.data[category].map((it) => ({
            ...it,
            category: category
              .replace(/([a-z])([A-Z])/g, '$1 $2')
              .toLowerCase(),
          })),
        ]
      })
      setDataSource(allTags)
      setFilteredData(allTags)
    })
  }, [])

  const handleSearch = (value) => {
    setSearchTerm(value.toLowerCase())
    filterData(value, categoryFilter)
  }

  const handleCategoryChange = (value) => {
    setCategoryFilter(value)
    filterData(searchTerm, value)
  }

  const filterData = (searchValue, categoryValue) => {
    const filtered = dataSource.filter((item) => {
      const matchesSearch = item.tag.toLowerCase().includes(searchValue)
      const matchesCategory = categoryValue
        ? item.category === categoryValue
        : true
      return matchesSearch && matchesCategory
    })
    setFilteredData(filtered)
  }

  const handleMigrate = () => {
    const { tag1, tag2 } = selectedTags
    if (tag1 && tag2) {
      api
        .post('/tag-migration', { tag1, tag2 })
        .then(() => {
          notification.success({ message: 'Tags migrated successfully' })
          setIsModalVisible(false)
          setSelectedTags({ tag1: null, tag2: null })
        })
        .catch(() => {
          message.error('Failed to migrate tags')
        })
    } else {
      message.warning('Please select both tags for migration')
    }
  }

  const handleTagChange = (value, field) => {
    setSelectedTags((prevTags) => ({
      ...prevTags,
      [field]: value,
    }))
  }

  const columns = [
    {
      title: 'Name',
      dataIndex: 'tag',
      key: 'tag',
      filterSearch: true,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      sorter: (a, b) => a.category.length - b.category.length,
      sortDirections: ['descend', 'ascend'],
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <a onClick={() => showMigrateModal(record)}>Migrate</a>
          <a onClick={() => showDeleteConfirm(record)}>Delete</a>
        </Space>
      ),
    },
  ]

  const showDeleteConfirm = (record) => {
    confirm({
      title: 'Are you sure you want to delete this tag?',
      content: `Tag: ${record.tag}`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      cancelButtonProps: {
        type: 'link',
        size: 'small',
      },
      okButtonProps: {
        size: 'small',
      },
      okType: 'default',
      onOk() {
        return api
          .delete(`/tag/delete/${record.id}`)
          .then(() => {
            notification.success({ message: 'Tag deleted successfully' })
            setDataSource((prevData) => {
              const updatedData = prevData.filter(
                (item) => item.id !== record.id
              )

              const updatedFilteredData = updatedData.filter((item) => {
                const matchesSearch = searchTerm
                  ? item.tag.toLowerCase().includes(searchTerm.toLowerCase())
                  : true
                const matchesCategory = categoryFilter
                  ? item.category === categoryFilter
                  : true
                return matchesSearch && matchesCategory
              })

              setFilteredData(updatedFilteredData)

              return updatedData
            })
          })
          .catch((error) => {
            message.error('Failed to delete tag')
          })
      },
    })
  }

  const uniqueCategories = [...new Set(dataSource.map((item) => item.category))]

  return (
    <div className="tag view">
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Search by tag name"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ width: 300 }}
        />
        <Select
          size="small"
          showSearch
          placeholder="Filter by category"
          allowClear
          showArrow
          suffixIcon={<SearchIcon />}
          onChange={handleCategoryChange}
          style={{ width: 300 }}
        >
          {uniqueCategories.map((category) => (
            <Option key={category} value={category}>
              {category}
            </Option>
          ))}
        </Select>
      </Space>
      <Table columns={columns} dataSource={filteredData} rowKey="id" />
      {isModalVisible && (
        <MigrationModal
          {...{
            isModalVisible,
            setIsModalVisible,
            handleMigrate,
            selectedTags,
            dataSource,
            handleTagChange,
          }}
        />
      )}
    </div>
  )
}

const MigrationModal = ({
  isModalVisible,
  handleMigrate,
  setIsModalVisible,
  selectedTags,
  dataSource,
  handleTagChange,
}) => {
  const uniqueTags = dataSource.map((tag) => ({ id: tag.id, name: tag.tag }))
  return (
    <Modal
      title="Migrate Tags"
      visible={isModalVisible}
      onOk={handleMigrate}
      onCancel={() => setIsModalVisible(false)}
      cancelButtonProps={{ type: 'link' }}
      okText="Migrate"
      className={styles.migrationModal}
    >
      <div className="wrapper">
        <Select
          size="small"
          showSearch
          allowClear
          showArrow
          suffixIcon={<SearchIcon />}
          placeholder="Select first tag"
          onChange={(value) => handleTagChange(value, 'tag1')}
          value={selectedTags.tag1}
          style={{ width: '100%' }}
          optionFilterProp="children"
        >
          {uniqueTags.map((tag) => (
            <Option
              key={tag.id}
              value={tag.id}
              disabled={tag.id === selectedTags.tag2}
            >
              {tag.name}
            </Option>
          ))}
        </Select>
        <Select
          size="small"
          showSearch
          allowClear
          showArrow
          suffixIcon={<SearchIcon />}
          placeholder="Select second tag"
          onChange={(value) => handleTagChange(value, 'tag2')}
          value={selectedTags.tag2}
          style={{ width: '100%' }}
          optionFilterProp="children"
        >
          {uniqueTags.map((tag) => (
            <Option
              key={tag.id}
              value={tag.id}
              disabled={tag.id === selectedTags.tag1}
            >
              {tag.name}
            </Option>
          ))}
        </Select>
      </div>
    </Modal>
  )
}

export default TagView
