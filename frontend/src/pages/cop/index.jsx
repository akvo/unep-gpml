import Head from 'next/head'
import styles from './index.module.scss'
import { PinDoc } from '../../components/icons'
import { Tag } from 'antd'
import Button from '../../components/button'
import { getStrapiUrl } from '../../utils/misc'
import { useCallback, useEffect, useState } from 'react'
import { ChatStore, UIStore } from '../../store'
import { loadCatalog } from '../../translations/utils'
import dynamic from 'next/dynamic'
import api from '../../utils/api'

const DynamicForumModal = dynamic(
  () => import('../../modules/forum/forum-modal'),
  {
    ssr: false, // modal has window object that should be run in client side
  }
)

const Page = ({ isAuthenticated, setLoginVisible, profile, setShouldJoin }) => {
  const strapiUrl = getStrapiUrl()
  const [cops, setCops] = useState(null)
  const [orgs, setOrgs] = useState(null)
  const [viewModal, setViewModal] = useState({ open: false })
  const [loading, setLoading] = useState(true)

  const { organisations, nonMemberOrganisations } = UIStore.useState((s) => ({
    organisations: s.organisations,
    nonMemberOrganisations: s.nonMemberOrganisations,
  }))

  useEffect(() => {
    fetch(`${strapiUrl}/api/cops?locale=en&populate=attachments`)
      .then((d) => d.json())
      .then((d) => {
        setCops(d.data.map((it) => ({ ...it.attributes, id: it.id })))
      })
  }, [])
  const handleOpenModal = (forumId) => () => {
    const data = allForums.find((it) => it.id === forumId)
    setViewModal({ open: true, data })
  }

  const allForums = ChatStore.useState((s) => s.allForums)
  const getAllForums = useCallback(async () => {
    try {
      if (!allForums.length && loading) {
        const { data: apiData } = await api.get('/chat/channel/all')
        const { channels: _allForums } = apiData || {}
        ChatStore.update((s) => {
          s.allForums = _allForums
        })
        setLoading(false)
      }
    } catch (error) {
      console.error('err', error)
      setLoading(false)
    }
  }, [loading, allForums])
  useEffect(() => {
    getAllForums()
  }, [getAllForums])

  return (
    <>
      <Head>
        <title>Communities of Practice | Global Plastics Hub</title>
      </Head>
      <div className={styles.page}>
        <div className="container" id="main-content">
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
                            {it.attributes.name}
                          </a>
                        </div>
                      ))}
                    </>
                  )}
                </div>
                <div className="col">
                  <div className="label">Lead</div>
                  <LinkTag
                    id={cop.lead}
                    orgs={[...organisations, ...nonMemberOrganisations]}
                  />
                  <div className="label">Members</div>
                  <div className="members">
                    {cop.members?.split(',').map((member) => (
                      <LinkTag
                        id={member}
                        orgs={[...organisations, ...nonMemberOrganisations]}
                      />
                    ))}
                  </div>
                  {allForums?.length > 0 && cop.forumId && (
                    <Button withArrow onClick={handleOpenModal(cop.forumId)}>
                      Become a Forum Member
                    </Button>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
      <DynamicForumModal
        {...{
          viewModal,
          setViewModal,
          setLoginVisible,
          isAuthenticated,
          profile,
          setShouldJoin,
        }}
      />
    </>
  )
}

const LinkTag = ({ id, orgs }) => {
  const org = orgs?.find((it) => it.id === Number(id))
  if (!org) return
  return (
    <a href={`/organisation/${org?.id}`} className="tag-link">
      {org?.name}
    </a>
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
