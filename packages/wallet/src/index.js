import React from 'react'

import Wallet from './components/Wallet'
import WalletLoader from './components/WalletLoader'

const WalletPage = () => {
  return (
    <WalletLoader>
      <Wallet />
    </WalletLoader>
  )
}

export default WalletPage
