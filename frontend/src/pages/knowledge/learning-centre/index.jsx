import React, { useEffect, useState } from 'react'
import styles from './index.module.scss'
import Head from 'next/head'
import { Empty, Select, Spin, notification } from 'antd'
import { getStrapiUrl } from '../../../utils/misc'
import axios from 'axios'
import { CloseIcon, SearchIcon } from '../../../components/icons'
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry'
import { loadCatalog } from '../../../translations/utils'
import { Trans, t } from '@lingui/macro'
import { useLingui } from '@lingui/react'

function CapacityBuilding({ initialItems }) {
  const [items, setItems] = useState(initialItems)
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedTags, setSelectedTags] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const { i18n } = useLingui()

  const categories = [
    i18n._(t`all`),
    i18n._(t`online course`),
    i18n._(t`Masterclass`),
    i18n._(t`Webinar`),
    i18n._(t`Other`),
  ]

  const strapiURL = getStrapiUrl()

  const handleTagChange = (value) => {
    setSelectedTags(value)
  }

  const handleCategoryChange = (category) => {
    setSelectedCategory(category.toLowerCase())
  }

  useEffect(() => {
    const fetchLearningCentresTags = async () => {
      try {
        const response = await axios.get(
          `${strapiURL}/api/learning-centre-tags`
        )
        const simplifiedItems = response.data.data.map((item) => {
          const { name } = item.attributes
          return {
            name,
          }
        })
        setTags(simplifiedItems)
      } catch (error) {
        if (error) {
          notification.error({
            message: error.response.data
              ? error.response.data.errorDetails
              : 'An error occured',
          })
        }
      }
    }

    fetchLearningCentresTags()
  }, [])

  const filteredItems = items.filter((item) => {
    const tagMatch =
      selectedTags.length === 0 ||
      selectedTags.every((tag) => item.learning_centre_tags.includes(tag))
    const categoryMatch =
      selectedCategory === 'all' ||
      item.category.toLowerCase() === selectedCategory
    return tagMatch && categoryMatch
  })

  return (
    <>
      <Head>
        <title>Learning Centre | Global Plastics Hub</title>
      </Head>
      <div className={`${styles.learningCentre} container`}>
        <h1>
          <Trans>Learning Centre</Trans>
        </h1>
        <div className="header">
          <div className="categories">
            <ul>
              {categories.map((category) => (
                <li
                  key={category}
                  className={`${
                    selectedCategory.toLowerCase() === category.toLowerCase()
                      ? 'selected'
                      : ''
                  }`}
                  onClick={() => handleCategoryChange(category)}
                >
                  {category}
                </li>
              ))}
            </ul>
          </div>
          <div className="filter">
            <Select
              allowClear
              showSearch
              showArrow
              mode="tags"
              placeholder="Filter by tag"
              options={tags.map((item) => ({
                value: item.name,
                label: item.name,
              }))}
              suffixIcon={selectedTags.length === 0 ? <SearchIcon /> : null}
              clearIcon={<CloseIcon />}
              onChange={handleTagChange}
            />
          </div>
        </div>
        <LearningCentreCard data={filteredItems} loading={loading} />
      </div>
    </>
  )
}

const LearningCentreCard = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="flex-container">
        <Spin size="large" />
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex-container">
        <Empty description="No Data" />
      </div>
    )
  }

  return (
    <div class="masonry-grid">
      <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3 }}>
        <Masonry gutter="30px">
          {data.map((item) => (
            <a
              href={item.url}
              className="learning-centre-card"
              key={item.title}
              target="_blank"
            >
              <img src={item.image} />
              <div className="content">
                <p className="category">{item.category}</p>
                <h2>{item.title}</h2>
                <p className="description">{item.description}</p>
                <div className="tags">
                  {item.learning_centre_tags.map((tag, index) => (
                    <span key={`${tag}-${index}`}>{tag}</span>
                  ))}
                </div>
              </div>
            </a>
          ))}
        </Masonry>
      </ResponsiveMasonry>
    </div>
  )
}

export async function getServerSideProps(ctx) {
  const strapiURL = getStrapiUrl()

  const fetchLearningCentres = async () => {
    const response = await axios.get(
      `${strapiURL}/api/learning-centres?populate=learning_centre_tags,image&pagination[pageSize]=40&locale=${ctx.locale}`
    )
    const simplifiedItems = response.data.data.map((item) => {
      const {
        title,
        url,
        Category,
        description,
        image,
        learning_centre_tags,
      } = item.attributes
      return {
        title,
        url,
        description,
        category: Category,
        image: image?.data ? image?.data?.attributes.url : '',
        learning_centre_tags: learning_centre_tags.data.map(
          (tag) => tag.attributes.name
        ),
      }
    })
    return simplifiedItems
  }

  const [items] = await Promise.all([fetchLearningCentres()])

  return {
    props: {
      initialItems: items,
      i18n: await loadCatalog(ctx.locale),
    },
  }
}

export default CapacityBuilding
