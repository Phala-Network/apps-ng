import { useStore } from '@/store'
import { observer } from 'mobx-react'

const Wallet = () => {
  const { walletRuntime } = useStore()
  return walletRuntime.latency
}

export default observer(Wallet)
