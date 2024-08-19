/* eslint-disable react-hooks/exhaustive-deps */
import React, {
  Fragment,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react'
import styles from './style.module.scss'
import { Row, Col, List, Popover, Skeleton } from 'antd'

import {
  InfoCircleOutlined,
  LoadingOutlined,
  DeleteOutlined,
} from '@ant-design/icons'

import api from '../../utils/api'
import { UIStore } from '../../store'
import { titleCase } from '../../utils/string'
import LeftImage from '../../images/sea-dark.jpg'
import uniqBy from 'lodash/uniqBy'
import isEmpty from 'lodash/isEmpty'
import { redirectError } from '../error/error-util'
import { detailMaps } from './mapping'
import moment from 'moment'
import { resourceTypeToTopicType } from '../../utils/misc'
import { multicountryGroups } from '../knowledge-library/multicountry'
import ResourceCards from '../../components/resource-cards/resource-cards'
import Comments from './comment'
import Header from './header'
import StakeholderCarousel from './stakeholder-carousel'
import LocationImage from '../../images/location.svg'
import TransnationalImage from '../../images/transnational.svg'
import CityImage from '../../images/city-icn.svg'
import { getTypeByResource, languageOptions } from '../flexible-forms/view'
import { useRouter } from 'next/router'
import { Trans, t } from '@lingui/macro'

const currencyFormat = (curr) => Intl.NumberFormat().format(curr)

const renderGeoCoverageCountryGroups = (data, countries) => {
  let dataCountries = null
  const subItems = [].concat(
    ...multicountryGroups.map(({ item }) => item || [])
  )
  const newArray = [...new Set([...subItems, ...countries])]
  dataCountries = data['geoCoverageCountryGroups']?.map((x) => {
    return {
      name: newArray.find((it) => it.id === x)?.name,
      countries: newArray.find((it) => it.id === x)?.countries
        ? newArray.find((it) => it.id === x)?.countries
        : [],
    }
  })
  return (
    <>
      {dataCountries.map((item, index) => (
        <span id={index}>
          {(index ? ', ' : ' ') + item.name}{' '}
          {item.countries && item.countries.length > 0 && (
            <Popover
              overlayClassName="popover-multi-country"
              title={''}
              content={
                <ul className="list-country-group">
                  {item.countries.map((name) => (
                    <li id={name.id}>{name.name}</li>
                  ))}
                </ul>
              }
              placement="right"
              arrowPointAtCenter
            >
              <InfoCircleOutlined />
            </Popover>
          )}
        </span>
      ))}
    </>
  )
}
const renderCountries = (data, countries) => {
  let dataCountries = null
  const newArray = [...new Set([...countries])]
  dataCountries = data['geoCoverageCountries']
    ?.map((x) => newArray.find((it) => it.id === x)?.name)
    .join(', ')
  return dataCountries
}

const DetailsView = ({
  match,
  visible,
  serverData,
  serverTranslations,
  type,
  id,
  setLoginVisible,
  setFilterMenu,
  isAuthenticated,
  isServer,
  bookmark2PS,
  onBookmark2PS,
  updateData,
}) => {
  const {
    profile,
    countries,
    languages,
    transnationalOptions,
  } = UIStore.useState((s) => ({
    profile: s.profile,
    countries: s.countries,
    languages: s.languages,
    transnationalOptions: s.transnationalOptions,
  }))
  const router = useRouter()
  const [data, setData] = useState(null)
  const [relations, setRelations] = useState([])
  const [comments, setComments] = useState([])
  const [likes, setLikes] = useState([])
  const [translations, setTranslations] = useState({})
  const [selectedLanguage, setLanguage] = useState('')
  const [loading, setLoading] = useState(false)

  const relation = relations.find(
    (it) =>
      it.topicId === parseInt(id) &&
      it.topic === resourceTypeToTopicType(type.replace('-', '_'))
  )

  const allowBookmark = type !== 'stakeholder' || profile.id !== id

  const handleRelationChange = (relation) => {
    if (!isAuthenticated) {
      setLoginVisible(true)
    }

    if (isAuthenticated && profile.reviewStatus === undefined) {
      setLoginVisible(true)
    }
    if (profile.reviewStatus === 'APPROVED') {
      api.post('/favorite', relation).then((res) => {
        const relationIndex = relations.findIndex(
          (it) => it.topicId === relation.topicId
        )
        if (relationIndex !== -1) {
          setRelations([
            ...relations.slice(0, relationIndex),
            relation,
            ...relations.slice(relationIndex + 1),
          ])
        } else {
          setRelations([...relations, relation])
        }
      })
    }
  }

  useEffect(() => {
    if (type && id && !isServer) {
      api
        .get(`/detail/${type.replace('-', '_')}/${id}`)
        .then((d) => {
          api
            .get(
              `/translations/${
                getTypeByResource(type.replace('-', '_')).translations
              }/${id}`
            )
            .then((resp) => {
              setTranslations({
                ...resp.data,
                summary: resp.data.abstract
                  ? resp.data.abstract
                  : resp.data.remarks
                  ? resp.data.remarks
                  : resp.data.description
                  ? resp.data.description
                  : resp.data.summary,
              })
            })
            .catch((e) => console.log(e))
          setData(d.data)
          setLikes(d.data.likes)
          getComment(id, type.replace('-', '_'))
          setLoading(false)
        })
        .catch((err) => {
          console.error(err)
          // redirectError(err, history);
        })
    } else {
      setData(serverData)
      setTranslations({
        ...serverTranslations,
        summary: serverTranslations.abstract
          ? serverTranslations.abstract
          : serverTranslations.remarks
          ? serverTranslations.remarks
          : serverTranslations.description
          ? serverTranslations.description
          : serverTranslations.summary,
      })
      getComment(id, type.replace('-', '_'))
    }

    if (profile.reviewStatus === 'APPROVED') {
      setTimeout(() => {
        api.get(`/favorite/${type?.replace('-', '_')}/${id}`).then((resp) => {
          setRelations(resp.data)
        })
      }, 100)
    }
    UIStore.update((e) => {
      e.disclaimer = null
    })
    window.scrollTo({ top: 0 })
  }, [router])

  useEffect(() => {
    if (updateData && Object.keys(updateData).length > 0) {
      setData((prevData) => ({
        ...prevData,
        assignedBadges: updateData.assignedBadges,
      }))
    }
  }, [updateData])

  const getComment = async (id, type) => {
    let res = await api.get(
      `/comment?resource_id=${id}&resource_type=${
        type.replace('-', '_') === 'initiative' ? 'initiative' : type
      }`
    )
    if (res && res?.data) {
      setComments(res.data?.comments)
    }
  }
  useEffect(() => {
    if (visible && match?.params?.item !== null) {
      setData(match.params.item)
      setLoading(true)
    }
  }, [visible, match])

  // if (!data) {
  //   return (
  //     <div className="details-view">
  //       <div className="loading">
  //         <LoadingOutlined spin />
  //         <i>
  //           <Trans>Loading...</Trans>
  //         </i>
  //       </div>
  //     </div>
  //   )
  // }

  const description = data?.description ? data?.description : data?.summary

  const entityConnections = data?.entityConnections?.map((entity) => {
    return {
      ...entity,
      name: entity?.entity,
      country: entity?.country || null,
      id: entity?.entityId,
      image: entity?.image,
      type: 'entity',
      role: entity?.role,
    }
  })

  const stakeholderConnections = data?.stakeholderConnections
    ?.filter(
      (it, ind) =>
        data.stakeholderConnections.findIndex(
          (_it) => _it.stakeholderId === it.stakeholderId
        ) === ind
    ) // filter out diplicates
    .sort((a, b) => {
      if (a?.role?.toLowerCase() === 'owner') {
        return -1
      }
    })
    .map((stakeholder) => {
      return {
        ...stakeholder,
        name: stakeholder?.stakeholder,
      }
    })

  return (
    <div className={`${styles.detailViewWrapper} detail-view-wrapper`}>
      <div
        className="detail-view"
        style={!isAuthenticated ? { paddingBottom: '1px' } : { padding: 0 }}
      >
        <Header
          {...{
            data,
            profile,
            isAuthenticated,
            type,
            loading,
            id,
            handleRelationChange,
            relation,
            translations,
            selectedLanguage,
            setLanguage,
            bookmark2PS,
            onBookmark2PS,
            UIStore,
            likes,
            setLikes,
          }}
        />
        {loading && (
          <Row
            style={{ margin: '20px 40px' }}
            gutter={{
              lg: 24,
            }}
          >
            <Skeleton
              paragraph={{
                rows: 7,
              }}
              active
            />
          </Row>
        )}
        {!loading && (
          <Row
            className="resource-info "
            gutter={{
              lg: 24,
            }}
          >
            {data?.image && (
              <a
                className="resource-image-wrapper"
                href={`${
                  data?.url && data?.url?.includes('https://')
                    ? data?.url
                    : data.languages
                    ? data?.languages[0].url
                    : data?.url?.includes('http://')
                    ? data?.url
                    : 'https://' + data?.url
                }`}
                target="_blank"
              >
                <img
                  className="resource-image"
                  id="detail-resource-image"
                  src={data?.image}
                  alt={data?.title}
                />
              </a>
            )}

            <Col className="details-content-wrapper section-description section">
              {description && (
                <Row>
                  <h3 className="content-heading">
                    <Trans>Description</Trans>
                  </h3>
                  <p className="content-paragraph">
                    {selectedLanguage
                      ? translations?.summary[selectedLanguage]
                      : description}
                  </p>
                </Row>
              )}

              <Row>
                {data?.geoCoverageType && (
                  <Col className="section-geo-coverage">
                    <div className="extra-wrapper">
                      <h3 className="content-heading">
                        <Trans>Location & Geocoverage</Trans>
                      </h3>
                      <div
                        style={{
                          marginBottom: data?.geoCoverageType === 'global' && 0,
                        }}
                        className="detail-item geocoverage-item"
                      >
                        <div className="transnational-icon detail-item-icon">
                          <TransnationalImage />
                        </div>
                        <span>{titleCase(data?.geoCoverageType || '')}</span>
                      </div>

                      {data?.geoCoverageType !== 'global' && (
                        <>
                          {data?.geoCoverageType !== 'sub-national' &&
                            data?.geoCoverageType !== 'national' &&
                            (data?.geoCoverageCountryGroups?.length > 0 ||
                              data.geoCoverageCountries.length > 0) &&
                            renderGeoCoverageCountryGroups(
                              data,
                              countries,
                              transnationalOptions
                            ) && (
                              <div className="detail-item">
                                <Row>
                                  <div className="location-icon detail-item-icon">
                                    <LocationImage />
                                  </div>
                                  <div>
                                    {renderGeoCoverageCountryGroups(
                                      data,
                                      countries,
                                      transnationalOptions
                                    )}
                                    {renderCountries(
                                      data,
                                      countries,
                                      transnationalOptions
                                    )}
                                  </div>
                                </Row>
                              </div>
                            )}

                          {(data?.geoCoverageType === 'sub-national' ||
                            data?.geoCoverageType === 'national') &&
                            data?.geoCoverageValues &&
                            data?.geoCoverageValues.length > 0 &&
                            renderCountries(
                              data,
                              countries,
                              transnationalOptions
                            ) && (
                              <div className="detail-item">
                                <Row>
                                  <div className="location-icon detail-item-icon">
                                    <LocationImage />
                                  </div>
                                  <div>
                                    {renderCountries(
                                      data,
                                      countries,
                                      transnationalOptions
                                    )}
                                  </div>
                                </Row>
                              </div>
                            )}

                          {(data?.subnationalCity ||
                            data?.q24SubnationalCity) && (
                            <div className="detail-item">
                              <Row>
                                <div className="city-icon detail-item-icon">
                                  <CityImage />
                                </div>
                                <div>
                                  {data?.subnationalCity
                                    ? data?.subnationalCity
                                    : data?.q24SubnationalCity}
                                </div>
                              </Row>
                            </div>
                          )}
                        </>
                      )}

                      {data?.languages && (
                        <span className="detail-item">
                          {data?.languages
                            .map((language) => {
                              const langs =
                                !isEmpty(languages) &&
                                languages[language?.isoCode]?.name
                              return langs || ''
                            })
                            .join(', ')}
                        </span>
                      )}
                    </div>
                  </Col>
                )}
              </Row>
            </Col>
          </Row>
        )}
        {/* TAGS */}
        {data?.tags && data?.tags?.length > 0 && (
          <Col className="section-tag section">
            <div className="extra-wrapper">
              <h3 className="content-heading">
                <Trans>Tags</Trans>
              </h3>
              <List itemLayout="horizontal">
                <List.Item>
                  <List.Item.Meta
                    title={
                      <ul className="tag-list">
                        {data?.tags &&
                          data?.tags.map((tag) => (
                            <li className="tag-list-item" key={tag?.tag}>
                              <div className="label">
                                <span>{tag?.tag || ''}</span>
                              </div>
                            </li>
                          ))}
                      </ul>
                    }
                  />
                </List.Item>
              </List>
            </div>
          </Col>
        )}

        {/* CONNECTION */}
        {(data?.entityConnections?.length > 0 ||
          data?.stakeholderConnections?.filter(
            (x) => x.stakeholderRole !== 'ADMIN' || x.role === 'interested in'
          )?.length > 0) && (
          <Col className="section section-connection-stakeholder">
            <div className="extra-wrapper">
              <h3 className="content-heading">
                <Trans>Connections</Trans>
              </h3>

              <StakeholderCarousel
                stakeholders={[...entityConnections, ...stakeholderConnections]}
              />
            </div>
          </Col>
        )}

        {/* DOCUMENTS AND INFO */}
        {data?.infoDocs && (
          <Col className="section section-document">
            <div className="extra-wrapper">
              <h3 className="content-heading">
                <Trans>Documents and info</Trans>
              </h3>
              <div className="content-paragraph">
                <div
                  className="list documents-list"
                  dangerouslySetInnerHTML={{
                    __html: selectedLanguage
                      ? translations?.infoDocs[selectedLanguage]
                      : data?.infoDocs,
                  }}
                />
              </div>
            </div>
          </Col>
        )}

        {data != null && !loading && (
          <Records {...{ countries, languages, type, data, profile }} />
        )}

        {/* RELATED CONTENT */}
        {data?.relatedContent &&
          data?.relatedContent?.length > 0 &&
          data?.relatedContent.length > 0 && (
            <Col className="section section-related-content">
              <div className="resource-cards-wrapper">
                <h3 className="related-content-title">
                  <Trans>Related content</Trans>
                </h3>
                <div className="related-content-container">
                  <ResourceCards
                    items={data?.relatedContent}
                    showMoreCardAfter={20}
                    showMoreCardHref={'/knowledge/library'}
                  />
                </div>
              </div>
            </Col>
          )}

        {/* COMMENTS */}
        {!loading && (
          <Comments
            {...{
              profile,
              type,
              id,
              comments,
              getComment,
              setLoginVisible,
              isAuthenticated,
            }}
          />
        )}
      </div>
    </div>
  )
}

const Records = ({ countries, languages, type, data }) => {
  const mapping = detailMaps[type.replace('-', '_')]
  if (!mapping) {
    return
  }
  const renderRow = (item, index) => {
    const {
      key,
      name,
      value,
      type,
      customValue,
      arrayCustomValue,
      currencyObject,
    } = item
    // Set to true to display all country list for global
    const showAllCountryList = false
    const displayEntry =
      data[key] ||
      data[key] === false ||
      data[key] === true ||
      data[key] === 0 ||
      key === null
    // Calculate custom currency value to display
    const [currency, amount, remarks] =
      arrayCustomValue?.map((it) => data[it]) || []

    const customCurrency =
      value === 'custom' &&
      type === 'currency' &&
      (remarks
        ? currency
          ? `${currency} ${currencyFormat(amount)} - ${remarks}`
          : `${currencyFormat(amount)} - ${remarks}`
        : currency
        ? `${currency} ${currencyFormat(amount)}`
        : `${amount}`)

    if (
      (key === 'lifecyclePhase' && data[key]?.length === 0) ||
      (key === 'sector' && data[key]?.length === 0) ||
      (key === 'focusArea' && data[key]?.length === 0)
    ) {
      return false
    }

    return (
      <Fragment key={`${type}-${name}`}>
        {displayEntry && (
          <div key={name + index} className="record-row">
            <div className="record-name">{name}</div>
            <div className="record-value">
              {key === null && type === 'static' && value}
              {value === key && type === 'name' && data[key] === false && 'No'}
              {value === key && type === 'name' && data[key] === true && 'Yes'}
              {value === key &&
                (type === 'name' ||
                  type === 'string' ||
                  type === 'number' ||
                  type === 'object') &&
                (data[value].name || data[value])}
              {currencyObject && data[currencyObject.name]
                ? `${data[currencyObject.name]?.[0]?.name?.toUpperCase()} `
                : ''}
              {value === key &&
                type === 'currency' &&
                currencyFormat(data[value])}
              {value === key &&
                type === 'date' &&
                data[key] !== 'Ongoing' &&
                moment(data[key]).format('DD MMM YYYY')}
              {value === key &&
                type === 'date' &&
                data[key] === 'Ongoing' &&
                data[key]}
              {value === key &&
                type === 'array' &&
                data[key].map((x) => x.name).join(', ')}
              {value === key &&
                type === 'country' &&
                countries.find((it) => it.id === data[key]).name}
              {value === 'custom' &&
                type === 'object' &&
                data[key][customValue]}
              {value === 'custom' &&
                type === 'startDate' &&
                moment.utc(data[arrayCustomValue[0]]).format('DD MMM YYYY')}
              {value === 'custom' &&
                type === 'endDate' &&
                moment.utc(data[arrayCustomValue[0]]).format('DD MMM YYYY')}

              {data[key] &&
                value === 'isoCode' &&
                type === 'array' &&
                uniqBy(data[key], 'isoCode')
                  .map((x, i) => languages[x.isoCode].name)
                  .join(', ')}
              {key === 'tags' &&
                data[key] &&
                value === 'join' &&
                type === 'array' &&
                data[key].map((tag) => Object.values(tag)[0]).join(', ')}
              {key !== 'tags' &&
                type === 'initiative' &&
                data[key] &&
                value === 'join' &&
                type === 'array' &&
                data[key]?.length !== 0 &&
                data[key]?.map((x) => x.name).join(', ')}
              {key !== 'tags' &&
                type !== 'initiative' &&
                data[key] &&
                value === 'join' &&
                type === 'array' &&
                data[key].join(', ')}
              {type === 'initiative' &&
                value === 'custom' &&
                type === 'array' &&
                data[key][customValue] &&
                data[key][customValue]?.map((x) => x.name).join(', ')}
              {type !== 'initiative' &&
                value === 'custom' &&
                type === 'array' &&
                data[key][customValue] &&
                data[key][customValue].join(', ')}

              {customCurrency}
            </div>
          </div>
        )}
      </Fragment>
    )
  }
  return (
    <Col className="record-section section">
      <h3 className="content-heading">
        <Trans>Records</Trans>
      </h3>
      <div>
        <div className="record-table">
          <div>{countries && mapping.map(renderRow)}</div>
        </div>
      </div>
    </Col>
  )
}

export default DetailsView
