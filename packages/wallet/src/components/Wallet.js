import React, { useCallback, useMemo } from 'react'
import styled from 'styled-components'
import Balance from './Balances'
import Assets from './Assets'

const Wallet = () => {
  return <WalletWrapper>
    <Assets />
  </WalletWrapper>
}

const WalletWrapper = styled.div`
  display: flex;
  box-sizing: border-box;
  flex-flow: column nowrap;
  min-height: 100%;
`

export default Wallet
