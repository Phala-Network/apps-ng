import dynamic from 'next/dynamic'

const AppLoader = dynamic(
  () => import('@/components/AppLoader'),
  { ssr: false }
)

const DynamicRouteMatcher = props => {
  return <AppLoader {...props} />
}

DynamicRouteMatcher.getInitialProps = async () => {
  return {
    namespacesRequired: ['translation', 'phala'],
  }
}

export default DynamicRouteMatcher
