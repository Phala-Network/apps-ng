import AccountSelector from './components/AccountSelector'
import ApiRequired from '@/utils/ApiRequired'

function WalletPage () {
  return <ApiRequired>
    <p>'Hello Wallet!'</p>
    <AccountSelector />
  </ApiRequired>
}

export default WalletPage
