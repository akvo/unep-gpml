import React, { useEffect, useState } from 'react'
import { Image } from 'antd'
import styles from './styles.module.scss'
import issueGraphics from './issue-section-content'
import { UIStore } from '../../store'
import sumBy from 'lodash/sumBy'
import isEmpty from 'lodash/isEmpty'
import api from '../../utils/api'
import Link from 'next/link'
import { Trans } from '@lingui/macro'
import Button from '../../components/button'

const summary = [
  {
    name: 'Data Layers',
    value: [],
    startValue: '300+',
    increment: '12',
  },
]

const AboutUs = () => {
  const { nav, stakeholders } = UIStore.useState((s) => {
    return { nav: s.nav, stakeholders: s?.stakeholders }
  })

  const [resourcesCount, setResourcesCount] = useState([])
  const [entityCount, setEntityCount] = useState(0)
  const [stakeholdersCount, setStakeholdersCount] = useState([])
  const [summary, setSummary] = useState([])
  const totalResources = resourcesCount.reduce(
    (acc, val) => acc + Number(val?.count),
    0
  )

  const getEntityCount = () => {
    api
      .get(`/community`)
      .then((resp) => {
        const entity = resp?.data?.counts.filter(
          (item) => item?.networkType === 'organisation'
        )

        setEntityCount(entity[0].count || 0)
      })
      .catch((err) => {
        console.error(err)
      })
  }

  const getResourceCount = () => {
    const topic = [
      'action_plan',
      'initiative',
      'policy',
      'technical_resource',
      'technology',
      'event',
      'financing_resource',
    ]
    api
      .get(`/browse?topic=${topic}`)
      .then((resp) => {
        const data = resp?.data?.counts.filter(
          (item) =>
            item?.topic !== 'gpml_member_entities' &&
            item?.topic !== 'plastics' &&
            item?.topic !== 'waste management' &&
            item?.topic !== 'marine litter' &&
            item?.topic !== 'capacity building' &&
            item?.topic !== 'product by design' &&
            item?.topic !== 'source to sea'
        )
        setResourcesCount(data)
        // setEntityCount(GPMLMember[0].count || 0);
      })
      .catch((err) => {
        console.error(err)
      })
  }

  useEffect(() => {
    getEntityCount()
    getResourceCount()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setStakeholdersCount(
      (stakeholders?.stakeholders?.length || 0) + entityCount
    )
  }, [stakeholders, entityCount])

  return (
    <div className={styles.aboutUs}>
      {renderSectionIssue()}
      {renderSectionSummary(nav, totalResources, stakeholdersCount)}
      {renderSectionMission()}
      {renderSectionInfo()}
      {renderSectionTimelineAndRoadmap()}
      {renderSectionKeyFeaturesAndComponents()}
      {renderSectionCommunity()}
      {renderSectionHistory()}
    </div>
  )
}

const renderSectionIssue = () => {
  const renderIssueGraphic = () => {
    return issueGraphics.map((x, i) => {
      const { title, image, description } = x
      return (
        <div className="item" key={`issue-${i}`}>
          <div className="item-title text-white">{title}</div>
          <div className="item-box">
            {image && <div className="item-svg">{image}</div>}
            {!image && <img src="/image-not-found.png" />}
            <div className="item-description text-white">{description}</div>
          </div>
        </div>
      )
    })
  }
  return (
    <div className="section-container section-issue-container">
      <div className="ui container section-issue-wrapper">
        <div className="section-issue-text">
          <h2 className="text-green">
            <Trans>The Issue: Marine Litter & Plastic Pollution</Trans>
          </h2>
          <p className="txt-emphasis text-white">
            <Trans>
              Marine liter and plastic pollution is one of the biggest
              environmental problems we face. Managing the problem requires
              urgent cooperation. Find out more below.
            </Trans>
          </p>
          <div className="btn-wrapper">
            {/* Removed for now
            <Button type="ghost">Vital graphics</Button> */}
            <Button
              ghost
              onClick={(e) => {
                window.location.href = 'https://www.cleanseas.org/'
              }}
            >
              <Trans>Clean Seas</Trans>
            </Button>
          </div>
        </div>
        <div className="section-issue-graphic">
          <img src="/GPML-dp-icons.png" />
        </div>
      </div>
    </div>
  )
}

