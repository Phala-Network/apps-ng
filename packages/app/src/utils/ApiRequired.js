import PageLoading from '@/components/PageLoading'
import { useApi } from '@polkadot/react-hooks'

export default ({ children }) => {
  const { isApiConnected, isApiReady } = useApi()
  
  return (!isApiReady || !isApiConnected)
    ? <PageLoading />
    : children
}
