/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react'
import { Modal } from 'antd'
import styles from './modal.module.scss'
import DetailsView from './view'
import bodyScrollLock from './scroll-utils'

const DetailModal = ({
  match,
  setLoginVisible,
  setFilterMenu,
  isAuthenticated,
  visible,
  setVisible,
  bookmark2PS,
  onBookmark2PS,
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
      className={styles.detailModal}
      wrapClassName="detail-modal-wrapper"
      destroyOnClose={true}
      centered={desktopViewport ? false : true}
      style={{
        top: desktopViewport ? 30 : 0,
      }}
      footer={false}
    >
      <DetailsView
        type={match?.params?.type}
        id={match?.params?.id}
        {...{
          match,
          visible,
          setFilterMenu,
          isAuthenticated,
          setLoginVisible,
          bookmark2PS,
          onBookmark2PS,
        }}
      />
    </Modal>
  )
}

export default DetailModal