const renderSectionSummary = (nav, totalResources, stakeholderCount) => {
  const renderSummary = (nav) => {
    const isLoaded = () => Boolean(!isEmpty(nav))

    return summary.map((x, i) => {
      const { name, value, startValue } = x
      const navData =
        isLoaded() &&
        nav?.resourceCounts
          ?.filter((x) => value.includes(Object.keys(x)[0]))
          .map((x) => {
            return {
              name: Object.keys(x)[0],
              count: x[Object.keys(x)[0]],
            }
          })

      const total = sumBy(navData, 'count')

      return (
        <div className="item" key={`summary-${i}`}>
          <div className="item-name text-green">{name}</div>
          <div className="item-value text-white">
            {isLoaded() ? total || startValue : 0}
          </div>
        </div>
      )
    })
  }
  return (
    <div className="section-container section-summary-container">
      <div className="ui container section-summary-wrapper">
        <div className="item">
          <div className="item-name text-green">
            <Trans>GPML Community</Trans>
          </div>
          <div className="item-value text-white">{stakeholderCount}</div>
        </div>
        {renderSummary(nav)}
        <div className="item">
          <div className="item-name text-green">
            <Trans>Resources</Trans>
          </div>
          <div className="item-value text-white">{totalResources}</div>
        </div>
      </div>
    </div>
  )
}

const renderSectionMission = () => {
  return (
    <div className="section-container section-mission-container">
      <div className="ui container section-mission-wrapper">
        <div className="section-mission-text">
          <h2 className="text-green">
            <Trans>
              Global Partnership on Plastic Pollution and Marine Litter (GPML)
            </Trans>
          </h2>
          <p className="txt-emphasis text-white">
            <Trans>
              Global Partnership on Plastic Pollution and Marine Litter (GPML)
              was launched at the United Nations Conference on Sustainable
              Development (Rio+20) in June 2012, in response to a request set
              out in the Manila Declaration on ‘Furthering the Implementation of
              the Global Programme of Action for the Protection of the Marine
              Environment from Land-based Activities’. The partnership is led by
              a Steering Committee and the United Nations Environment Programme
              (UNEP) provides secretariat services.
            </Trans>
          </p>
          <p className="txt-emphasis text-white">
            <Trans>
              The GPML is a multi-stakeholder partnership that brings together
              all actors working to address marine litter and plastic pollution.
              By providing a unique global platform to share knowledge and
              experience, partners can work together to create and advance
              solutions to this pressing global issue.
            </Trans>
          </p>
          <Button
            onClick={(e) => {
              window.location.href = 'https://www.gpmarinelitter.org/'
            }}
          >
            <Trans>Go to the partnership</Trans>
          </Button>
        </div>
      </div>
    </div>
  )
}

const renderSectionInfo = () => {
  return (
    <div className="section-container section-info-container">
      <div className="ui container section-info-wrapper">
        <div className="section-info-text">
          <h2 className="text-green">
            <Trans>The Digital Platform</Trans>
          </h2>
          <p className="txt-emphasis text-white">
            <Trans>
              The GPML Digital Platform drives transformation and supports the
              work of the GPML Action Tracks. The Digital Platform is
              multi-stakeholder and partly open source, compiling and
              crowdsourcing different resources, integrating data and connecting
              stakeholders to guide action on addressing the global problem of
              marine litter and plastic pollution.
            </Trans>
          </p>
        </div>
        <div className="section-info-button-wrapper">
          <a target="_blank" href="/GPML_One-pager.pdf" className="doc-wrapper">
            <img src="/summary-doc.png" alt="summary-document" />
            <Button type="ghost" className="btn-item">
              <Trans>Download Summary (1 Page)</Trans>
            </Button>
          </a>
          <a
            target="_blank"
            href="https://wedocs.unep.org/bitstream/handle/20.500.11822/34453/UNEP%20GPML%20Digital%20Platform%20Concept%20for%20User%20and%20Partner%20Consultations%20May%202021.pdf"
            className="doc-wrapper"
          >
            <img src="/full-concept-doc.png" alt="full-concept-document" />
            <Button type="ghost" className="btn-item">
              <Trans>Download Full Concept Document</Trans>
            </Button>
          </a>
        </div>
      </div>
    </div>
  )
}

