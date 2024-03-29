import { Form, Input, Select } from 'antd'
import { UIStore } from '../../store'
import Head from 'next/head'
import { useState } from 'react'
import { loadCatalog } from '../../translations/utils'

const Page = () => {
  const [values, setValues] = useState([])
  const { organisations } = UIStore.useState((s) => ({
    organisations: s.organisations,
  }))
  const filterOption = (input, option) =>
    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
  const handleChange = (vals) => {
    setValues(vals)
  }
  return (
    <>
      <Head>
        <title>Communities of Practice | UNEP GPML Digital Platform</title>
      </Head>
      <div>
        <div className="container">
          <div style={{ margin: 50 }}>
            <Form layout="vertical">
              <Form.Item label="Ids">
                <Input value={values.join(',')} />
              </Form.Item>
              <Form.Item label="Organisations">
                <Select
                  mode="multiple"
                  allowClear
                  style={{
                    width: '100%',
                  }}
                  placeholder="Please select"
                  filterOption={filterOption}
                  value={values}
                  onChange={handleChange}
                  options={organisations.map((it) => ({
                    value: it.id,
                    label: it.name,
                  }))}
                />
              </Form.Item>
            </Form>
          </div>
        </div>
      </div>
    </>
  )
}

export const getStaticProps = async (ctx) => {
  return {
    props: {
      i18n: await loadCatalog(ctx.locale),
    },
  }
}

export default Page
