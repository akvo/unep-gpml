/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react'
import { Modal } from 'antd'
import styles from './modal.module.scss'
import DetailsView from './view'
import bodyScrollLock from './scroll-utils'
import { CloseIcon } from '../../components/icons'
import ProjectDetail from '../project-detail/project-detail'

const DetailModal = ({
  match,
  setLoginVisible,
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
      closable
      className={styles.detailModal}
      closeIcon={<CloseIcon />}
      wrapClassName="detail-modal-wrapper"
      destroyOnClose={true}
      centered={desktopViewport ? false : true}
      style={{
        top: desktopViewport ? 30 : 0,
      }}
      footer={false}
    >
      {match?.params?.type === 'project' && (
        <ProjectDetail
          data={match?.params?.item}
          isModal
          {...{ match, visible, isAuthenticated, setLoginVisible, setVisible }}
        />
      )}
      {match?.params?.type !== 'project' && (
        <DetailsView
          type={match?.params?.type}
          id={match?.params?.id}
          {...{
            match,
            visible,
            isAuthenticated,
            setLoginVisible,
            bookmark2PS,
            onBookmark2PS,
          }}
        />
      )}
    </Modal>
  )
}

export default DetailModal
