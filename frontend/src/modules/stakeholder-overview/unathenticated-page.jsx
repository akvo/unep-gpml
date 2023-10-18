import React from 'react'
import { Button, Modal } from 'antd'
import styles from './unathenticated-page.module.scss'
import { Trans } from '@lingui/macro'

const UnathenticatedPage = ({
  unAthenticatedModal,
  setUnathenticatedModal,
  setLoginVisible,
}) => {
  return (
    <Modal
      centered
      className="unathenticated-modal"
      visible={unAthenticatedModal}
      onCancel={() => setUnathenticatedModal(false)}
      maskStyle={{ backgroundColor: 'rgb(24 22 47 / 90%)' }}
      footer={
        <>
          <Button onClick={() => setLoginVisible(true)}>
            <Trans>Sign In</Trans>
          </Button>
        </>
      }
      closable={false}
      maskClosable={false}
      keyboard={false}
    >
      <div className="unathenticated-page">
        <p>
          <Trans>
            You need to have an account and be signed in to see this page
          </Trans>
        </p>
      </div>
    </Modal>
  )
}

export default UnathenticatedPage
