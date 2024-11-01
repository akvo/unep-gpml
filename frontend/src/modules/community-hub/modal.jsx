/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react'
import { Modal } from 'antd'
import styles from './style.module.scss'
import DetailsView from './detail-view'
import bodyScrollLock from '../details-page/scroll-utils'
import { CloseIcon } from '../../components/icons'

const DetailModal = ({
  setLoginVisible,
  isAuthenticated,
  visible,
  setVisible,
  openItem,
}) => {
  const desktopViewport =
    typeof window !== 'undefined' ? window.innerWidth > 600 : null
  return (
    <Modal
      zIndex={1000}
      visible={visible}
      onCancel={() => {
        setVisible(false)
        bodyScrollLock.disable()
      }}
      closable
      className={styles.detailModal}
      width={800}
      closeIcon={<CloseIcon />}
      wrapClassName="detail-modal-wrapper"
      destroyOnClose={true}
      centered={desktopViewport ? false : true}
      style={{
        top: desktopViewport ? 30 : 0,
      }}
      footer={false}
    >
      <DetailsView item={openItem} />
    </Modal>
  )
}

export default DetailModal
