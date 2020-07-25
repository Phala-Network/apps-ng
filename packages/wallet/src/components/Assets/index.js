import React from 'react'
import styled from 'styled-components'
import OnChainSection from './OnChainSection'
import OffChainSection from './OffChainSection'

const Divider = styled.div`
  height: ${props => props.height || 24}px;
`

export default () => {
  return <>
    <Divider height={21} />
    <OnChainSection />
    <Divider height={56} />
    <OffChainSection />
  </>
}