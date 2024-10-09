import { useRouter } from 'next/router'
import { Result, Button } from 'antd'

const withAuth = (WrappedComponent) => {
  return ({ isAuthenticated, setLoginVisible, ...props }) => {
    const router = useRouter()

    if (!isAuthenticated) {
      return (
        <Result
          status="403"
          title="403"
          subTitle="Sorry, you are not authorized to access this page."
          extra={
            <Button type="primary" onClick={() => setLoginVisible(true)}>
              Login
            </Button>
          }
        />
      )
    }

    return <WrappedComponent {...props} />
  }
}

export default withAuth
