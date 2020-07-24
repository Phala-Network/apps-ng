import React from 'react'

import NormalPageWrapper from '@/components/NormalPageWrapper'
import Wallet from './components/Wallet'
import WalletLoader from './components/WalletLoader'

const WalletPage = () => {
  return <NormalPageWrapper>
    <WalletLoader>
      <Wallet />
    </WalletLoader>
  </NormalPageWrapper>
}

export default WalletPage
