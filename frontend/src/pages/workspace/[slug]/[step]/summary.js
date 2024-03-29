import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, List, Skeleton, Spin, Upload } from 'antd'
import { useRouter } from 'next/router'
import Link from 'next/link'
import classNames from 'classnames'
import { PageLayout } from '..'
import {
  DownloadFileIcon,
  PDFIcon,
  TrashIcon,
  UploadIcon,
} from '../../../../components/icons'
import styles from './summary.module.scss'
import api from '../../../../utils/api'
import { LoadingOutlined } from '@ant-design/icons'
import { stepsState } from '../../../../modules/workspace/ps/config'
import { loadCatalog } from '../../../../translations/utils'
import { Trans, t } from '@lingui/macro'

const { Dragger } = Upload

const acceptedFiles = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
]

const getBase64 = (file) => {
  return new Promise((resolve, reject) => {
    var reader = new FileReader()
    if (file) {
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = () => reject(reader.result)
    }
    if (!file) {
      reject('discard')
    }
  })
}

const UploadFile = ({ psItem, step }) => {
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [preload, setPreload] = useState(true)

  const handleFileChange = async ({ file }) => {
    setUploading(true)
    try {
      const base64 = await getBase64(file)
      await api.post(
        `/plastic-strategy/${psItem?.country?.isoCodeA2}/file?section_key=${step}`,
        {
          section_key: step,
          content: base64,
        }
      )
      setPreload(true)
      setUploading(false)
    } catch (error) {
      setUploading(false)
    }
  }

  const handleDeleteFile = async ({ id: fileID }) => {
    const _files = files.filter((f) => f?.id !== fileID)
    setFiles(_files)
    try {
      await api.delete(
        `/plastic-strategy/${psItem?.country?.isoCodeA2}/file?section_key=${step}`,
        {
          section_key: step,
          file_id: fileID,
        }
      )
    } catch (error) {
      console.error('Unable to remove the file', error)
    }
  }

  const getFiles = useCallback(async () => {
    if (!psItem?.id) {
      return
    }
    if (preload && psItem) {
      setPreload(false)
    }
    try {
      const { data } = await api.get(
        `/plastic-strategy/${psItem?.country?.isoCodeA2}/file?section_key=${step}`
      )
      const _files = data?.filter((d) => d?.sectionKey === step)
      setFiles(_files)
    } catch (error) {
      console.error('Unable to fetch all PS files,', error)
    }
  }, [psItem, preload])

  useEffect(() => {
    getFiles()
  }, [getFiles])

  return (
    <Skeleton loading={!psItem?.id} paragraph={{ rows: 3 }} active>
      <div className="upload-section">
        <h5>
          <Trans>Upload Your Report</Trans>
        </h5>
        {files.length ? (
          <List
            loading={preload}
            dataSource={files}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button
                    size="small"
                    type="link"
                    onClick={() => handleDeleteFile(item)}
                  >
                    <TrashIcon />
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Link href={item?.url} passHref legacyBehavior>
                      <div>
                        <DownloadFileIcon />
                      </div>
                    </Link>
                  }
                  title={`${item?.name}.${item?.extension}`}
                />
              </List.Item>
            )}
          />
        ) : (
          <Dragger
            accept={acceptedFiles.join(', ')}
            onChange={handleFileChange}
            beforeUpload={() => false}
            maxCount={1}
            showUploadList={false}
            className={classNames({ uploading })}
          >
            <Spin
              indicator={<LoadingOutlined size={64} />}
              spinning={uploading}
            >
              <p className="ant-upload-drag-icon">
                <UploadIcon />
              </p>
              <p className="ant-upload-hint">
                <Trans>Drop a file here</Trans>
                <br />
                <small>(pdf, excel, word or powerpoint)</small>
              </p>
              <Button size="small" shape="upload">
                <Trans>Browse</Trans>
              </Button>
            </Spin>
          </Dragger>
        )}
      </div>
    </Skeleton>
  )
}

const SummaryFiles = ({ psItem, step, slug }) => {
  /**
   * Check whether the current step has a bookmark sub-steps or not.
   * If true, then show the download button.
   */
  const hasBookmarkSteps = useMemo(() => {
    const currentStep = stepsState.find((s) => s?.slug === step)
    if (!currentStep?.substeps) {
      return false
    }
    return currentStep.substeps.filter((sub) => sub?.apiParams).length
  }, [step])

  if (!hasBookmarkSteps) {
    return null
  }

  return (
    <Skeleton loading={!psItem?.id} paragraph={{ rows: 3 }} active>
      <div className="summary-section">
        <h5>Section Summary</h5>
        <div>
          <Button
            icon={<PDFIcon />}
            href={`/workspace/${slug}/${step}/report`}
            shape="download"
            target="_blank"
            ghost
            size="small"
          >
            Download PDF
          </Button>
        </div>
      </div>
    </Skeleton>
  )
}

const View = ({ psItem }) => {
  const router = useRouter()
  const { slug, step } = router.query

  const currentStep = useMemo(() => {
    return stepsState.find((s) => s?.slug === step)
  }, [step, stepsState])

  const dict = {
    '2-stakeholder-consultation': t`summary-description-2-stakeholder-consultation`,
    '3-legislation-policy': t`summary-description-3-legislation-policy`,
    '4-data-analysis': t`summary-description-4-data-analysis`,
    '5-national-source': t`summary-description-5-national-source`,
    '6-national-plastic-strategy': t`summary-description-6-national-plastic-strategy`,
  }

  return (
    <div className={styles.summaryNReportView}>
      <div className="title-section">
        <h4 className="caps-heading-m">{currentStep?.label || ''}</h4>
        <h2 className="h-xxl w-bold">
          <Trans>Summary & Report</Trans>
        </h2>
      </div>
      <div className="desc-section">
        <p>{dict[step]}</p>
      </div>
      <SummaryFiles {...{ psItem, step, slug }} />
      <UploadFile {...{ psItem, step }} />
    </div>
  )
}

View.getLayout = PageLayout

export const getStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  }
}

export const getStaticProps = async (ctx) => {
  return {
    props: {
      i18n: await loadCatalog(ctx.locale),
    },
  }
}

export default View
