import React, { useState } from 'react'
import { Row, Col, Button, Tooltip } from 'antd'
import { useRouter } from 'next/router'
import useReplacedText from '../../hooks/useReplacePlaceholders'
import PlasticImportExportChart from '../../modules/country-dashboard/charts/PlasticImportExportChart'
import PlasticImportExportTonnesChart from '../../modules/country-dashboard/charts/PlasticImportExportTonnesChart'
import PlasticImportExportPieCharts from '../../modules/country-dashboard/charts/PlasticImportExportPieChart'
import MSWGenerationChart from '../../modules/country-dashboard/charts/MSWGeneration'
import PlasticOceanBeachChart from '../../modules/country-dashboard/charts/PlasticOceanBeachCHart'
import PolicyComponent from './PolicyComponents'
import RequestDataUpdateModal from './RequestDataUpdateModal'
import PlasticCompositionChart from '../../modules/country-dashboard/charts/PlasticCompositionChart'
import Handlebars from 'handlebars'
import useCategories from '../../hooks/useCategories'

const splitTextInHalf = (text) => {
  const words = text.split(' ')
  const halfIndex = Math.ceil(words.length / 2)
  const firstHalf = words.slice(0, halfIndex).join(' ')
  const secondHalf = words.slice(halfIndex).join(' ')
  return [firstHalf, secondHalf]
}

const CountryOverview = () => {
  const router = useRouter()

  const categories = useCategories()

  const selectedCategory = categories.categories.find(
    (c) => c.attributes.categoryId == router.query.categoryId
  )

  const [isModalVisible, setModalVisible] = useState(false)

  const showModal = () => {
    setModalVisible(true)
  }

  const handleClose = () => {
    setModalVisible(false)
  }

  const { placeholders, tooltips, loading } = useReplacedText(
    router.query.country,
    router.query.categoryId,
    selectedCategory?.attributes?.textTemplate?.placeholders
  )

  const template = selectedCategory?.attributes?.textTemplate?.template || ''
  const compiledTemplate = Handlebars.compile(template)

  const categoryText = compiledTemplate({
    ...placeholders,
    country: router.query.country,
  })
  console.log('categoryText', placeholders, categoryText)
  const [firstHalfText, secondHalfText] = splitTextInHalf(categoryText || '')

  return (
    <div style={{ maxWidth: '70%', margin: '0 auto', padding: '16px' }}>
      <Row className="header-row" style={{ marginBottom: '20px' }}>
        <Col xs={24} md={18}>
          <div style={{ marginBottom: '10px' }}>
            <span
              style={{ color: '#6236FF', fontSize: '24px', fontWeight: 'bold' }}
            >
              {decodeURIComponent(router.query.country)?.toUpperCase()}
            </span>
          </div>
        </Col>
        <Col xs={24} md={6} style={{ textAlign: 'center' }}>
          <span style={{ color: '#7C7C7C', fontSize: '14px' }}>
            <span
              style={{
                backgroundColor: '#8E44AD',
                borderRadius: '50%',
                width: '8px',
                height: '8px',
                display: 'inline-block',
                marginRight: '5px',
              }}
            ></span>
            Data last updated: 02-20-22
          </span>
          <Tooltip title="Update country data by sending a request to the GPML Data Hub team.">
            <Button
              class="ant-btn ant-btn-primary ant-btn-sm"
              onClick={showModal}
              style={{
                backgroundColor: '#00f1bf',
                marginLeft: '60px',

                borderColor: '#00f1bf',
                color: 'black',
              }}
            >
              Request Data Update
            </Button>
            <RequestDataUpdateModal
              visible={isModalVisible}
              onClose={handleClose}
            />
          </Tooltip>
        </Col>
      </Row>

      {router.query.categoryId !== 'overview' ? (
        <Row gutter={[16, 16]} style={{ marginBottom: '40px' }}>
          <Col xs={24} md={12}>
            <p
              style={{ fontSize: '16px', color: '#1B2738' }}
              dangerouslySetInnerHTML={{ __html: firstHalfText }}
            />
          </Col>
          <Col xs={24} md={12}>
            <p
              style={{ fontSize: '16px', color: '#1B2738' }}
              dangerouslySetInnerHTML={{ __html: secondHalfText }}
            />
          </Col>
        </Row>
      ) : (
        <Row style={{ marginBottom: '40px', width: '100%' }}>
          <p style={{ fontSize: '16px', color: '#1B2738' }}>
            {'Explore highlighted data to find plastic data.'}
          </p>
        </Row>
      )}

      {router.query.categoryId === 'industry-and-trade' && (
        <>
          <Row style={{ marginBottom: '40px' }}>
            <Col span={24}>
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  padding: '20px',
                  boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                }}
              >
                <PlasticImportExportChart />
              </div>
            </Col>
          </Row>
          <Row style={{ marginBottom: '40px' }}>
            <Col span={24}>
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  padding: '20px',
                  boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                }}
              >
                <PlasticImportExportTonnesChart />
              </div>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  padding: '20px',
                  boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                }}
              >
                <PlasticImportExportPieCharts chartType="import" />
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  padding: '20px',
                  boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                }}
              >
                <PlasticImportExportPieCharts chartType="export" />
              </div>
            </Col>
          </Row>
        </>
      )}

      {router.query.categoryId === 'waste-management' && (
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
              }}
            >
              <MSWGenerationChart />
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
              }}
            >
              <PlasticCompositionChart />
            </div>
          </Col>
        </Row>
      )}

      {router.query.categoryId === 'governance-and-regulations' && (
        <Row>
          <Col span={24}>
            <div
              style={{
                backgroundColor: 'transparent',
                width: '105%',
                paddingRight: '530px',
              }}
            >
              <PolicyComponent replacedText={categoryText.replacedText} />
            </div>
          </Col>
        </Row>
      )}

      {router.query.categoryId === 'environmental-impact' && (
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
              }}
            >
              <PlasticOceanBeachChart />
            </div>
          </Col>
        </Row>
      )}
    </div>
  )
}

export default CountryOverview
