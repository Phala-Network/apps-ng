import dynamic from 'next/dynamic'

const AppLoader = dynamic(
  () => import('@/components/AppLoader'),
  { ssr: false }
)

export default props => {
  return <AppLoader {...props} />
}
