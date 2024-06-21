import React, { useEffect, useState } from 'react'
import styles from './index.module.scss'
import Head from 'next/head'
import { Empty, Select, Spin, notification } from 'antd'
import { getStrapiUrl } from '../../../utils/misc'
import axios from 'axios'
import { SearchIcon } from '../../../components/icons'

const categories = ['all', 'online course', 'Masterclass', 'Webinar', 'Other']

function CapacityBuilding() {
  const [items, setItems] = useState([])
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedTags, setSelectedTags] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')

  const strapiURL = getStrapiUrl()

  const handleTagChange = (value) => {
    setSelectedTags(value)
  }

  const handleCategoryChange = (category) => {
    setSelectedCategory(category.toLowerCase())
  }

  useEffect(() => {
    const fetchLearningCentres = async () => {
      setLoading(true)
      try {
        const response = await axios.get(
          `${strapiURL}/api/learning-centres?populate=learning_centre_tags,image`
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
            image: image.data.attributes.url,
            learning_centre_tags: learning_centre_tags.data.map(
              (tag) => tag.attributes.name
            ),
          }
        })
        setLoading(false)
        setItems(simplifiedItems)
      } catch (error) {
        notification.error({
          message: error.response.data
            ? error.response.data.errorDetails
            : 'An error occured',
        })
        setLoading(false)
      }
    }

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

    fetchLearningCentres()
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
        <title>Learning Centre | UNEP GPML Digital Platform</title>
      </Head>
      <div className={`${styles.learningCentre} container`}>
        <h1>Learning Centre</h1>
        <div className="header">
          <div className="categories">
            <ul>
              {categories.map((category) => (
                <li
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
              suffixIcon={<SearchIcon />}
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
      {data.map((item) => (
        <div className="learning-centre-card">
          <img src={item.image} />
          <div className="content">
            <p className="category">{item.category}</p>
            <h2>{item.title}</h2>
            <p className="description">{item.description}</p>
            <div className="tags">
              {item.learning_centre_tags.map((tag) => (
                <span>{tag}</span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default CapacityBuilding
