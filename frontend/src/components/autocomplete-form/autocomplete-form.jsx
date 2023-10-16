import React, { useCallback, useEffect, useState } from 'react'
import { List, Popover, Input } from 'antd'
import classNames from 'classnames'
import styles from './style.module.scss'
import api from '../../utils/api'
import { SearchIcon } from '../icons'

const DELAY = 500

const AutocompleteForm = ({
  apiUrl = '/community',
  apiParams = {},
  extraButton = {},
  onSelect,
  renderItem,
}) => {
  const [searchVal, setSearchVal] = useState(null)
  const [loading, setLoading] = useState(false)
  const [options, setOptions] = useState([])
  const [open, setOpen] = useState(false)
  const isEmpty = options.length === 0

  const searchingApi = useCallback(async () => {
    try {
      setLoading(true)
      const {
        data: { results },
      } = await api.get(apiUrl, {
        ...apiParams,
        q: searchVal,
      })
      const _options = Object.keys(extraButton)
        ? [
            ...results,
            {
              ...extraButton,
              onClick: () => {
                setOpen(false)
                if (extraButton?.onClick) extraButton.onClick()
              },
            },
          ]
        : results
      setOptions(_options)
      setLoading(false)
      if (!open) {
        setOpen(true)
      }
    } catch (error) {
      console.error('Unable to fetch by keyword', error)
      setLoading(false)
    }
  }, [searchVal])

  useEffect(() => {
    const timer = setTimeout(() => {
      searchingApi(searchVal)
    }, DELAY)

    return () => clearTimeout(timer)
  }, [searchingApi])
  return (
    <>
      <Popover
        placement="bottom"
        showArrow={false}
        overlayClassName={classNames(styles.popOverlay, {
          [styles.isEmpty]: isEmpty,
        })}
        trigger={['click']}
        visible={open}
        onVisibleChange={(isOpen) => {
          if (!isOpen && options.length) {
            setOptions([])
          }
          setOpen(isOpen)
        }}
        content={
          <List
            loading={loading}
            bordered={false}
            dataSource={options}
            renderItem={(item) => (
              <List.Item
                onClick={() => {
                  setOpen(false)
                  setOptions([])
                  if (onSelect) {
                    onSelect(item)
                  }
                }}
              >
                {renderItem(item)}
              </List.Item>
            )}
          />
        }
      >
        <Input
          placeholder="Start typing..."
          value={searchVal}
          className={styles.searchInput}
          onChange={(e) => setSearchVal(e.target.value)}
          suffix={<SearchIcon />}
          allowClear
        />
      </Popover>
    </>
  )
}

export default AutocompleteForm
