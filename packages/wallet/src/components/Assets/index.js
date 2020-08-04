import React from 'react'
import styled from 'styled-components'
import OnChainSection from './OnChainSection'
import OffChainSection from './OffChainSection'

// const Divider = styled.div`
//   height: ${props => props.height || 24}px;
// `

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  place-content: center;
  padding: 0 0;
`
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  place-content: flex-start;
  padding: 15px 0;
  width: 100%;
  height: 100%;
`

export default () => {
  return <Container>
    {/*<Divider height={21} />*/}
    <Wrapper>
      <OnChainSection />
      <OffChainSection />
    </Wrapper>

    {/*<Divider height={56} />*/}

  </Container>
}