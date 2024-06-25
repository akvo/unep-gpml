import React, { useEffect, useState } from 'react'
import styles from './index.module.scss'
import Head from 'next/head'
import { Empty, Select, Spin, notification } from 'antd'
import { getStrapiUrl } from '../../../utils/misc'
import axios from 'axios'
import { CloseIcon, SearchIcon } from '../../../components/icons'
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry'
import Link from 'next/link'

const categories = ['all', 'online course', 'Masterclass', 'Webinar', 'Other']

function CapacityBuilding({ initialItems, initialTags }) {
  const [items, setItems] = useState(initialItems)
  const [tags, setTags] = useState(initialTags)
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

export async function getStaticProps() {
  const strapiURL = getStrapiUrl()

  const fetchLearningCentres = async () => {
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
    return simplifiedItems
  }

  const fetchLearningCentresTags = async () => {
    const response = await axios.get(`${strapiURL}/api/learning-centre-tags`)
    const simplifiedTags = response.data.data.map((item) => {
      const { name } = item.attributes
      return { name }
    })
    return simplifiedTags
  }

  const [items, tags] = await Promise.all([
    fetchLearningCentres(),
    fetchLearningCentresTags(),
  ])

  return {
    props: {
      initialItems: items,
      initialTags: tags,
    },
    revalidate: 60,
  }
}

export default CapacityBuilding
