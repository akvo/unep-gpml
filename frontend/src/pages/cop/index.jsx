import Head from 'next/head'
import styles from './index.module.scss'
import { PinDoc } from '../../components/icons'
import { Tag } from 'antd'
import Button from '../../components/button'
import { getStrapiUrl } from '../../utils/misc'
import { useEffect, useState } from 'react'
import { UIStore } from '../../store'

const Page = () => {
  const strapiUrl = getStrapiUrl()
  const [cops, setCops] = useState(null)
  useEffect(() => {
    fetch(`${strapiUrl}/api/cops?locale=en&populate=attachments`)
      .then((d) => d.json())
      .then((d) => {
        setCops(d.data.map((it) => ({ ...it.attributes, id: it.id })))
      })
  }, [])
  return (
    <>
      <Head>
        <title>Communities of Practice | UNEP GPML Digital Platform</title>
      </Head>
      <div className={styles.page}>
        <div className="container">
          <div className="hero">
            <h1>Communities of Practice</h1>
            <p>
              Communities of Practice are group of experts who have shared
              interests and missions for specific topics. Each CoP provide the
              space for knowledge exchange and coordination to harness the
              potential synergies avoiding duplication. ​
            </p>
          </div>
          {cops != null &&
            cops.map((cop) => (
              <div className="cop-item" key={cop.id}>
                <div className="col">
                  <h3>{cop.name}</h3>
                  <p dangerouslySetInnerHTML={{ __html: cop.description }} />
                  {cop.attachments.data !== null && (
                    <>
                      <div className="label">Key outcome resources</div>
                      {cop.attachments.data.map((it) => (
                        <div className="link-item">
                          <a href={it.attributes.url}>
                            <PinDoc />
                            Download Report
                          </a>
                        </div>
                      ))}
                    </>
                  )}
                </div>
                <div className="col">
                  <div className="label">Lead</div>
                  <LinkTag id={cop.lead} />
                  <div className="label">Members</div>
                  <div className="members">
                    {cop.members?.split(',').map((member) => (
                      <LinkTag id={member} />
                    ))}
                  </div>
                  <Button withArrow>Become a Forum Member</Button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </>
  )
}

const LinkTag = ({ id }) => {
  const { organisations } = UIStore.useState((s) => ({
    organisations: s.organisations,
  }))
  const org = organisations.find((it) => it.id === Number(id))
  if (!org) return
  return (
    <a href={`/organisation/${org?.id}`} className="tag-link">
      {org?.name}
    </a>
  )
}

export default Page
