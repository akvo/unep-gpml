import React, { useState } from 'react'
import { UIStore } from '../../store'
import { Col, Row, Typography, Select, List } from 'antd'
import { Field } from 'react-final-form'
const { Title, Link } = Typography
import CatTagSelect from '../../components/cat-tag-select/cat-tag-select'
import { SearchIcon } from '../../components/icons'
import FormItem from '../../components/form-label'
import { Trans, t } from '@lingui/macro'

function FormThree({
  handleSeekingSuggestedTag,
  validate,
  error,
  handleRemove,
}) {
  const [filteredOptions, setFilteredOptions] = useState([])
  const [tagMode, setTagMode] = useState('tags')
  const storeData = UIStore.useState((s) => ({
    tags: s.tags,
  }))

  const { tags } = storeData

  const allOptions = Object.keys(tags)
    .map((k) => tags[k])
    .flat()
    .map((it) => it.tag)

  return (
    <>
      <div className="text-wrapper">
        <Title level={2}>
          <Trans>What are the expertises you are looking for?</Trans>
        </Title>
      </div>
      <div className="ant-form ant-form-vertical">
        <Field name="seeking" style={{ width: '100%' }}>
          {({ input, meta }) => {
            const hasError = error && !meta.valid
            const validVal = input?.value && meta.valid ? 'success' : null
            const validateStatus = hasError ? 'error' : validVal
            return (
              <FormItem for="offering" validateStatus={validateStatus}>
                <CatTagSelect
                  handleChange={handleSeekingSuggestedTag}
                  meta={meta}
                  error={error}
                  value={input.value ? input.value : undefined}
                  handleRemove={handleRemove}
                />
              </FormItem>
            )
          }}
        </Field>
        <Field name="seekingSuggested" style={{ width: '100%' }}>
          {({ input, meta }) => {
            const handleSearch = (value) => {
              const find = filteredOptions.find(
                (tag) => value.toLowerCase() == tag?.toLowerCase()
              )
              if (find) setTagMode('multiple')
              else setTagMode('tags')
              if (value.length < 2) {
                setFilteredOptions([])
              } else {
                const filtered = allOptions.filter(
                  (item) => item.toLowerCase().indexOf(value.toLowerCase()) > -1
                )
                setFilteredOptions(
                  filtered.filter((it, index) => filtered.indexOf(it) === index)
                )
              }
            }
            const hasError = error && !meta.valid
            const validVal = input?.value && meta.valid ? 'success' : null
            const validateStatus = hasError ? 'error' : validVal
            return (
              <FormItem
                for="offeringSuggested"
                className="label-text"
                label={<Trans>Can't see what you're looking for?</Trans>}
                validateStatus={validateStatus}
              >
                <Select
                  size="small"
                  placeholder={<Trans>Suggest categories</Trans>}
                  allowClear
                  showSearch
                  mode={tagMode}
                  showArrow
                  suffixIcon={<SearchIcon />}
                  notFoundContent={null}
                  onChange={(value) => input.onChange(value)}
                  onSearch={handleSearch}
                  value={input.value ? input.value : undefined}
                  className={`dont-show ${
                    error && !meta.valid ? 'ant-input-status-error' : ''
                  }`}
                >
                  {filteredOptions?.map((item) => (
                    <Select.Option value={item} key={item}>
                      {item}
                    </Select.Option>
                  ))}
                </Select>
              </FormItem>
            )
          }}
        </Field>
      </div>
    </>
  )
}

export default FormThree