const renderSectionTimelineAndRoadmap = () => {
  return (
    <div className="section-container section-timeline-roadmap-container">
      <div className="ui container section-timeline-roadmap-wrapper">
        <div className="section-timeline-roadmap-text">
          <h2 className="text-blue">
            <Trans>Timeline & Roadmap</Trans>
          </h2>
          <p className="txt-emphasis text-blue">
            <Trans>
              The release of an initial minimum viable product (MVP), or “Phase
              1”, took place in February 2021, where a beta version of the GPML
              Digital Platform was made available. Following this, an iterative,
              user-centered design process is using techniques such as
              interviews, surveys and workshops to collect feedback from users
              to inform new versions of the Digital Platform. <br />
            </Trans>
          </p>
          <p className="txt-emphasis text-blue">
            <Trans>
              A series of phased releases, informed by user-centered design,
              will culminate in a final version in June 2023. Interim versions
              will enhance existing features and develop new ones in preparation
              for key events, including UNEA-5.2 dialogues and the 7th
              International Marine Debris Conference (7IMDC) planned for 2022,
              as well as UNEA-6, expected to be held in early 2023.
            </Trans>
          </p>
          <Button
            size="small"
            onClick={(e) => {
              window.location.href =
                'https://wedocs.unep.org/bitstream/handle/20.500.11822/34453/UNEP%20GPML%20Digital%20Platform%20Concept%20for%20User%20and%20Partner%20Consultations%20May%202021.pdf'
            }}
          >
            <Trans>Learn More</Trans>
          </Button>
        </div>
      </div>
      <div className="section-timeline-roadmap-graphic">
        <img src="/timeline-roadmap-graphic.png" />
      </div>
    </div>
  )
}

const renderSectionKeyFeaturesAndComponents = () => {
  return (
    <div className="section-container section-feature-component-container">
      <div className="ui container section-feature-component-wrapper">
        <div className="section-feature-component-text">
          <h2 className="text-green">
            <Trans>Key Features & Components</Trans>
          </h2>
          <p className="txt-emphasis text-white">
            <Trans>
              Features of the GPML Digital Platform are made available via 3
              primary components.
            </Trans>
          </p>
          <p className="txt-emphasis text-white">
            <Trans>
              The Platform supports interlinkages between the different
              components to ensure a user-friendly experience and access to all
              functionalities and resources through links to internal and
              external databases, datasets and key partner platforms, such as
              the World Environment Situation Room (WESR).
            </Trans>
          </p>
          <Button
            size="small"
            onClick={(e) => {
              window.location.href =
                'https://wedocs.unep.org/bitstream/handle/20.500.11822/34453/UNEP%20GPML%20Digital%20Platform%20Concept%20for%20User%20and%20Partner%20Consultations%20May%202021.pdf'
            }}
          >
            <Trans>Learn More</Trans>
          </Button>
        </div>
        <div className="section-feature-component-graphic">
          <img src="/feature-component-graphic.png" />
        </div>
      </div>
    </div>
  )
}

const renderSectionCommunity = () => {
  return (
    <div className="section-container section-community-container">
      <div className="ui container section-community-wrapper">
        <div className="section-community-text">
          <h2 className="text-green">
            <Trans>Our community</Trans>
          </h2>
          <p className="txt-emphasis text-white">
            <Trans>
              The GPML Digital Platforms seeks to connect, inform and inspire
              all actors working to address marine litter and plastic pollution.
              Join our community of stakeholders, which includes: governments;
              scientific and technological community and academia; business,
              industry and private sector; non-governmental organizations (NGOs)
              and foundations; intergovernmental organizations (IGOs); all
              actors participating in global/regional multilateral processes;
              other major groups and stakeholders; and private citizens.
            </Trans>
          </p>
          <Link href="/onboarding" legacyBehavior>
            <a>
              <Button type="ghost">
                <Trans>Sign up to find out more</Trans>
              </Button>
            </a>
          </Link>
        </div>
      </div>
      <div className="section-community-graphic">
        <img src="/about-our-community.png" />
      </div>
    </div>
  )
}

const renderSectionHistory = () => {
  return (
    <div className="section-container section-history-container">
      <div className="ui container section-history-wrapper">
        <div className="section-history-text">
          <h2 className="text-green">
            <Trans>The History of the GPML</Trans>
          </h2>
          <p className="txt-emphasis text-blue">
            <Trans>
              In 2019, the United Nations Environment Assembly (UNEA) decided in
              resolution UNEP/EA.4/Res.6 operative paragraph 3: “to strengthen
              coordination and cooperation by establishing, subject to the
              availability of resources and building on existing initiatives, a
              multi-stakeholder platform within the United Nations Environment
              Programme to take immediate action towards the long-term
              elimination, through a lifecycle approach, of discharges of litter
              and microplastics into the oceans”. The GPML Digital Platform was
              developed in 2021 in response to this and seeks to support
              transformative, multi-stakeholder actions that target the causes
              of pollution towards a pollution-free planet, where pollution is
              prevented and controlled and good environmental quality and
              improved health and well-being are ensured for all. Overall, the
              work of the GPML will support UNEP’s Medium-Term Strategy by
              supporting countries to deliver on their environmental commitments
              under international agreements.
            </Trans>
          </p>
        </div>
      </div>
      <div className="section-history-graphic">
        <img src="/GPML-history.png" />
      </div>
    </div>
  )
}

export default AboutUs
