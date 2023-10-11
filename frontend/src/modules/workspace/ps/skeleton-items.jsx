import { Skeleton } from 'antd'

const SkeletonItems = ({ loading }) => {
  if (!loading) {
    return null
  }
  return (
    <>
      <Skeleton
        loading={loading}
        paragraph={{ rows: 1 }}
        style={{ margin: '16px 0 24px' }}
        active
      />
      <ul className="plastic-strategies-items">
        {Array.from({ length: 3 }).map((_, index) => (
          <li key={index}>
            <Skeleton loading={loading} active>
              <Skeleton.Input />
              <Skeleton.Button />
              <Skeleton.Button block />
            </Skeleton>
          </li>
        ))}
      </ul>
    </>
  )
}

export default SkeletonItems
