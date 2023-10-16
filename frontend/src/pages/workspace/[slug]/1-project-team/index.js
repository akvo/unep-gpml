import { PageLayout } from '..'

const View = () => (
  <>
    <h4 className="caps-heading-m">
      National steering committee & Project Team
    </h4>
    <h2 className="h-xxl w-bold">Introduction</h2>
    <iframe
      src="https://docs.google.com/presentation/d/e/2PACX-1vQNMz6tpUDzSsoriaREwket_z3Ti27CVMXy3ewl7sNziRm51AtnwF0n-3isgH6AiB4yIiX2s4JCy-hS/embed?start=false&loop=false&delayms=60000"
      frameborder="0"
      width="900"
      height="542"
      allowfullscreen="true"
      mozallowfullscreen="true"
      webkitallowfullscreen="true"
      style={{ marginTop: 30 }}
    ></iframe>
  </>
)

View.getLayout = PageLayout

export default View
