import React from 'react'
import { Row, Col, Tooltip } from 'antd'
import Handlebars from 'handlebars'
import parse, { domToReact } from 'html-react-parser'
import styles from './SectionText.module.scss'

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

const SectionText = ({ template, placeholders = {} }) => {
  if (!template) return null

  const compiled = Handlebars.compile(template, { noEscape: true })
  const html = compiled(placeholders)

  const parseOptions = {
    replace: (node) => {
      if (node.name === 'strong' && node.children?.length) {
        const text = node.children.map((c) => c.data || '').join('')
        const inlineStyle = parseInlineStyle(node.attribs?.style)
        const tooltipText = node.attribs?.['data-tooltip']

        // Only show tooltip if data-tooltip attribute is present
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

        // Render styled strong without tooltip
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

  return (
    <Row className={styles.container}>
      <Col span={24}>
        <div className={styles.content}>
          {parse(html, parseOptions)}
        </div>
      </Col>
    </Row>
  )
}

export default SectionText
