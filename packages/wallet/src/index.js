import React from 'react'

import Wallet from './components/Wallet'
import WalletLoader from './components/WalletLoader'
import UnlockRequired from '@/components/accounts/UnlockRequired'

const WalletPage = () => {
  return (
    <UnlockRequired>
      <WalletLoader>
        <Wallet />
      </WalletLoader>
    </UnlockRequired>
  )
}

export default WalletPage
