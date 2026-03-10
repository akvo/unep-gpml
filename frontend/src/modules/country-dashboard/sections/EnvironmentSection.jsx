import React from 'react'
import { Row, Col } from 'antd'
import dynamic from 'next/dynamic'
import Handlebars from 'handlebars'
import parse, { domToReact } from 'html-react-parser'
import { Tooltip } from 'antd'
import KeyTrends from './KeyTrends'
import ChartCard from '../ChartCard'
import styles from '../CountryOverview.module.scss'

const PlasticOceanBeachChart = dynamic(
  () => import('../charts/PlasticOceanBeachCHart'),
  { ssr: false }
)

const parseInlineStyle = (styleStr) => {
  if (!styleStr) return {}
  const style = {}
  styleStr.split(';').forEach((rule) => {
    const [key, value] = rule.split(':')
    if (key && value) {
      const camelKey = key
        .trim()
        .replace(/-([a-z])/g, (_, c) => c.toUpperCase())
      style[camelKey] = value.trim()
    }
  })
  return style
}

const splitEnvironmentContent = (html) => {
  const secondH4 = html.indexOf('<h4', html.indexOf('<h4') + 1)
  if (secondH4 !== -1) {
    return [html.slice(0, secondH4).trim(), html.slice(secondH4).trim()]
  }
  const parts = html.split('</p>')
  const half = Math.ceil(parts.length / 2)
  return [
    parts.slice(0, half).join('</p>') + '</p>',
    parts.slice(half).join('</p>'),
  ]
}

const EnvironmentSection = React.forwardRef(
  (
    {
      textContent,
      countryData,
      countryName,
      layers,
      layerLoading,
      strapiEnvironmentContent,
    },
    ref
  ) => {
    if (!textContent?.environment && !strapiEnvironmentContent) return null

    const parseOptions = {
      replace: (node) => {
        if (node.name === 'strong' && node.children?.length) {
          const inlineStyle = parseInlineStyle(node.attribs?.style)
          const tooltipText = node.attribs?.['data-tooltip']
          if (tooltipText) {
            return (
              <Tooltip
                title={tooltipText}
                overlayInnerStyle={{
                  backgroundColor: '#fff',
                  color: '#020A5B',
                  borderRadius: '4px',
                }}
              >
                <strong style={{ cursor: 'pointer', ...inlineStyle }}>
                  {domToReact(node.children, parseOptions)}
                </strong>
              </Tooltip>
            )
          }
          if (Object.keys(inlineStyle).length > 0) {
            return (
              <strong style={inlineStyle}>
                {domToReact(node.children, parseOptions)}
              </strong>
            )
          }
        }
        return undefined
      },
    }

    // Strapi content path (non-Excel countries)
    if (strapiEnvironmentContent && !textContent?.environment) {
      return (
        <div
          ref={ref}
          data-section="environment"
          className={styles.dashboardSection}
        >
          <h2 className={styles.sectionTitle}>Plastics in the Environment</h2>

          <Row gutter={[16, 16]} className={styles.chartRow}>
            {/* <Col xs={24} md={12}>
              <div className={styles.textColumn}>
                {strapiEnvironmentContent.firstHalf}
              </div>
            </Col> */}
            {strapiEnvironmentContent.secondHalf && (
              <Col xs={24} md={12}>
                <div className={styles.textColumn}>
                  {strapiEnvironmentContent.secondHalf}
                </div>
              </Col>
            )}
          </Row>

          {/* <ChartCard className={styles.chartCardPadded}>
            <PlasticOceanBeachChart layers={layers} layerLoading={layerLoading} />
          </ChartCard> */}
        </div>
      )
    }

    // JSON content path (Excel countries)
    let leftCol = null
    let rightCol = null

    if (textContent?.environment?.content) {
      const compiled = Handlebars.compile(textContent.environment.content, {
        noEscape: true,
      })
      const html = compiled({ country: countryName || '' })
      const [firstHalf, secondHalf] = splitEnvironmentContent(html)
      leftCol = parse(firstHalf, parseOptions)
      rightCol = secondHalf ? parse(secondHalf, parseOptions) : null
    }

    return (
      <div
        ref={ref}
        data-section="environment"
        className={styles.dashboardSection}
      >
        <h2 className={styles.sectionTitle}>Plastics in the Environment</h2>

        {textContent?.environment?.keyTrends && (
          <KeyTrends
            items={textContent.environment.keyTrends}
            title="Key trends"
            placeholders={{ country: countryName }}
          />
        )}

        {leftCol && (
          <div className="two-cols">
            <div className={styles.textColumn}>{leftCol}</div>
            {rightCol && <div className={styles.textColumn}>{rightCol}</div>}
          </div>
        )}
      </div>
    )
  }
)

EnvironmentSection.displayName = 'EnvironmentSection'
export default EnvironmentSection
