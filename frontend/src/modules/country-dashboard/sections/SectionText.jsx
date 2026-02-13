import React from 'react'
import { Row, Col } from 'antd'
import Handlebars from 'handlebars'
import parse from 'html-react-parser'
import styles from './SectionText.module.scss'

const SectionText = ({ template, placeholders = {} }) => {
  if (!template) return null

  const compiled = Handlebars.compile(template, { noEscape: true })
  const html = compiled(placeholders)

  return (
    <Row className={styles.container}>
      <Col span={24}>
        <div className={styles.content}>
          {parse(html)}
        </div>
      </Col>
    </Row>
  )
}

export default SectionText
