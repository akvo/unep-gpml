import { Space, Table } from 'antd'
import { useEffect, useState } from 'react'
import api from '../../utils/api'

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
        <a>Migrate</a>
        <a>Delete</a>
      </Space>
    ),
  },
]

const TagView = () => {
  const [dataSource, setDataSource] = useState([])
  useEffect(() => {
    api.get('/tag').then((d) => {
      // console.log(d.data)
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
    })
  }, [])
  return (
    <div className="tag view">
      <Table columns={columns} dataSource={dataSource} />
    </div>
  )
}

export default TagView
