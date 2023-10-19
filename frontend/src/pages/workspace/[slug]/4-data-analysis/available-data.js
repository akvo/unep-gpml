import { PageLayout } from '..'

const View = () => {
  return (
    <>
      <h4 className="caps-heading-m">Data Analysis</h4>
      <h2 className="h-xxl w-bold">Available Data</h2>
      <iframe
        src="https://unepazgpmlblobstorage.z20.web.core.windows.net/GPML_HubHomePage_react/index.html"
        frameborder="0"
        width="100%"
        height="542"
        allowfullscreen="true"
        mozallowfullscreen="true"
        webkitallowfullscreen="true"
        style={{ marginTop: 30 }}
      ></iframe>
    </>
  )
}

View.getLayout = PageLayout

export default View
