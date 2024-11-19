import { Globe, LinkIcon, LocationPin } from '../../components/icons'

const ProjectDetail = ({ data }) => {
  console.log(data)
  return (
    <div className="container">
      <div className="head">
        <h5 className="h-caps-xs">project</h5>
        <h1>{data?.title}</h1>
        <div className="meta">
          {/* {data.country && (
            <div className="item location">
              <LocationPin />
              <span>
                {countries.find((it) => it.id === data.country)?.name}
              </span>
            </div>
          )} */}
          {data?.geoCoverageType && (
            <div className="item geo">
              <Globe />
              <span>{data.geoCoverageType}</span>
            </div>
          )}
          {data?.url && (
            <a href={data.url} target="_blank">
              <div className="item link">
                <LinkIcon />
                <span>{data.url}</span>
              </div>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProjectDetail
