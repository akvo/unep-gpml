import React from 'react'
import { Col, Row, Button, Typography } from 'antd'
const { Title, Link } = Typography
import { Trans, t } from '@lingui/macro'

function AffiliationOption({ handleAffiliationChange, next }) {
  return (
    <>
      <div className="text-wrapper">
        <Title level={2}>
          <Trans>Are you affiliated to an entity?</Trans>
        </Title>
      </div>
      <div className="buttons-wrapper">
        <div>
          <Button
            size="small"
            onClick={() => {
              handleAffiliationChange(false)
              next()
            }}
          >
            <Trans>Yes</Trans>
          </Button>
        </div>
        <div>
          <Button
            size="small"
            onClick={() => {
              handleAffiliationChange(true)
              next(1)
            }}
          >
            <Trans>No</Trans>
          </Button>
          <Title level={5}>
            <Trans>I’m a private citizen</Trans>
          </Title>
        </div>
      </div>
    </>
  )
}

export default AffiliationOption
